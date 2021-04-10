import Global from "../util/Global";
import { BasicUIEvent } from "./BasicUIEvent";
import { DisplayObjectContainer, Point, Sprite } from "./Layout";

export class BasicGroup extends Sprite {
	//是否已加入过显示列表中,可用来判断各组件是否已经具备显示赋值的作用
	private _isAddedToStage: boolean = false;
	private _top: number = NaN;
	private _left: number = NaN;
	private _bottom: number = NaN;
	private _right: number = NaN;
	private _horizontalCenter: number = NaN;
	private _verticalCenter: number = NaN;
	//是否重新计算位置布局
	protected _hasInvalidatePosition: boolean = false;
	//延迟绘制
	private _drawDelay: boolean = false;
	//是否下一帧重绘
	private _hasInvalidate: boolean = false;
	//不可用状态
	private _enabled: boolean = true;
	//可携带的数据
	public _data: any = null;
	private dataEvent: Object = new Object;
	private elements: Sprite[] = [];

	public static $hashCode: number = 0;
	public hashCode: number = 0;

	public constructor() {
		super();
		let s = this;
		s.hashCode = ++BasicGroup.$hashCode;
		// s.addEventListener(BasicUIEvent.ADDED_TO_STAGE, s.onAddToStage, s);
		//console.log("this._drawDelay=" + this._drawDelay)
	}

	/**
	 * 第一次加入场景的时候会运行该方法
	 */
	public onEnable(): void {
		super.onEnable();
		let s = this;
		s._isAddedToStage = true;
		s.createChildren();
		s.initData();
		s.onInvalidatePosition();
		s.invalidate();
		//console.log("222222this._drawDelay=" + this._drawDelay)
	}

	public onDisable() {
		super.onDisable();
	}

	/**
	 * 加入场景的时候会调用该方法
	 */
	// public onAddToStage(event: Event): void {
	// 	let s = this;
	// 	s._isAddedToStage = true;
	// 	s.removeEventListener(BasicUIEvent.ADDED_TO_STAGE, s.onAddToStage, s);
	// 	s.createChildren();
	// 	s.initData();
	// 	s.onInvalidatePosition();
	// 	s.invalidate();
	// 	//console.log("222222this._drawDelay=" + this._drawDelay)
	// }

	/**
	 * 加入到显示列表时调用
	 * 子类覆写该方法,添加UI逻辑
	 */
	public createChildren(): void {
		let s = this;
		//s.touchEnabled = false;//默认不接受事件
		//this.setSize(Style.BASEGROUP_WIDTH, Style.BASEGROUP_HEIGHT);
	}

	/**
	 * 初始化一些必要的逻辑数据
	 * 加入到显示列表的时候会调用
	 */
	public initData(): void {
	}

	/**
	 * 覆写width方法,在width改变的时候,做逻辑运算
	 * @param w
	 */
	public set width(w: number) {
		if (w >= 0) {
			super.set_width(w);
			this.onInvalidatePosition();
			this.invalidate();
		}
	}
	public get width(): number {
		return this.get_width();
	}

	/**
	 * 覆写height方法,在height改变的时候,做逻辑运算
	 * @param h
	 */
	public set height(h: number) {
		if (h >= 0) {
			super.set_height(h);
			this.onInvalidatePosition();
			this.invalidate();
		}
	}
	public get height(): number {
		return this.get_height();
	}

	/**
	 * 设置宽高
	 * @param w 宽
	 * @param h 高
	 */
	public setSize(w: number, h: number): void {
		let s = this;
		if (s.width != w || s.height != h) {
			s.width = w;
			s.height = h;
			s.onInvalidatePosition();
			s.invalidate();
		}
	}

	public get top(): number {
		return this._top;
	}
	/**
	 * 设置顶距
	 */
	public set top(value: number) {
		let s = this;
		if (s._top != value) {
			s._top = value;
			s.onInvalidatePosition();
		}
	}

