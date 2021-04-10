import EventManager from "../event/EventManager";
import MyEvent from "../event/MyEvent";
import StringUtil from "../util/StringUtil";
import { BasicUIEvent } from "./BasicUIEvent";
import { Button } from "./Button";
import { CheckBox } from "./CheckBox";
import { Sprite, Texture } from "./Layout";
import { UISkin } from "./UISkin";

export class RadioButton extends CheckBox {
	//public static RadioButton_PREFIX: string = "ui#radioButton#";//RadioButton事件的前缀,避免受到其他事件名称的混淆
	protected UI_PREFIX:string = "ui#radioButton#";
	protected _groupName: string;
	private static radio_normalTexture: Texture;
	private static radio_checkTexture: Texture;
	public constructor() {
		super();
	}

	public createChildren(): void {
		super.createChildren();
	}

	public initData() {
		let s = this;
		s.stateArray = [Button.STATUS_NORMAL, Button.STATUS_CHECKED];
		//初始化默认的皮肤
		if (!RadioButton.radio_normalTexture) {
			let normalSpr: Sprite = UISkin.radioOff;
			var htmlC: Laya.HTMLCanvas = normalSpr.drawToCanvas(normalSpr.width, normalSpr.height, 0, 0);
            //获取texture
            RadioButton.radio_normalTexture = new Laya.Texture(htmlC.getTexture());

			let checkSpr: Sprite = UISkin.radioOn;
			htmlC = checkSpr.drawToCanvas(checkSpr.width, checkSpr.height, 0, 0);
            //获取texture
            RadioButton.radio_checkTexture = new Laya.Texture(htmlC.getTexture());
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
				s.alpha = 1;
				if (s.touchId == -1) return;
				s.touchId = -1;
				if (s.selected) return;
				s.selected = !s._selected;
				s.onPlaySound();
			}
			// console.log("Button _toggleGroup=" + this._toggleGroup + ", _selected=" + this._selected);
		}
		s.invalidate();
	}

	protected initDisplay() {
		let s = this;
		s.setSkins([RadioButton.radio_normalTexture, RadioButton.radio_checkTexture]);
	}

	public set selected(value: boolean) {
		let s = this;
		s._selected = value;
		s._currentState = (s._selected ? Button.STATUS_CHECKED : Button.STATUS_NORMAL);
		//if (this._data)console.log("button data=" + this._data.id + ", selected=" + this._selected);
		if (s._selected && StringUtil.isUsage(s._groupName)) {
			var myevent: MyEvent = MyEvent.getEvent(s.UI_PREFIX + s._groupName);
			myevent.addItem("caller", s);
			myevent.addItem("groupName", s._groupName);
			myevent.send();//向单选按钮内部组发送事件
		}
		s.invalidate();
	}
	public get selected(): boolean {
		return this._selected;
	}

	public set groupName(value: string) {
		let s = this;
		if (StringUtil.isUsage(s._groupName)) {//旧的group
			EventManager.removeEventListener(s.UI_PREFIX + s._groupName, s.onEventToggle, s);
		}
		s._groupName = value;//新的group
		if (StringUtil.isUsage(s._groupName)) {
			EventManager.addEventListener(s.UI_PREFIX + s._groupName, s.onEventToggle, s);
		}
	}
	public get groupName(): string {
		return this._groupName;
	}

	private onEventToggle(event: MyEvent): void {
		let s = this;
		if (StringUtil.isUsage(s._groupName) && event.getItem("groupName") == s._groupName) {
			//console.log("0000 onEventToggle group=" + this._toggleGroup + ", data=" + this._data.id);
			if (event.getItem("caller") != s) {
				s.selected = false;
			} else {
				if (s.clickFun && s.clickFunObj) {
					s.clickFun.call(s.clickFunObj, event);
				}
			}
			s.dispatchEventWith(BasicUIEvent.CHANGE, false, { caller: s, status: s.currentState });//向外部监听发送事件
		}
	}

	/**
	 * 设置按钮可用状态皮肤
	 * <p>[STATE_NORMAL, STATE_CHECK]</p>
	 */
	public setSkins(skins: Texture[]) {
		let s = this;
		if (!skins || skins.length < 1 || skins.length > 2) {
			console.warn("RadioButton皮肤数量不能小于1或者大于2");
			return;
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