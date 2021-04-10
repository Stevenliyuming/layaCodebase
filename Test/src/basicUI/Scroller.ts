import { Image } from './Image';
import { BasicGroup } from "./BasicGroup";
import { BasicUIEvent } from "./BasicUIEvent";
import { ILayout, Point, Tween, Rectangle, Ease, Event, Sprite } from "./Layout";
import { Style } from "./Style";
import { UIColor } from "./UIColor";
import { UISkin } from "./UISkin";

/*
*滚动器，可以设置裁剪滚动的内容，分为横向和纵向滚动  
*/
export class Scroller extends BasicGroup implements ILayout {
	protected sliderBarV: Sprite;
	protected sliderBarH: Sprite;
	protected _content: Sprite;
	protected _contentPos: Point;
	protected viewPort: Sprite;
	/**
	 * verticle、horizontal、free三种滑动类型
	 */
	protected alignType: string;
	protected startPos: Point;
	protected stPos: Point;
	protected startTime: number;
	protected barVisible: boolean = false;
	protected mouseEnable: boolean = false;
	protected mouseOver: boolean = false;
	protected canvas: HTMLCanvasElement;
	protected mouseWheelFun: any;

	/**
	 * w:滚动容器宽
	 * h:滚动容器高
	 * content:滚动内容
	 * align:滑动条方向，水平、垂直、自由滚动
	 */
	public constructor(w: number, h: number, content: Sprite, align: string = Style.VERTICAL) {
		super();
		let s = this;
		s.width = w;
		s.height = h;
		s.addEventListener(BasicUIEvent.TOUCH_BEGIN, s.onTouch, s);
		s.startPos = new Point;
		s.stPos = new Point;
		s._contentPos = new Point;
		s.content = content;
		s.alignType = align;

		s.viewPort = UISkin.getRect(w, h, UIColor.white);
		s.addChildAt(s.viewPort, 0);
		s.viewPort.visible = false;

		s.layout(align);
	}

	protected onTouch(e: Event) {
		let s = this;
		switch (e.type) {
			case BasicUIEvent.TOUCH_BEGIN:
				s.stage.on(BasicUIEvent.TOUCH_MOVE, s, s.onTouch);
				s.stage.on(BasicUIEvent.TOUCH_END, s, s.onTouch);
				s.stPos.x = e.stageX;
				s.stPos.y = e.stageY;
				s.startPos.x = e.stageX - s._contentPos.x;
				s.startPos.y = e.stageY - s._contentPos.y;
				s.hideShow(1);
				s.startTime = Date.now();// egret.getTimer();
				break;
			case BasicUIEvent.TOUCH_MOVE:
				s.moveDo(e.stageX, e.stageY);
				break;
			case BasicUIEvent.TOUCH_END:
				s.stage.off(BasicUIEvent.TOUCH_MOVE, s, s.onTouch);
				s.stage.off(BasicUIEvent.TOUCH_END, s, s.onTouch);
				s.hideShow(0, 100);
				s.timeMove(e.stageX, e.stageY);
				break;
		}
	}

	/**是否可以鼠标控制滚动 在滚动容器为垂直滚动的条件下才生效*/
	public setMouseWheelEnable(value: boolean) {
		let s = this;
		if (s.mouseEnable == value) return;
		if (s.alignType != Style.FREE) {
			s.mouseEnable = value;
			if (s.mouseEnable) {
				s.addMouseEvent();
			} else {
				s.removeMouseEvent();
			}
		}
	}

	protected addMouseEvent() {
		let s = this;
		//s.addEventListener(mouse.MouseEvent.MOUSE_OVER, s.onMouseMoveEvent, s);
		//s.addEventListener(mouse.MouseEvent.MOUSE_OUT, s.onMouseMoveEvent, s);
		s.addCanvasEventListener("mousewheel", s.onMouseWheel, s);
	}

	protected removeMouseEvent() {
		let s = this;
		//s.removeEventListener(mouse.MouseEvent.MOUSE_OVER, s.onMouseMoveEvent, s);
		//s.removeEventListener(mouse.MouseEvent.MOUSE_OUT, s.onMouseMoveEvent, s);
		if (s.canvas && s.mouseWheelFun) {
			s.canvas.removeEventListener("mousewheel", s.mouseWheelFun);
		}
	}

