export class Style {
	public static TEXT_BACKGROUND: number = 0xFFFFFF;
	public static BACKGROUND: number = 0xCCCCCC;
	public static BUTTON_FACE: number = 0xFFFFFF;
	public static BUTTON_DOWN: number = 0xEEEEEE;
	public static INPUT_TEXT: number = 0x333333;
	public static LABEL_TEXT: number = 0x000000;
	public static BUTTON_TEXT: number = 0x666666;
	public static DROPSHADOW: number = 0x000000;
	public static PANEL: number = 0xF3F3F3;
	public static PROGRESS_BAR: number = 0xFFFFFF;
	public static LIST_DEFAULT: number = 0xFFFFFF;
	public static LIST_ALTERNATE: number = 0xF3F3F3;
	public static LIST_SELECTED: number = 0xCCCCCC;
	public static LIST_ROLLOVER: number = 0XDDDDDD;
	public static BUTTON_DEFAULT_WIDTH: number = 100;
	public static BUTTON_DEFAULT_HEIGHT: number = 32;
	public static VIDEO_DEFAULT_WIDTH: number = 320;
	public static VIDEO_DEFAULT_HEIGHT: number = 250;

	public static embedFonts: boolean = false;
	public static fontName: string = null;
	public static fontSize: number = 26;

	public static DARK: string = "dark";
	public static LIGHT: string = "light";

	public static TEXTINPUT_HEIGHT: number = 25;
	public static TEXTINPUT_WIDTH: number = 100;
	public static TEXTINPUT_COLOR: number = 0xffffff;

	public static HORIZONTAL: string = "horizontal";
	public static VERTICAL: string = "vertical";
	public static FREE: string = "free";

	public static SLIDER_WIDTH: number = 300;
	public static SLIDER_HEIGHT: number = 17;

	public static SCROLLBAR_WIDTH: number = 300;
	public static SCROLLBAR_HEIGHT: number = 17;

	public static BASEGROUP_WIDTH: number = 100;
	public static BASEGROUP_HEIGHT: number = 100;

	public static REPEAT = "repeat";
	public static SCALE = "scale";
	public static CLIP = "clip";

	public constructor() {
	}
	/**
	 * Applies a preset style as a list of color values. Should be called before creating any components.
	 */
	public static setStyle(style: string): void {
		switch (style) {
			case Style.DARK:
				Style.BACKGROUND = 0x444444;
				Style.BUTTON_FACE = 0x666666;
				Style.BUTTON_DOWN = 0x222222;
				Style.INPUT_TEXT = 0xBBBBBB;
				Style.LABEL_TEXT = 0xCCCCCC;
				Style.PANEL = 0x666666;
				Style.PROGRESS_BAR = 0x666666;
				Style.TEXT_BACKGROUND = 0x555555;
				Style.LIST_DEFAULT = 0x444444;
				Style.LIST_ALTERNATE = 0x393939;
				Style.LIST_SELECTED = 0x666666;
				Style.LIST_ROLLOVER = 0x777777;
				break;
			case Style.LIGHT:
			default:
				Style.BACKGROUND = 0xCCCCCC;
				Style.BUTTON_FACE = 0xFFFFFF;
				Style.BUTTON_DOWN = 0xEEEEEE;
				Style.INPUT_TEXT = 0x333333;
				Style.LABEL_TEXT = 0x666666;
				Style.PANEL = 0xF3F3F3;
				Style.PROGRESS_BAR = 0xFFFFFF;
				Style.TEXT_BACKGROUND = 0xFFFFFF;
				Style.LIST_DEFAULT = 0xFFFFFF;
				Style.LIST_ALTERNATE = 0xF3F3F3;
				Style.LIST_SELECTED = 0xCCCCCC;
				Style.LIST_ROLLOVER = 0xDDDDDD;
				break;
		}
	}
}