	/**
	 * 设置左距
	 */
	public get left(): number {
		return this._left;
	}

	public set left(value: number) {
		let s = this;
		if (s._left != value) {
			s._left = value;
			s.onInvalidatePosition();
		}
	}

	public get bottom(): number {
		return this._bottom;
	}
	/**
	 * 设置底距
	 */
	public set bottom(value: number) {
		let s = this;
		if (s._bottom != value) {
			s._bottom = value;
			s.onInvalidatePosition();
		}
	}

	public get right(): number {
		return this._right;
	}
	/**
	 * 设置右距
	 */
	public set right(value: number) {
		let s = this;
		if (s._right != value) {
			s._right = value;
			s.onInvalidatePosition();
		}
	}

	public get horizontalCenter(): number {
		return this._horizontalCenter;
	}
	/**
	 * 设置水平居中相对位置
	 */
	public set horizontalCenter(value: number) {
		let s = this;
		if (s._horizontalCenter != value) {
			s._horizontalCenter = value;
			s.onInvalidatePosition();
		}
	}

	public get verticalCenter(): number {
		return this._verticalCenter;
	}
	/**
	 * 设置竖直居中相对位置
	 */
	public set verticalCenter(value: number) {
		let s = this;
		if (s._verticalCenter != value) {
			s._verticalCenter = value;
			s.onInvalidatePosition();
		}
	}

	/**
	 * 设置是否下一帧计算相对位置
	 */
	public onInvalidatePosition(): void {//重新计算布局位置
		//console.log("onInvalidatePosition 000 name=" + this.name);
		//if (this._drawDelay) return;
		let s = this;
		if (!s._hasInvalidatePosition) {
			//console.log("onInvalidatePosition 111 name=" + this.name);
			s._hasInvalidatePosition = true;
			Laya.timer.frameLoop(1, s, s.resetPosition);
			let child: any;
			for (var i: number = 0; i < s.numChildren; i++) {
				child = s.getChildAt(i);
				if (child instanceof BasicGroup) {
					child.onInvalidatePosition();
				}
			}
		}
	}

	/**
	 * 容器相对位置刷新
	 */
	public resetPosition(): void {
		let s = this;
		//console.log("resetPosition name=" + s.name);
		var pr: DisplayObjectContainer = <DisplayObjectContainer>s.parent;
		if (pr != null) {
			var parentWidth: number = pr.width;
			var parentHeight: number = pr.height;
			var thisWidth: number = s.width;
			var thisHeight: number = s.height;
			//为了保证得到的宽高是数值型,这里进行了严格的检测
			if (isNaN(parentWidth) || parentHeight == undefined) {
				parentWidth = 0;
			}
			if (isNaN(parentHeight) || parentHeight == undefined) {
				parentHeight = 0;
			}

			if (isNaN(thisWidth) || thisWidth == undefined) {
				thisWidth = 0;
			}
			if (isNaN(thisHeight) || thisHeight == undefined) {
				thisWidth = 0;
			}

			var widthChanged: boolean = false;//宽度有改变
			var heightChanged: boolean = false;//高度有改变
			if (!isNaN(s._top) && isNaN(s._bottom)) {
				s.y = s._top;
			} else if (!isNaN(s._bottom) && isNaN(s._top)) {
				s.y = parentHeight - s._bottom - thisHeight;
			} else if (!isNaN(s._top) && !isNaN(s._bottom)) {
				s.y = s._top;
				thisHeight = parentHeight - s._top - s._bottom;
				if (s.height != thisHeight) {
					s.height = thisHeight;
					heightChanged = true;
				}
			}

			if (!isNaN(s._left) && isNaN(s._right)) {
				s.x = s._left;
			} else if (!isNaN(s._right) && isNaN(s.left)) {
				s.x = parentWidth - s._right - thisWidth;
			} else if (!isNaN(s.left) && !isNaN(s._right)) {
				s.x = s._left;
				thisWidth = parentWidth - s._left - s._right;
				if (s.width != thisWidth) {
					s.width = thisWidth;
					widthChanged = true;
				}
			}

			if (!isNaN(s._horizontalCenter) && !widthChanged) {//宽度有改变的情况下(左右拉伸),水平居中不再生效
				s.x = (parentWidth - thisWidth) / 2 + s._horizontalCenter;
				//console.log("this._horizontalEnabled=" + this._horizontalEnabled + ", x=" + this._x);
			}
			if (!isNaN(s._verticalCenter) && !heightChanged) {//高度有改变的情况下(上下拉伸),竖直居中不再生效
				s.y = (parentHeight - thisHeight) / 2 + s._verticalCenter;
				//console.log("this._verticalEnabled=" + this._verticalEnabled + ", y=" + this._y);
			}

			//改变子级布局
			// if (widthChanged || heightChanged) {
			// 	let child: any;
			// 	for (var i: number = 0; i < s.numChildren; i++) {
			// 		child = s.getChildAt(i);
			// 		if ((widthChanged || heightChanged) && child instanceof BaseGroup) {
			// 			child.onInvalidatePosition();
			// 		}
			// 	}
			// }

			//添加具有约束布局的元素
			if (s.elements.length > 0) {
				for (let i = 0; i < s.elements.length; ++i) {
					super.addChild(s.elements[i]);
				}
				s.elements.length = 0;
			}

			let child: any;
			for (let i: number = 0, num = s.numChildren; i < num; i++) {
				child = s.getChildAt(i);
				if ((widthChanged || heightChanged) && Global.is(child, "BasicGroup")) {
					child.onInvalidatePosition();
				} else {
					if (Global.is(child, "Laya.UIComponent")) {
						BasicGroup.resetChildPosition(child);
					}
				}
			}
		}
		Laya.timer.clear(s, s.resetPosition);
		s._hasInvalidatePosition = false;
	}