	/**
	 * 添加Canvas事件监听
	 * 例如
	 * canvas.addEventListener('mousemove',(evt: MouseEvent)=>{});
	 */
	public addCanvasEventListener(type: string, fun: Function, funObj: any) {
		let s = this;
		if (!s.canvas) {
			s.canvas = <HTMLCanvasElement>document.getElementById("layaCanvas");
		}
		s.mouseWheelFun = fun.bind(funObj);
		s.canvas.addEventListener(type, s.mouseWheelFun);
	}

	protected onMouseWheel(evt: WheelEvent) {
		let s = this;
		let pos = s.globalToLocal(new Point(evt.x, evt.y), false);
		if (pos.x >= s.viewPort.x && pos.x <= s.viewPort.x + s.viewPort.width && pos.y >= s.viewPort.y && pos.y <= s.viewPort.y + s.viewPort.height) {
			s.mouseWheelMove(evt.deltaY);
			s.hideShow(1);
		} else {
			s.hideShow(0);
		}
	}

	//缓动动画
	protected timeMove(x: number, y: number): void {
		let s = this;
		if (s.alignType == Style.FREE) return;
		var time: number = Date.now() - s.startTime;
		if (time < 500) {
			var target: any = s._contentPos;
			Tween.clearTween(target);
			var dx: number = x - s.stPos.x;
			var dy: number = y - s.stPos.y;
			var distance: number = Math.sqrt(dx * dx + dy * dy);
			var value: number = (distance / time) * 100;
			if (s.alignType == Style.VERTICAL) {
				var sign: number = dy > 0 ? 1 : -1;
				value *= sign;
				var h: number = target.y + value;
				if (h > 0 && target.y + value > 0) h = 0;//向下滑动
				if (h < 0 && target.y + value < (s.viewPort.height - s._content.height)) h = s.viewPort.height - s._content.height;//向上滑动
				var tw = Tween.to(target, { y: h }, 400, Ease.sineOut, Laya.Handler.create(s, s.setBarPos));
				tw.update = Laya.Handler.create(s, s.onChangeUpdate, null, false);
			} else if (s.alignType == Style.HORIZONTAL) {
				var sign: number = dx > 0 ? 1 : -1;
				value *= sign;
				var w: number = target.x + value;
				if (w > 0 && target.x + value > 0) w = 0;//向右滑动
				if (w < 0 && target.x + value < (s.viewPort.width - s._content.width)) w = s.viewPort.width - s._content.width;//向左滑动
				var tw = Tween.to(target, { x: w }, 400, Ease.sineOut, Laya.Handler.create(s, s.setBarPos));
				tw.update = Laya.Handler.create(s, s.onChangeUpdate, null, false);
			}
		}
	}

	//缓动更新显示内容的位置
	private onChangeUpdate() {
		let s = this;
		let rect: Rectangle = s._content.scrollRect;
		rect.x = -s._contentPos.x;
		rect.y = -s._contentPos.y;
		s._content.scrollRect = rect;
		//console.log(rect);
	}

	//设置滚动条位置
	protected setBarPos(): void {
		let s = this;
		if (!s.barVisible) return;
		if (s.alignType == Style.VERTICAL)
			s.sliderBarV.y = -s._contentPos.y / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
		else if (s.alignType == Style.HORIZONTAL)
			s.sliderBarH.x = -s._contentPos.x / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
		else {
			s.sliderBarV.y = -s._contentPos.y / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
			s.sliderBarH.x = -s._contentPos.x / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
		}
	}

	protected hideShow(alpha: number, time: number = 1000): void {
		// let s = this;
		// if (!s.barVisible) return;
		// if (s.sliderBarV.alpha == alpha) return;
		// Tween.clearTween(s.sliderBarV);
		// if (alpha == 1) {
		// 	s.sliderBarV.alpha = 1;
		// } else {
		// 	Tween.to(s.sliderBarV, { alpha: alpha }, time);
		// }
	}

	protected moveDo(x: number, y: number): void {
		let s = this;
		if (s.alignType == Style.VERTICAL) {
			s.canMoveY(y);
		} else if (s.alignType == Style.HORIZONTAL) {
			s.canMoveX(x);
		} else {
			s.canMoveX(x);
			s.canMoveY(y);
		}
	}

	protected canMoveX(stageX: number): void {
		let s = this;
		var deltaWidth: number = s.viewPort.width - s._content.width;
		var xx = stageX - s.startPos.x;
		if (xx > deltaWidth && xx < 0) {
			s._contentPos.x = xx;
			let rect: Rectangle = s._content.scrollRect;
			rect.x = -xx;
			s._content.scrollRect = rect;
			s.sliderBarH.x = -xx / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
		}
	}

