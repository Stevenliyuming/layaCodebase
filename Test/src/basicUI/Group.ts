import ObjectPool from "../util/ObjectPool";
import { BasicGroup } from "./BasicGroup";
import { Texture, Rectangle, Sprite } from "./Layout";
import { Style } from "./Style";
import { Image } from "./Image";

/**
 * 带有默认背景的容器
 * 可以设置裁剪区域
 */
export class Group extends BasicGroup {
	/**
	 * 是否显示背景
	 */
	public _showBg: boolean = false;
	/**
	 * 默认背景的颜色
	 */
	private _bgColor: number = 0xCCCCCC;
	/**
	 * 默认背景的显示对象
	 */
	public _bgImage: Image = null;
	private _bgTexture: Texture = null;//背景材质
	//默认背景的显示对象九宫拉伸的设定
	private _scale9GridRect: Rectangle = null;//九宫拉伸的尺寸
	private scale9RectData: number[] = [];
	private _fillMode: string = "scale";//scale, repeat.
	/**
	 * 默认背景是否带边框
	 */
	private _border: boolean = false;
	/**
	 * 是否将子代剪切到视区的边界,
	 * 默认为true,剪切.
	 */
	private _clip: boolean = true;

	//没有像素点时是否能触发事件
	private _touchNonePixel: boolean = false;

	public constructor() {
		super();
	}

	/**
	 * 加入到显示列表时调用
	 * 子类可覆写该方法,添加UI逻辑
	 */
	public createChildren(): void {
		super.createChildren();
	}

	/**
	 * 默认样式色块颜色值. 
	 */
	public get bgColor(): number {
		return this._bgColor;
	}

	public set bgColor(value: number) {
		if (this._bgColor != value && this._showBg) {
			this._bgColor = value;
			this._bgTexture = null;
			this.invalidate();
		}
	}

	/**
	 * Sets/gets the fillMode of the scale9Grid bitmap.(scale|repeat)
	 */
	public get fillMode(): string {
		return this._fillMode;
	}
	public set fillMode(value: string) {
		if (this._fillMode != value) {
			this._fillMode = value;
			this.invalidate();
		}
	}

	/**
	 * 设置默认背景是否显示
	 */
	public set showBg(value: boolean) {
		if (this._showBg != value) {
			this._showBg = value;
			//console.log("!!!Group set showDefaultSkin=" + this._showDefaultSkin)
			this.invalidate();
		}
	}
	public get showBg(): boolean {
		return this._showBg;
	}

	/**
	 * 设置剪裁
	 * @param value
	 */
	public set clip(value: boolean) {
		if (value != this._clip) {
			this._clip = value;
			this.invalidate();
		}
	}
	public get clip(): boolean {
		return this._clip;
	}

	/**
	 * 更新显示组件的各项属性,重新绘制显示
	 */
	public draw(): void {
		//console.log("Group draw");
		let s = this;
		if (s.width == 0 || s.height == 0) return;
		super.draw();
		//console.log("Group draw this._clip=" + this._clip + ", _showBg=" + this._showBg);
		if (s._clip) {//剪裁
			var rect: Rectangle = ObjectPool.getByClass(Rectangle);
			if (s.scrollRect) {
				ObjectPool.recycleClass(s.scrollRect);
				s.scrollRect = null;
			}
			rect.width = s.width;
			rect.height = s.height;
			rect.x = 0;
			rect.y = 0;
			s.scrollRect = rect;
		} else {
			s.scrollRect = null;
		}

		//console.log("Group draw this._showDefaultSkin=" + this._showDefaultSkin);
		if (s._showBg || s._touchNonePixel) {
			s.addDefaultSkin();
			if (s._bgImage) {
				s._bgImage.visible = true;
				if (s._touchNonePixel && !s._showBg) {//如果设置没有像素点能触发事件 并且没有设置默认样式 则设置alpha=0即可
					s._bgImage.alpha = 0;
				} else {
					s._bgImage.alpha = 1;
				}
			}
		} else {
			if (s._bgImage) {
				s._bgImage.visible = false;
				if (s._bgImage.parent) {
					s._bgImage.parent.removeChild(s._bgImage);
				}
			}
		}
	}