	private static resetChildPosition(child: DisplayObjectContainer) {
		var pr: DisplayObjectContainer = <DisplayObjectContainer>child.parent;
		//确保是白鹭具有布局约束的组件
		if (pr != null && child['top'] !== undefined && child['bottom'] !== undefined && child['left'] !== undefined && child['right'] !== undefined && child['horizontalCenter'] !== undefined && child['verticalCenter'] !== undefined) {
			var parentWidth: number = pr.width;
			var parentHeight: number = pr.height;
			var thisWidth: number = child.width;
			var thisHeight: number = child.height;
			//为了保证得到的宽高是数值型,这里进行了严格的检测
			if (isNaN(parentWidth) || parentHeight == undefined) {
				parentWidth = 0;
			}
			if (isNaN(parentHeight) || parentHeight == undefined) {
				parentHeight = 0;
			}

			if (isNaN(thisWidth) || thisWidth == undefined) {
				thisWidth = 0;
			}
			if (isNaN(thisHeight) || thisHeight == undefined) {
				thisWidth = 0;
			}

			var widthChanged: boolean = false;//宽度有改变
			var heightChanged: boolean = false;//高度有改变
			if (!isNaN(child['top']) && isNaN(child['bottom'])) {
				child.y = child['top'];
			} else if (!isNaN(child['bottom']) && isNaN(child['top'])) {
				child.y = parentHeight - child['bottom'] - thisHeight;
			} else if (!isNaN(child['top']) && !isNaN(child['bottom'])) {
				child.y = child['top'];
				thisHeight = parentHeight - child['top'] - child['bottom'];
				if (child.height != thisHeight) {
					child.height = thisHeight;
					heightChanged = true;
				}
			}

			if (!isNaN(child['left']) && isNaN(child['right'])) {
				child.x = child['left'];
			} else if (!isNaN(child['right']) && isNaN(child['left'])) {
				child.x = parentWidth - child['right'] - thisWidth;
			} else if (!isNaN(child['left']) && !isNaN(child['right'])) {
				child.x = child['left'];
				thisWidth = parentWidth - child['left'] - child['right'];
				if (child.width != thisWidth) {
					child.width = thisWidth;
					widthChanged = true;
				}
			}

			if (!isNaN(child['horizontalCenter']) && !widthChanged) {//宽度有改变的情况下(左右拉伸),水平居中不再生效
				child.x = (parentWidth - thisWidth) / 2 + child['horizontalCenter'];
				//console.log("this._horizontalEnabled=" + this._horizontalEnabled + ", x=" + this._x);
			}
			if (!isNaN(child['verticalCenter']) && !heightChanged) {//高度有改变的情况下(上下拉伸),竖直居中不再生效
				child.y = (parentHeight - thisHeight) / 2 + child['verticalCenter'];
				//console.log("this._verticalEnabled=" + this._verticalEnabled + ", y=" + this._y);
			}

			//改变子级布局
			if (widthChanged || heightChanged) {
				if (child.numChildren == undefined) return;
				let temp: any;
				for (let i: number = 0, num = child.numChildren; i < num; i++) {
					temp = child.getChildAt(i);
					if (temp instanceof BasicGroup) {
						temp.onInvalidatePosition();
					} else {
						BasicGroup.resetChildPosition(temp);
					}
				}
			}
		}
	}

