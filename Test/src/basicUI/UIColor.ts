import Global from "../util/Global"

/**颜色 */
export class UIColor {
	public static get random(): number { return Math.random() * 0XFFFFFF };
	public static get white(): number { return 0XFFFFFF };
	public static get black(): number { return 0X000000 };
	public static get gray(): number { return 0X666666 };
	public static get red(): number { return 0XFF0000 };
	public static get green(): number { return 0X00FF00 };
	public static get blue(): number { return 0X0000FF };
	public static get skinNormal(): number { return 0X15191C };
	public static get skinDown(): number { return 0X999999 };
	public static get titleBackground(): number { return 0X20262B };

	public static getRandomColors(count: number): number[] {
		var colors: number[] = [];
		for (var i: number = 0; i < count; i++) colors.push(Math.random() * 0XFFFFFF);
		return colors;
	};

	/** 可改变颜色的亮暗,value值是-255到255*/
	public static lightenDarkenColor(color: number, value: number): number {
		var r = (color >> 16) + value;
		if (r > 255) r = 255;
		else if (r < 0) r = 0;
		var b = ((color >> 8) & 0x00FF) + value;
		if (b > 255) b = 255;
		else if (b < 0) b = 0;
		var g = (color & 0x0000FF) + value;
		if (g > 255) g = 255;
		else if (g < 0) g = 0;
		return (g | (b << 8) | (r << 16));
	}

	public static convertColor(color: number | string): string {
		if (typeof color == "number") {
			let c1 = Global.spliceColor(color);
			let tempColor = Global.convertNumberToColor(c1.r, c1.g, c1.b);
			return tempColor;
		} else {
			return color;
		}
	}
}