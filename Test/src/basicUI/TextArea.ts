import { UIColor } from './UIColor';
import StringUtil from "../util/StringUtil";
import { BasicUIEvent } from "./BasicUIEvent";
import { Group } from "./Group";
import { TextField, Point, Event } from "./Layout";
import { Style } from "./Style";

	/**
	 * 文本显示域
	 */
	 export class TextArea extends Group {
		private _text: string = "";//文本内容
		//private _initFlow: Array<egret.ITextElement> = null;
		//private _htmlTextParser: egret.HtmlTextParser = null;
		public _textField: TextField = null;

		private _fontSize: number = Style.fontSize;//字体大小
		private _color: number = Style.LABEL_TEXT;//字体颜色
		private _fontName: string = Style.fontName;//字体名称
		private _hAlign: string = "left";
		private _vAlign: string = "top";
		private _bold: boolean = false;
		private _italic: boolean = false;
		private _lineSpacing: number = 0;//行间距
		private _stroke: number = 0;
		private _strokeColor: number = 0x003350;
		private _html: boolean = false;
		private _editable: boolean = false;//可编辑状态
		private _maxChars: number = 0;//输入最大字符
		private _restrict: string = null;//限制输入
		private _inputType: string = null;//键盘输入类型

		public static FOLLOW_NONE: string = "none";
		public static FOLLOW_TOP: string = "top";
		public static FOLLOW_BOTTOM: string = "bottom";
		private _followForce: boolean = false;//当追加数据时,不论当前视图位置,直接追踪
		private _follow: string = TextArea.FOLLOW_NONE;//当追加数据时,自动追踪,none,top,bottom

		private isAddScollListener: boolean = false;
		public _link: Function = null;

		private _paddingLeft:number = 0;
		private _paddingRight:number = 0;
		private _paddingTop:number = 0;
		private _paddingBottom:number = 0;

		public constructor() {
			super();
		}

		/**
		 * 加入到显示列表时调用
		 * 子类可覆写该方法,添加UI逻辑
		 */
		public createChildren(): void {
			super.createChildren();
			//this.setSize(Style.SLIDER_WIDTH, Style.SLIDER_WIDTH);
			this._textField = new TextField();
			//this._textField.multiline = true;
			this._textField.on(BasicUIEvent.CHANGE, this, this.onTextChange);
			this.addChild(this._textField);
			//this.touchChildren = false;
		}

		public initData(): void {
			super.initData();
		}

        /**
         * 文本滚动设置
         */
		private onSetScrollText(scroll: boolean): void {
			if (scroll && !this.isAddScollListener) {
				this.isAddScollListener = true;
				this.touchNonePixel = true;
				//this.touchEnabled = true;
				//滚动监听
				this.addEventListener(BasicUIEvent.TOUCH_BEGIN, this.onTouchBegin, this);
				this.addEventListener(BasicUIEvent.TOUCH_END, this.onTouchEnd, this);
				this.addEventListener(BasicUIEvent.TOUCH_MOVE, this.onTouchMove, this);
				//this.addEventListener(BasicUIEvent.TOUCH_CANCEL, this.onTouchCancel, this);
				this.addEventListener(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchCancel, this);
				//console.log("onSetScrollText true");
			} else if (!scroll && this.isAddScollListener) {
				this.isAddScollListener = false;
				this.touchNonePixel = false;
				//this.touchEnabled = false;
				//滚动监听
				this.removeEventListener(BasicUIEvent.TOUCH_BEGIN, this.onTouchBegin, this);
				this.removeEventListener(BasicUIEvent.TOUCH_END, this.onTouchEnd, this);
				this.removeEventListener(BasicUIEvent.TOUCH_MOVE, this.onTouchMove, this);
				//this.removeEventListener(BasicUIEvent.TOUCH_CANCEL, this.onTouchCancel, this);
				this.removeEventListener(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchCancel, this);
				//console.log("onSetScrollText false");
			}
		}

		/**
		 * 鼠标按下
		 * @param event
		 */
		private _isTouchBegin: boolean = false;
		private _touchPoint: Point = null;
		private moveDelta:number = 0;
		public onTouchBegin(event: Event): void {
			//console.log("onTouchBegin numline=" + this._textField.numLines + ", scollv=" + this._textField.scrollV);
			this._isTouchBegin = true;
			this.moveDelta = 0;
			if (this._touchPoint == null) this._touchPoint = new Point();
			this._touchPoint.x = event.stageX;
			this._touchPoint.y = event.stageY;
		}
		public onTouchEnd(event: Event): void {
			this._isTouchBegin = false;
		}
		public onTouchMove(event: Event): void {
			if (this._isTouchBegin) {
				//console.log("move");
				this.moveDelta += Math.abs(event.stageY - this._touchPoint.y);
				if (this.moveDelta >= this._fontSize) {
					this.moveDelta -= this._fontSize;
					if (event.stageY - this._touchPoint.y > 0) {
						//console.log("down")
						// if (this._textField.scrollV > 1) {
						// 	this._textField.scrollV = this._textField.scrollV - 1;
						// }
					} else {
						//console.log("up")
						// if (this._textField.scrollV < this._textField.numLines - 1) {
						// 	this._textField.scrollV = this._textField.scrollV + 1;
						// }
					}
				}
				this._touchPoint.x = event.stageX;
				this._touchPoint.y = event.stageY;
			}
		}
		public onTouchCancel(event: TouchEvent): void {
			this._isTouchBegin = false;
		}

		/**
		 * 文本变化监听
		 */
		public onTextChange(event: Event): void {
			this._text = this._textField.text;
		}

		/**
		 * 文本区域左边距偏移
		 */
		public set paddingLeft(value:number) {
			if(this._paddingLeft != value) {
				this._paddingLeft = value;
				this.invalidate();
			}
		}
		public get paddingLeft() {
			return this._paddingLeft;
		}

		/**
		 * 文本区域右边距偏移
		 */
		public set paddingRight(value:number) {
			if(this._paddingRight != value) {
				this._paddingRight = value;
				this.invalidate();
			}
		}
		public get paddingRight() {
			return this._paddingRight;
		}

		/**
		 * 文本区域顶部边距偏移
		 */
		public set paddingTop(value:number) {
			if(this._paddingTop != value) {
				this._paddingTop = value;
				this.invalidate();
			}
		}
		public get paddingTop() {
			return this._paddingTop;
		}

		/**
		 * 文本区域底部边距偏移
		 */
		public set paddingBottom(value:number) {
			if(this._paddingBottom != value) {
				this._paddingBottom = value;
				this.invalidate();
			}
		}
		public get paddingBottom() {
			return this._paddingBottom;
		}

        /**
         * 文本内容
         */
		public get text(): string {
			return this._text;
		}

        /**
         * 设置文本内容
         * @param value
         */
		public set text(value: string) {
			if (this._text != value) {
				this._text = value;
				if (this._html) {
					// if (this._text == null) {
					// 	this._text = "";
					// 	this._initFlow = [];
					// } else {
					// 	if (this._htmlTextParser == null) this._htmlTextParser = new egret.HtmlTextParser();
					// 	this._initFlow = this._htmlTextParser.parser(this._text);
					// }
				} else {
					if (this._text == null) {
						this._text = "";
					}
				}
				this.invalidate();
			}
		}

        /**
         * 追加文本内容
         * @param value
         */
		public append(value: string) {
			var oldLines: number = this._textField.lines.length;
			var oldscrollV: number = this._textField.scrollY;
			if (this._html) {
				// if (this._htmlTextParser == null) this._htmlTextParser = new egret.HtmlTextParser();
				// var textFlows: Array<egret.ITextElement> = this._htmlTextParser.parser(value);
				// if (this._follow == TextArea.FOLLOW_TOP) {
				// 	textFlows.reverse();
				// 	for (var i: number = 0; i < textFlows.length; i++) {
				// 		this._textField.textFlow.unshift(textFlows[i])
				// 	}
				// 	this._textField.textFlow = this._textField.textFlow;
				// 	this.draw();
				// } else {
				// 	for (var i: number = 0; i < textFlows.length; i++) {
				// 		this._textField.appendElement(textFlows[i]);
				// 	}
				// 	//console.log("textHeight=" + this._textField.textHeight + ", height=" + this.height);
				// 	if (this._textField.textHeight > this.height) {
				// 		this.onSetScrollText(true);
				// 	} else {
				// 		this.onSetScrollText(false);
				// 	}
				// }
			} else {
				if (this._follow == TextArea.FOLLOW_TOP) {
					this._text = value + this._text;
					this.draw();
				} else {
					this._text += value;
					this.draw();
					//this._textField.appendText(value);
					//console.log("textHeight=" + this._textField.textHeight + ", height=" + this.height);
					if (this._textField.textHeight > this.height) {
						this.onSetScrollText(true);
					} else {
						this.onSetScrollText(false);
					}
				}
			}

			if (this._follow != TextArea.FOLLOW_NONE) {
				if (this._follow == TextArea.FOLLOW_TOP) {
					if (oldLines == 1 || this._followForce) {//强制触顶
						this.scrollTo(1);
					}
				} else {
					if (oldLines == oldscrollV || this._followForce) {//强制触底
						this.scrollTo(this._textField.lines.length);
					}
				}
			}
		}

		/**
		 * 滚动到指定行位置
		 * @param value
		 */
		public scrollTo(value: number) {
			//if (this._textField) this._textField.scrollV = value;
		}

        /**
         * 文本内容显示对象
         */
		public getTextField(): TextField {
			return this._textField;
		}

		public draw(): void {
			super.draw();
			let s = this;
			if (s._textField == null) return;
			//console.log("@@label draw text=" + this._text);
			if (s._fontName != null) {
				s._textField.font = s.fontName;
			}
			if (s._color >= 0) s._textField.color = UIColor.convertColor(s._color);
			if (s._fontSize > 0) s._textField.fontSize = s._fontSize;

			s._textField.bold = s._bold;
			s._textField.italic = s._italic;

			if (s._html) {
				// if (s._initFlow) s._textField.textFlow = s._initFlow;
				// s._initFlow = null;
			} else {
				s._textField.text = s._text;
			}

			// if (s._editable) {
			// 	//s.touchChildren = true;
			// 	s._textField.type = egret.TextFieldType.INPUT;
			// } else {
			// 	//s.touchChildren = false;
			// 	s._textField.type = egret.TextFieldType.DYNAMIC;
			// }

			//s._textField.maxChars = s._maxChars;
			//if (StringUtil.isUsage(s._restrict)) s._textField.restrict = s._restrict;
			//if (StringUtil.isUsage(s._inputType)) s._textField.inputType = s._inputType;

			//s._textField.lineSpacing = s._lineSpacing;
			s._textField.stroke = s._stroke;
			//s._textField.strokeColor = s._strokeColor;

			if(s._textField.width != s.width) s._textField.width = s.width;
			if(s._textField.height != s.height) s._textField.height = s.height;
			var newWidth = s._textField.width - s._paddingLeft - s._paddingRight;
			var newHeight = s._textField.height - s._paddingTop - s._paddingBottom;
			s._textField.width = newWidth;
			s._textField.height = newHeight;
			s._textField.x = s._paddingLeft;
			s._textField.y = s._paddingTop;

			s._textField.align = s._hAlign;
			s._textField.valign = s._vAlign;

			//console.log("textHeight=" + this._textField.textHeight + ", height=" + this.height);
			if (s._textField.textHeight > s.height) {
				s.onSetScrollText(true);
			} else {
				s.onSetScrollText(false);
			}
		}

		/**
		 * 设置文本是否斜体
		 * @param value
		 *
		 */
		public set italic(value: boolean) {
			if (this._italic != value) {
				this._italic = value;
				this.invalidate();
			}
		}
		public get italic(): boolean {
			return this._italic;
		}
		
		/**
		 * 设置文本是否粗体
		 * @param value
		 *
		 */
		public set bold(value: boolean) {
			if (this._bold != value) {
				this._bold = value;
				this.invalidate();
			}
		}
		public get bold(): boolean {
			return this._bold;
		}

		/**
		 * 设置文本字体 
		 * @param value
		 * 
		 */
		public set fontName(value: string) {
			if (this._fontName != value) {
				this._fontName = value;
				this.invalidate();
			}
		}
		public get fontName(): string {
			return this._fontName;
		}

		/**
		 * 设置文本字体大小 
		 * @param value
		 * 
		 */
		public set fontSize(value: any) {
			if (this._fontSize != value) {
				this._fontSize = value;
				this.invalidate();
			}
		}
		public get fontSize(): any {
			return this._fontSize;
		}

		/**
		 * 设置文本颜色 
		 * @param value
		 * 
		 */
		public set color(value: any) {
			if (this._color != value) {
				this._color = value;
				this.invalidate();
			}
		}
		public get color(): any {
			return this._color;
		}

		/**
		 * 设置多行间距，外部设置一般为正数
		 */
		public get lineSpacing(): number {
			return this._lineSpacing;
		}
		public set lineSpacing(value: number) {
			if (this._lineSpacing != value) {
				this._lineSpacing = value;
				this.invalidate();
			}
		}

		/**
		 * 文字描边
		 */
		public get stroke(): number {
			return this._stroke;
		}
		public set stroke(value: number) {
			if (this._stroke != value) {
				this._stroke = value;
				this.invalidate();
			}
		}

		/**
		 * 文字描边颜色
		 */
		public get strokeColor(): number {
			return this._strokeColor;
		}
		public set strokeColor(value: number) {
			if (this._strokeColor != value) {
				this._strokeColor = value;
				this.invalidate();
			}
		}

		/**
		 * 水平对齐设置
		 * 默认egret.HorizontalAlign.LEFT;
		 */
		public get hAlign(): string {
			return this._hAlign;
		}
		public set hAlign(value: string) {
			if (this._hAlign != value) {
				this._hAlign = value;
				this.invalidate();
			}
		}

		/**
		 * 竖直对齐设置
		 * 默认egret.VerticalAlign.MIDDLE;
		 */
		public get vAlign(): string {
			return this._vAlign;
		}
		public set vAlign(value: string) {
			if (this._vAlign != value) {
				this._vAlign = value;
				this.invalidate();
			}
		}

		/**
		 * 当follow打开的时候,可以无视视图位置,append数据之后直接滚动到底部
		 * @param value
		 */
		public set followForce(value: boolean) {
			this._followForce = value;
		}
		public get followForce(): boolean {
			return this._followForce;
		}

		/**
		 * append数据的时候,保持底部触底
		 * @param value
		 */
		public set follow(value: string) {
			this._follow = value;
		}
		public get follow(): string {
			return this._follow;
		}

		/**
		 * html的文本
		 * @param value
		 */
		public set html(value: boolean) {
			if (this._html != value) {
				this._html = value;
				if (this._html) {
					//this.touchChildren = true;
				} else {
					//this.touchChildren = false;
				}
				this.invalidate();
			}
		}
		public get html(): boolean {
			return this._html;
		}

        /**
         * 是否可编辑
         * @param value
         */
		public set editable(value: boolean) {
			if (this._editable != value) {
				this._editable = value;
				this.invalidate();
			}
		}
		public get editable(): boolean {
			return this._editable;
		}

        /**
         * 最大输入字符
         * @param value
         */
		public set maxChars(value: number) {
			if (this._maxChars != value) {
				this._maxChars = value;
				this.invalidate();
			}
		}
		public get maxChars(): number {
			return this._maxChars;
		}

        /**
         * 正则表达式,限制输入
         * @param value
         */
		public set restrict(value: string) {
			if (this._restrict != value) {
				this._restrict = value;
				this.invalidate();
			}
		}
		public get restrict(): string {
			return this._restrict;
		}

        /**
         * 键盘类型
         * @param value
         */
		public set inputType(value: string) {
			if (this._inputType != value) {
				this._inputType = value;
				this.invalidate();
			}
		}
		public get inputType(): string {
			return this._inputType;
		}
	}