	public addChild(child: Sprite): Sprite {
		let s = this;
		if (child.parent === s) {
			console.warn("子元素不能重复添加到同一个父级节点中");
			return;
		}
		if (Global.is(child, "Laya.UIComponent")) {
			if (s.elements.indexOf(child) >= 0) {
				console.warn("子元素不能重复添加到同一个父级节点中");
				return;
			}
			s.elements.push(child);
		} else {
			super.addChild(child);
		}
		//super.addChild(child);
		s.onInvalidatePosition();
	}

	public addEventListener(type: string, listener: Function, thisObject: any, useCapture?: boolean, priority?: number): any {
		//return super.$addListener(type, listener, thisObject, useCapture, priority);
		this.on(type, thisObject, listener);
	}

	public removeEventListener(type: string, listener: Function, thisObject: any, useCapture?: boolean): void {
		//return super.removeEventListener(type, listener, thisObject, useCapture);
		this.off(type, thisObject, listener);
	}

	public dispatchEventWith(type: string, bubbles?: boolean, data?: any, cancelable?: boolean): boolean {
		//return super.dispatchEventWith(type, bubbles, data, cancelable);
		this.event(type, data);
		return true;
	}

	/**
	 * 可设置的携带数据
	 */
	public get data(): any {
		return this._data;
	}
	public set data(value: any) {
		this._data = value;
	}

	/**
	 * 清理数据
	 */
	public clean(): void {
	}

	/**
	* 设置enabled状态
	* @return
	*/
	public get enabled(): boolean {
		return this._enabled;
	}
	public set enabled(value: boolean) {
		this._enabled = value;
	}

	/**
	 * 中心x位置
	 * @returns {number}
	 */
	public get cx(): number {
		return this.width / 2;
	}
	/**
	 * 中心y位置
	 * @returns {number}
	 */
	public get cy(): number {
		return this.height / 2;
	}

	/**
	 * 返回全局x,y值
	 * @returns {Point}
	 */
	public getGlobalXY(): Point {
		let s = this;
		let point: Point = new Point(s.pivotX, s.pivotY);
		this.localToGlobal(point, false);
		return point;
	}

	/**
	 * 返回实际宽度
	 * @returns {number}
	 */
	public get actualWidth(): number {
		return this.width * this.scaleX;
	}

	/**
	 * 返回实际高度
	 * @returns {number}
	 */
	public get actualHeight(): number {
		return this.height * this.scaleX;
	}

	/**
	 * 重绘通知
	 */
	public invalidate(): void {
		//当前无效标识状态_hasInvalidate为flase(即还没有进行延时绘制)并且没有设置延迟绘制标识_drawDelay
		let s = this;
		if (!s._hasInvalidate && !s._drawDelay) {
			//console.log("add invalidate draw")
			Laya.timer.frameLoop(1, s, s.onInvalidate);
			s._hasInvalidate = true;
		}
	}

