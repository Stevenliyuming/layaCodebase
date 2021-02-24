import Global from "../util/Global";

export default class BaseUIComponent extends Laya.Sprite {
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

	public _data: any = null;//可携带的数据
	private _enabled: boolean = true;//不可用状态

	private elements: Laya.Sprite[] = [];

	public static $hashCode:number = 0;
	public hashCode:number = 0;

	public constructor() {
		super();
		let s = this;
		s.hashCode = ++BaseUIComponent.$hashCode;
		s._drawDelay = false;
		s._isAddedToStage = false;
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
	 * 初始化一些必要的逻辑数据
	 * 这个方法是在第一次加入stage的时候,做调用
	 */
	public initData(): void {
	}

	/**
	 * 初始化主场景的组件
	 * 子类覆写该方法,添加UI逻辑
	 */
	public createChildren(): void {
		//this.setSize(Style.BASEGROUP_WIDTH, Style.BASEGROUP_HEIGHT);
	}

	/**
	 * 覆写width方法,在width改变的时候,做逻辑运算
	 * @param w
	 */
	public set width(w: number) {
		if (w >= 0) {
			super.set_width(w);
			//if (this._anchorX != 0) this.anchorOffsetX = w * this._anchorX;
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
			//if (this._anchorY != 0) this.anchorOffsetY = h * this._anchorY;
			this.onInvalidatePosition();
			this.invalidate();
		}
	}

	public get height(): number {
		return this.get_height();
	}

	/**
	 * Sets the size of the component.
	 * @param w The width of the component.
	 * @param h The height of the component.
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

	///////////////////////////////////
	// 组件相对布局设置
	///////////////////////////////////
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
			//s.on(Laya.Event.FRAME, s, s.resetPosition);
			let child: any;
			for (var i: number = 0; i < s.numChildren; i++) {
				child = s.getChildAt(i);
				if (child instanceof BaseUIComponent) {
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
		var pr: Laya.Sprite = <Laya.Sprite>s.parent;
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

			//添加具有约束布局的元素
			if (s.elements.length > 0) {
				for (let i = 0; i < s.elements.length; ++i) {
					this.addChild(s.elements[i]);
				}
				s.elements.length = 0;
			}

			let child: any;
			for (var i: number = 0; i < s.numChildren; i++) {
				child = s.getChildAt(i);
				if ((widthChanged || heightChanged) && child instanceof BaseUIComponent) {
					child.onInvalidatePosition();
				} else {
					// var proto = Object.getPrototypeOf(child);
					// var targetProto = Object.getPrototypeOf(Laya.UIComponent);
					if(child instanceof Laya.UIComponent) {
						BaseUIComponent.resetChildPosition(child);
					}
					// let className = Global.getQualifiedClassName(child);
					// if (className === "laya.ui.UIComponent") {
					// 	BaseUIComponent.resetChildPosition(child);
					// }
				}
			}
		}
		Laya.timer.clear(s, s.resetPosition);
		s._hasInvalidatePosition = false;
	}

	private static resetChildPosition(child: Laya.Sprite) {
		var pr: Laya.Sprite = <Laya.Sprite>child.parent;
		if (pr != null && child['top'] !== undefined && child['bottom'] !== undefined && child['left'] !== undefined && child['right'] !== undefined && child['centerX'] !== undefined && child['centerY'] !== undefined) {
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

			if (!isNaN(child['centerX']) && !widthChanged) {//宽度有改变的情况下(左右拉伸),水平居中不再生效
				child.x = (parentWidth - thisWidth) / 2 + child['centerX'];
				//console.log("this._horizontalEnabled=" + this._horizontalEnabled + ", x=" + this._x);
			}
			if (!isNaN(child['centerY']) && !heightChanged) {//高度有改变的情况下(上下拉伸),竖直居中不再生效
				child.y = (parentHeight - thisHeight) / 2 + child['centerY'];
				//console.log("this._verticalEnabled=" + this._verticalEnabled + ", y=" + this._y);
			}

			//改变子级布局
			if (widthChanged || heightChanged) {
				if (child.numChildren == undefined) return;
				let temp: any;
				for (var i: number = 0; i < child.numChildren; i++) {
					temp = child.getChildAt(i);
					if (temp instanceof BaseUIComponent) {
						temp.onInvalidatePosition();
					} else {
						BaseUIComponent.resetChildPosition(temp);
					}
				}
			}
		}
	}

	/**
	 * 添加实现了laya.ui.UIComponent类约束布局的元素,例如：Laya.Image
	 */
	public addElement(child: Laya.Sprite) {
		let s = this;
		if (s.elements.indexOf(child) >= 0) return;
		if (child instanceof Laya.UIComponent) {
			s.elements.push(child);
			s.onInvalidatePosition();
		} else {
			s.addChild(child);
		}
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
	 * 从场景中移除对象
	 */
	public removeFromParent(): void {
		if (this.parent) (<Laya.Sprite>this.parent).removeChild(this);
	}

	/**
	 * 返回全局x,y值
	 * @returns {egret.Point}
	 */
	public getGlobalXY(): Laya.Point {
		var point: Laya.Point = new Laya.Point(0, 0);
		point = this.localToGlobal(point, false);
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
	 * 获取注册点相对的偏移像素值
	 * 官方很奇葩,修改了注册点后,子组件竟然不是以改注册点的值作为起始xy的0值
	 * 这里计算出实际的偏移值,供大家使用
	 */
	public getRegPoint(): Laya.Point {
		var regPoint: Laya.Point = new Laya.Point(0, 0);
		if (this.pivotX != 0) {
			regPoint.x = this.pivotX;
		}
		if (this.pivotY != 0) {
			regPoint.y = this.pivotY;
		}
		return regPoint;
	}

	public invalidate(): void {
		//当前无效标识状态_hasInvalidate为flase(即还没有进行延时绘制)并且没有设置延迟绘制标识_drawDelay
		let s = this;
		if (!s._hasInvalidate && !s._drawDelay) {
			//console.log("add invalidate draw")
			//s.on(Laya.Event.FRAME, s, s.onInvalidate);
			Laya.timer.frameLoop(2, s, s.onInvalidate);
			s._hasInvalidate = true;
		}
	}

	/**
	 * 重绘通知
	 */
	public onInvalidate(event: Laya.Event): void {
		let s = this;
		s.draw();
		//s.off(Laya.Event.FRAME, s, s.onInvalidate);
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
}