	/**
	 * 创建背景应用的quad 用于showdefaultskin显示 
	 */
	private addDefaultSkin(): void {
		//console.log("Group addDefaultSkin this.width=" + this.width + ", this.height=" + this.height)
		let s = this;
		if (s.width > 0 && s.height > 0) {
			if (s._bgImage == null) {
				s._bgImage = new Image;
			}
			if (s._bgTexture == null) {//生成默认材质
				s._bgImage.fillMode = Style.SCALE;//拉伸放大方式铺满
				var shape: Sprite = new Sprite;
				shape.width = s.width;
				shape.height = s.height;
				//shape.graphics.beginFill(s._bgColor, 1);
				shape.graphics.drawRect(0, 0, s.width, s.height, s._bgColor);
				//shape.graphics.endFill();
				// if (s._border) {
				// 	shape.graphics.lineStyle(1, 0x00ff00, 1);
				// 	shape.graphics.drawRect(0, 0, s.width, s.height);
				// }
				var htmlC: Laya.HTMLCanvas = shape.drawToCanvas(shape.width, shape.height, 0, 0);
				//获取texture
				s._bgTexture = new Laya.Texture(htmlC.getTexture());
				s._bgImage.texture = s._bgTexture;
			} else {
				s._bgImage.texture = s._bgTexture;
			}
		}

		if (s._bgImage && (s._showBg || s._touchNonePixel)) {
			if (!s._bgImage.parent) s.addChildAt(s._bgImage, 0);
			if (s.scale9RectData.length == 4) {
				// if(s._scale9GridRect == null) s._scale9GridRect = s.scale9Rect();
				// s._scale9GridRect.x = s.scale9RectData[0];
				// s._scale9GridRect.y = s.scale9RectData[2];
				// s._scale9GridRect.width = s._bgImage.texture.$getTextureWidth() - (s.scale9RectData[0] + s.scale9RectData[1]);
				// s._scale9GridRect.height = s._bgImage.texture.$getTextureHeight() - (s.scale9RectData[2] + s.scale9RectData[3]);
				// s._bgImage.scale9Grid = s._scale9GridRect;
				s._bgImage.scale9Grid(s.scale9RectData);
			} else {
				s._bgImage.scale9Grid = null;
			}
			s._bgImage.width = s.width;
			s._bgImage.height = s.height;
			s._bgImage.fillMode = s._fillMode;
		}
	}

	/**
	 * 默认皮肤的边框显示
	 * true, 显示边框;false,不显示边框.
	 * @param value
	 *
	 */
	public set border(value: boolean) {
		if (this._border != value) {
			this._border = value;
			this.invalidate();
		}
	}
	public get border(): boolean {
		return this._border;
	}

	/**
	 * 获取背景图显示对象
	 * @returns {Image}
	 */
	public getDefaultSkin(): Image {
		return this._bgImage;
	}

	/**
	 * 背景的默认材质
	 * 会取代自动绘制的背景图
	 * @param value
	 */
	public set bgTexture(value: Texture) {
		if (this._bgTexture != value) {
			this._bgTexture = value;
			this.invalidate();
		}
	}
	public get bgTexture(): Texture {
		return this._bgTexture;
	}

	public get touchNonePixel(): boolean {
		return this._touchNonePixel;
	}
	/**
	 * 无像素时是否能触发事件
	 */
	public set touchNonePixel(value: boolean) {
		if (value != this._touchNonePixel) {
			this._touchNonePixel = value;
			this.invalidate();
		}
	}

	/**
	 * scale9Rectangle : [左边距,右边距,上边距,下边距]
	 * 
	 */
	public scale9Grid(scale9RectData: number[] = []) {
		let s = this;
		if (scale9RectData.length == 4) {
			this.scale9RectData = scale9RectData.concat();
		} else {
			this.scale9RectData.length = 0;
		}
		this.invalidate();
	}

	private scale9Rect() {
		let rect = new Rectangle();
		rect.x = 1;
		rect.y = 1;
		rect.width = 1;
		rect.height = 1;
		return rect;
	}
}