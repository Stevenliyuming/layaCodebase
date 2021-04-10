import { UIColor } from './UIColor';
import { BasicUIEvent } from "./BasicUIEvent";
import { Group } from "./Group";
import { TextField } from "./Layout";
import { Style } from "./Style";

export class Label extends Group {
	private _text: string = "";//文本内容
	public _textField: TextField = null;
	// private _initFlow: Array<egret.ITextElement> = null;
	// private _htmlTextParser: egret.HtmlTextParser = null;

	private _fontSize: number = Style.fontSize;//字体大小
	private _color: number|string = Style.LABEL_TEXT;//字体颜色
	private _fontName: string = Style.fontName;//字体名称
	private _hAlign: string = "left";
	private _vAlign: string = "middle";
	private _bold: boolean = false;
	private _italic: boolean = false;
	private _lineSpacing: number = 0;//行间距
	private _multiline: boolean = false;//多行显示
	private _wordWrap: boolean = false;//自动换行
	private _stroke: number = 0;
	private _strokeColor: number = 0x003350;
	private _html: boolean = false;
	private _autoSize: boolean = true;

	private _paddingLeft:number = 0;
	private _paddingRight:number = 0;
	private _paddingTop:number = 0;
	private _paddingBottom:number = 0;

	public constructor() {
		super();
		//if (!this._autoSize) this.setSize(Style.TEXTINPUT_WIDTH, Style.TEXTINPUT_HEIGHT);
		this._textField = new TextField();
		this._textField.on(BasicUIEvent.CHANGE, this, this.onTextChange);
		this.addChild(this._textField);
		this.clip = false;
	}

	/**
	 * 加入到显示列表时调用
	 * 子类可覆写该方法,添加UI逻辑
	 */
	public createChildren(): void {
		super.createChildren();
	}

	public initData(): void {
		super.initData();
	}

	/**
	 * 文本改变监听
	 */
	public onTextChange(event: Event): void {
		let s = this;
		s._text = s._textField.text;
	}

	/**
	 * 文本内容
	 */
	public get text(): string {
		return this._text;
	}

	public set text(value: string) {
		let s = this;
		if (s._text != value) {
			s._text = value;
			if (s._html) {
				// if (s._text == null) {
				// 	s._text = "";
				// 	s._initFlow = [];
				// } else {
				// 	if (s._htmlTextParser == null) s._htmlTextParser = new egret.HtmlTextParser();
				// 	s._initFlow = s._htmlTextParser.parser(s._text);
				// }
			} else {
				if (s._text == null) {
					s._text = "";
				}
			}
			s.draw();
		}
	}

	/**
	 * 文本内容显示对象
	 */
	public getTextField(): TextField {
		return this._textField;
	}

	public draw(): void {
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
		//s._textField.multiline = s._multiline;
		//s._textField.lineSpacing = s._lineSpacing;
		s._textField.stroke = s._stroke;
		//s._textField.strokeColor = s._strokeColor;
		s._textField.wordWrap = s._wordWrap;

		if (s._html) {
			// if (s._initFlow) s._textField.textFlow = s._initFlow;
			// s._initFlow = null;
		} else {
			s._textField.text = s._text;
		}

		if (s._autoSize) {
			s.setSize(s._textField.textWidth, s._textField.textHeight);
		} else {
			s._textField.width = s.width;
			s._textField.height = s.height;
			let newWidth = s._textField.width - s._paddingLeft - s._paddingRight;
			let newHeight = s._textField.height - s._paddingTop - s._paddingBottom;
			s._textField.width = newWidth;
			s._textField.height = newHeight;
			s._textField.x = s._paddingLeft;
			s._textField.y = s._paddingTop;
		}
		s._textField.align = s._hAlign;
		s._textField.valign = s._vAlign;
		super.draw();
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
	 * 设置自动换行
	 */
	public get wordWrap(): boolean {
		return this._wordWrap;
	}

	public set wordWrap(value: boolean) {
		if (this._wordWrap != value) {
			this._wordWrap = value;
			this.invalidate();
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
	public set color(value: number|string) {
		if (this._color !== value) {
			this._color = value;
			this.invalidate();
		}
	}
	public get color(): number|string {
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
	 * 设置多行间距，外部设置一般为正数
	 */
	public get multiline(): boolean {
		return this._multiline;
	}

	public set multiline(value: boolean) {
		if (this._multiline != value) {
			this._multiline = value;
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
	 * 是否自动计算文字的尺寸来设置label尺寸
	 */
	// public get autoSize(): boolean {
	// 	return this._autoSize;
	// }

	// public set autoSize(value: boolean) {
	// 	if (this._autoSize != value) {
	// 		this._autoSize = value;
	// 		this.invalidate();
	// 	}
	// }

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
	 * html的文本
	 * @param value
	 */
	public set html(value: boolean) {
		if (this._html != value) {
			this._html = value;
			this.invalidate();
		}
	}
	public get html(): boolean {
		return this._html;
	}
}