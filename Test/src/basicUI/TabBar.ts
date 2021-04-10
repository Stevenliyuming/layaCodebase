import MyEvent from "../event/MyEvent";
import StringUtil from "../util/StringUtil";
import { Button } from "./Button";
import { Sprite, Texture } from "./Layout";
import { RadioButton } from "./RadioButton";
import { UIColor } from "./UIColor";
import { UISkin } from "./UISkin";

export class TabBar extends RadioButton {
	//public static TabBar_PREFIX: string = "ui#TabBar#";//TabBar事件的前缀,尽量避免受到其他事件名称的混淆
	private static tabBar_normalTexture: Texture;
	private static tabBar_checkTexture: Texture;
	private static tabDefaultWidth: number = 60;
	private static tabDefaultHeight: number = 30;
	public constructor() {
		super();
	}

	public createChildren(): void {
		super.createChildren();
	}

	public initData() {
		let s = this;
		s.UI_PREFIX = "ui#TabBar#";
		s.stateArray = [Button.STATUS_NORMAL, Button.STATUS_CHECKED];
		//初始化默认的皮肤
		if (!TabBar.tabBar_normalTexture) {
			let normalSpr: Sprite = UISkin.getRect(TabBar.tabDefaultWidth, TabBar.tabDefaultHeight, UIColor.white);
			var htmlC: Laya.HTMLCanvas = normalSpr.drawToCanvas(normalSpr.width, normalSpr.height, 0, 0);
            //获取texture
            TabBar.tabBar_normalTexture = new Laya.Texture(htmlC.getTexture());

			let checkSpr: Sprite = UISkin.getRect(TabBar.tabDefaultWidth, TabBar.tabDefaultHeight, UIColor.gray);
			htmlC = checkSpr.drawToCanvas(checkSpr.width, checkSpr.height, 0, 0);
            //获取texture
            TabBar.tabBar_checkTexture = new Laya.Texture(htmlC.getTexture());
		}
	}

	protected initDisplay() {
		let s = this;
		s.setSkins([TabBar.tabBar_normalTexture, TabBar.tabBar_checkTexture]);
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
				s._label.x = (s.width - s._label.width) / 2;
				//console.log("Button.draw 222 this.width=" +this.width + ", this._label.width=" + this._label.width);
			}
			if (!isNaN(s._labelMarginTop)) {
				s._label.y = s._labelMarginTop;
			} else {
				s._label.y = (s.height - s._label.height) / 2;
			}
		}
	}

	// public set selected(value: boolean) {
	// 	let s = this;
	// 	s._selected = value;
	// 	s._currentState = (s._selected ? Button.STATUS_CHECKED : Button.STATUS_NORMAL);
	// 	//if (this._data)console.log("button data=" + this._data.id + ", selected=" + this._selected);
	// 	if (s._selected && StringUtil.isUsage(s._groupName)) {
	// 		var myevent: MyEvent = MyEvent.getEvent(RadioButton.RadioButton_PREFIX + s._groupName);
	// 		myevent.addItem("caller", s);
	// 		myevent.addItem("groupName", s._groupName);
	// 		myevent.send();
	// 	}
	// 	s.invalidate();
	// }
	// public get selected(): boolean {
	// 	return this._selected;
	// }

	// /**
	//  * 设置按钮可用状态皮肤
	//  * <p>[STATE_NORMAL, STATE_CHECK]</p>
	//  */
	// public setSkins(skins: Texture[]) {
	// 	let s = this;
	// 	if (!skins || skins.length < 1 || skins.length > 2) {
	// 		console.warn("TabBar皮肤数量不能小于1或者大于2");
	// 		return;
	// 	}
	// 	//初始化按钮状态皮肤
	// 	s._initDisplayData = true;
	// 	for (let i = 0, len = s.stateArray.length; i < len; ++i) {
	// 		if (skins[i]) {
	// 			s._textureDict[s.stateArray[i]] = skins[i];
	// 		} else {
	// 			s._initDisplayData = false;
	// 			console.warn("指定的状态数和状态图片数不一致");
	// 			break;
	// 		}
	// 	}
	// 	if (s._initDisplayData) s.setSize(skins[0].sourceWidth, skins[0].sourceHeight);
	// 	s.invalidate();
	// }
}