	protected canMoveY(stageY: number): void {
		let s = this;
		var deltaHeight: number = s.viewPort.height - s._content.height;
		var yy = stageY - s.startPos.y;
		if (yy > deltaHeight && yy < 0) {
			s._contentPos.y = yy;
			let rect: Rectangle = s._content.scrollRect;
			rect.y = -yy;
			s._content.scrollRect = rect;
			s.sliderBarV.y = -yy / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
		}
	}

	protected mouseWheelMove(deltaY: number) {
		let s = this;
		if (s.alignType == Style.VERTICAL) {
			let deltaHeight = s.viewPort.height - s._content.height;
			if (deltaHeight < 0) {
				let yy = s._contentPos.y;
				yy -= deltaY;
				if (yy < deltaHeight) {
					yy = deltaHeight;
				} else if (yy > 0) {
					yy = 0;
				}
				s._contentPos.y = yy;
				let rect: Rectangle = s._content.scrollRect;
				rect.y = -yy;
				s._content.scrollRect = rect;
				s.sliderBarV.y = -yy / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
			}
		} else if (s.alignType == Style.HORIZONTAL) {
			let deltaWidth = s.viewPort.width - s._content.width;
			if (deltaWidth < 0) {
				let xx = s._contentPos.x;
				xx -= deltaY;
				if (xx < deltaWidth) {
					xx = deltaWidth;
				} else if (xx > 0) {
					xx = 0;
				}
				s._contentPos.x = xx;
				let rect: Rectangle = s._content.scrollRect;
				rect.x = -xx;
				s._content.scrollRect = rect;
				s.sliderBarH.x = -xx / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
			}
		}
	}

	// protected setScrollRect(): void {
	// 	let s = this;
	// 	if (s._content) {
	// 		s._content.scrollRect = new Rectangle(0, 0, s.width, s.height);
	// 	}
	// }

	public layout(type: string = Style.VERTICAL, interval: number = 0): void {
		let s = this;
		s.alignType = type;
		if (s.alignType == Style.FREE) {
			s.setMouseWheelEnable(false);
		}
		if (s.content) {
			s.content.x = s.content.y = 0;
		}
	}

	/**重置滚动容器 */
	public reset() {
		let s = this;
		s.layout(s.alignType);
	}

	public set content(value: Sprite) {
		let s = this;
		if (s._content == value) return;
		if (s._content && s._content.parent) {
			if (s._content instanceof BasicGroup) s._content.removeFromParent(true);
			else s._content.parent.removeChild(s._content);
		}
		s._content = value;
		s._content.scrollRect = new Rectangle(0, 0, s.width, s.height);
		s.addChild(s._content);
		//s.setScrollRect();
	}
	public get content() {
		return this._content;
	}

	public setSliderBarSkins(barV: Sprite = null, barH: Sprite = null) {
		let s = this;
		//垂直滚动条
		if (s.sliderBarV && s.sliderBarV != barV) {
			if (s.contains(s.sliderBarV)) s.removeChild(s.sliderBarV);
		}
		s.sliderBarV = barV || UISkin.scrollBarV;
		if (s.sliderBarV) {
			s.addChild(s.sliderBarV);
		}
		//水平滚动条
		if (s.sliderBarH && s.sliderBarH != barH) {
			if (s.contains(s.sliderBarV)) s.removeChild(s.sliderBarH);
		}
		s.sliderBarH = barH || UISkin.scrollBarH;
		if (s.sliderBarH) {
			s.addChild(s.sliderBarH);
		}
		s.barVisible = true;

		if (s.alignType == Style.VERTICAL) {
			s.removeChild(s.sliderBarH);
		} else if (s.alignType == Style.HORIZONTAL) {
			s.removeChild(s.sliderBarV);
		}
		s.setSliderBarPos();
	}

	protected setSliderBarPos(): void {
		let s = this;
		if (s.alignType == Style.VERTICAL) {
			s.sliderBarV.x = s.viewPort.width - s.sliderBarV.width;
			s.sliderBarV.y = 0;
		} else if (s.alignType == Style.HORIZONTAL) {
			s.sliderBarH.x = 0;
			s.sliderBarH.y = s.viewPort.height - s.sliderBarH.height;
		} else {
			s.sliderBarV.x = s.viewPort.width - s.sliderBarV.width;
			s.sliderBarV.y = 0;
			s.sliderBarH.x = 0;
			s.sliderBarH.y = s.viewPort.height - s.sliderBarH.height;
		}
	}
}