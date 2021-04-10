import { BasicUIEvent } from "./BasicUIEvent";
import { Button } from "./Button";
import { Label } from "./Label";
import { Sprite, Texture } from "./Layout";
import { UISkin } from "./UISkin";
import { Image } from "./Image";

export class CheckBox extends Button {
	private static normalTexture: Texture;
	private static checkTexture: Texture;
	private static disableTexture: Texture;
	protected touchId: number = -1;
	public constructor() {
		super();
	}

	public createChildren(): void {
		//super.createChildren();
		let s = this;
		s._currentState = Button.STATUS_NORMAL;
		//s.touchEnabled = true;//事件接收
		//s.touchChildren = false;
		//box显示
		s._imgDisplay = new Image;
		s.addChild(s._imgDisplay);
		// s._imgDisplay.width = s.width;
		// s._imgDisplay.height = s.height;
		s._imgDisplay.fillMode = s._fillMode;
		//s._imgDisplay.touchEnabled = false;

		//文字显示
		s._labelMarginLeft = NaN;
		s._labelMarginTop = NaN;
		s._label = new Label;
		s.fontSize = 15;
		s._label.autoSize = true;
		s._label.clip = false;
		s._label.hAlign = "left";
		s._label.vAlign = "middle";
		s._label.showBg = false;
		s.addChild(s._label);

		s.on(BasicUIEvent.TOUCH_BEGIN, s, s.onTouchEvent);
		//s.addEventListener(BasicUIEvent.TOUCH_MOVE, s.onTouchEvent, s);
		s.on(BasicUIEvent.TOUCH_END, s, s.onTouchEvent);
		s.on(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, s, s.onTouchReleaseOutside);
		//s.on(BasicUIEvent.TOUCH_CANCEL, s.onTouchReleaseOutside, s, true);
	}

	public initData() {
		let s = this;
		s.stateArray = [Button.STATUS_NORMAL, Button.STATUS_CHECKED];
		//初始化默认的皮肤
		if (!CheckBox.normalTexture) {
			let normalSpr: Sprite = UISkin.checkBoxOff;
			var htmlC: Laya.HTMLCanvas = normalSpr.drawToCanvas(normalSpr.width, normalSpr.height, 0, 0);
            //获取texture
            CheckBox.normalTexture = new Laya.Texture(htmlC.getTexture());

			let checkSpr: Sprite = UISkin.checkBoxOn;
			htmlC = checkSpr.drawToCanvas(checkSpr.width, checkSpr.height, 0, 0);
            //获取texture
            CheckBox.checkTexture = new Laya.Texture(htmlC.getTexture());

			let disableSpr: Sprite = UISkin.checkBoxDisable;
			htmlC = disableSpr.drawToCanvas(disableSpr.width, disableSpr.height, 0, 0);
            //获取texture
            CheckBox.disableTexture = new Laya.Texture(htmlC.getTexture());
		}
	}

	public onTouchEvent(event: Laya.Event): void {
		let s = this;
		if (!s.enabled || s.currentState == Button.STATUS_DISABLE) {
			event.stopPropagation();
			return;
		}
		//console.log("Button onTouchEvent=" + event.type);
		if (event.currentTarget == s) {
			//像素检测
			if (s._testPixelEnable && !s.testPixel32(s.mouseX, s.mouseY)) {
				event.stopPropagation();
				return;
			}
			if (event.type == BasicUIEvent.TOUCH_BEGIN) {
				s.alpha = 0.8;
				s.touchId = event.touchId;
			}
			else if (event.type == BasicUIEvent.TOUCH_END) {
				if (s.touchId == -1) return;
				s.touchId = -1;
				s.alpha = 1;
				s.selected = !s._selected;
				s.onPlaySound();
			}
			// console.log("Button _toggleGroup=" + this._toggleGroup + ", _selected=" + this._selected);
		}
		s.invalidate();
	}

	/**
	 * 在外释放
	 * @param event
	 */
	public onTouchReleaseOutside(event: TouchEvent): void {
		let s = this;
		s.alpha = 1;
		s.touchId = -1;
	}

	public set selected(value: boolean) {
		let s = this;
		s._selected = value;
		s._currentState = (s._selected ? Button.STATUS_CHECKED : Button.STATUS_NORMAL);
		s.dispatchEventWith(BasicUIEvent.CHANGE, false, { caller: s, status: s.currentState });
		if (s.clickFun && s.clickFunObj) {
			s.clickFun.call(s.clickFunObj, event);
		}
		s.invalidate();
	}
	public get selected(): boolean {
		return this._selected;
	}

	/**
	 * 绘制
	 */
	public draw(): void {
		//super.draw();
		//if (this._data)console.log("@@Button draw _text=" + this._text + ", selected=" + this.selected + ", data=" + this._data.id);
		//初始化显示对象和数据
		let s = this;
		if (!s._initDisplayData) {
			s.initDisplay();
		}

		if (s._imgDisplay == null) return;
		s._imgDisplay.texture = s._textureDict[s._currentState];

		//文字标签
		if (s._label) {
			if (!s._label.parent) s.addChild(s._label);
			s._label.text = s._text;
			s._label.fontSize = s._fontSize;
			s._label.fontName = s._fontName;
			s._label.bold = s._labelBold;
			s._label.italic = s._labelItalic;
			s._label.lineSpacing = s._labelLineSpacing;
			s._label.multiline = s._labelMultiline;
			s._label.stroke = s._labelStroke;
			s._label.strokeColor = s._labelStrokeColor;
			s._label.onInvalidate(null);//立即生效,这样下面的数据才准

			if (!isNaN(s._labelMarginLeft)) {
				s._label.x = s._labelMarginLeft;
			} else {
				s._label.x = s.width + 5;//默认文本放在复选框右边
				//console.log("Button.draw 222 this.width=" +this.width + ", this._label.width=" + this._label.width);
			}
			if (!isNaN(s._labelMarginTop)) {
				s._label.y = s._labelMarginTop;
			} else {
				s._label.y = (s.height - s._label.height) / 2;
			}
		}
	}

	protected initDisplay() {
		let s = this;
		s.setSkins([CheckBox.normalTexture, CheckBox.checkTexture, CheckBox.disableTexture]);
	}

	/**
	 * 设置按钮可用状态皮肤
	 * <p>[STATE_NORMAL, STATE_CHECK, STATE_DISABLE]</p>
	 */
	public setSkins(skins: Texture[]) {
		let s = this;
		if (!skins || skins.length < 2) {
			console.warn("CHECKBOX皮肤数量不能小于2");
			return;
		}
		if (skins.length == 3) {
			s.stateArray.push(Button.STATUS_DISABLE);
		}
		//初始化按钮状态皮肤
		s._initDisplayData = true;
		for (let i = 0, len = s.stateArray.length; i < len; ++i) {
			if (skins[i]) {
				s._textureDict[s.stateArray[i]] = skins[i];
			} else {
				s._initDisplayData = false;
				console.warn("指定的状态数和状态图片数不一致");
				break;
			}
		}
		if (s._initDisplayData) s.setSize(skins[0].sourceWidth, skins[0].sourceHeight);
		s.invalidate();
	}
}