	/**
	 * 重绘
	 * 外部可以调用此接口立即执行重绘以达到一些数据的计算
	 */
	public onInvalidate(event: Event): void {
		let s = this;
		s.draw();
		Laya.timer.clear(s, s.onInvalidate);
		s._hasInvalidate = false;
	}

	public draw(): void {
		//console.log("draw name=" + this.name);
	}

	/**
	 * 设置延迟draw
	 * @param delay
	 */
	public set drawDelay(delay: boolean) {
		//console.log("drawDelay=" + delay)
		let s = this;
		s._drawDelay = delay;
		if (s._drawDelay) {
			s.off(Laya.Event.FRAME, s, s.onInvalidate);
			s._hasInvalidate = false;
		} else {
			s.invalidate();
		}
	}

	public get drawDelay(): boolean {
		return this._drawDelay;
	}

	/**
	 * 判断曾经加入过显示列表中
	 * 可以用来判断各属性是否已经准备好显示和使用
	 * @returns {boolean}
	 */
	public get isAddedToStage(): boolean {
		return this._isAddedToStage;
	}

	/**分发事件*/
	public dispEvent(type: string, data: Object = null): void {
		if (this.dataEvent) {
			var fun: Function = this.dataEvent[type] as Function;
			if (fun != null) {
				var evt: BasicUIEvent = new BasicUIEvent;
				evt.currentTarget = this;
				evt.data = data;
				evt.type = type;
				if (fun["this"]) {
					(<Function>fun).apply(fun["this"], [evt]);
				} else {
					fun(evt)
				}
			}
		}
	}

	/**帧听事件*/
	public addEvent(type: string, listener: Function, thisObj: any = null): void {
		let s = this;
		if (s.dataEvent && s.dataEvent[type] == null) {
			listener["this"] = thisObj
			s.dataEvent[type] = listener;
		}
	}

	/**删除事件*/
	public removeEvent(type: string, listener: Function): void {
		let s = this;
		if (s.dataEvent && s.dataEvent[type]) {
			delete s.dataEvent[type];
		}
	}

	/**把自己从父级删除*/
	public removeFromParent(dispose: boolean = false): void {
		let s = this;
		let _parent = this.parent;
		if (dispose) s.dispose();
		if (_parent) _parent.removeChild(s);
		_parent = null;
	}

	/**删除所有的子节点*/
	public removeChildAll(dispose: boolean = false): void {
		let s = this;
		while (s.numChildren > 0) {
			s.removeChildIndex(0, dispose);
		}
	}

	/**删除index层的子节点*/
	public removeChildIndex(index: number, dispose: boolean): void {
		let s = this;
		if (index >= 0 || index < s.numChildren) {
			let child: any = s.getChildAt(index);
			if (child instanceof BasicGroup) {
				child.removeFromParent(dispose);
			} else {
				let display: Sprite = <Sprite>this.getChildAt(index);
				if (display.parent) display.parent.removeChild(display);
			}
		}
	}

	/**销毁*/
	public dispose(): void {
		let s = this;
		s.removeChildAll(true);
	}

	/**
	 * 获取xy位置的像素值,xy是舞台值
	 * @param x
	 * @param y
	 */
	public getPixel32(x: number, y: number): Uint8Array {
		return null;
	}

	/**
	 * 检测xy位置的像素值是否透明,xy是舞台值
	 * @param x 舞台值
	 * @param y 舞台值
	 * @return true:有像素值, false:无像素值
	 */
	public testPixel32(x: number, y: number): boolean {
		let s = this;
		var datas: Uint8Array = s.getPixel32(x, y);
		for (var i: number = 0; i < datas.length; i++) {
			if (datas[i] > 0) {
				return true;
			}
		}
		return false;
	}
}