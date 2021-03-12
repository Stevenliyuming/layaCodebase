//图片字体类
export default class ImageNumber extends Laya.Sprite {
	private numberImages: Laya.Sprite[] = [];
	private numberImagePool: Laya.Sprite[] = [];
	private numberTexture: any = {};
	/**图片字名称，如：num0、num1等表示0、1两张图，则imageAlias设置为num */
	private imageAlias: string;
	private path: string;
	/**显示数值 */
	private numberValue: string;
	/**水平和垂直对齐方式 */
	public verticalAlign: string;
	public horizontalAlign: string;
	//改变图片字体之间的间隔大小
	public deltaWidth: number = 0;
	public deltaHeight: number = 0;
	private startX: number;
	private startY: number;

	public constructor() {
		super();
	}

	/**
	 * imageAlias 单张字体图片命名格式
	 * sheetAlias 全部字体图片的纹理图集
	 * verticalAlign 垂直方向的对齐方式 默认顶部对齐
	 * horizontalAlign 水平方向的对齐方式 默认左边对齐
	 */
	public init(imageAlias: string, path: string = "", verticalAlign: string = "top", horizontalAlign: string = "left") {
		let s = this;
		s.imageAlias = imageAlias;
		s.path = path;
		s.verticalAlign = verticalAlign.toLowerCase();
		s.horizontalAlign = horizontalAlign.toLowerCase();
	}

	public show(pr: Laya.Sprite, px: number, py: number, defaultText: string = null) {
		let s = this;
		if (s.parent != pr) {
			pr.addChild(s);
		}
		s.startX = px;
		s.startY = py;
		s.x = px;
		s.y = py;
		s.numberValue = defaultText;
		s.setNumber();
	}

	public set text(value: string) {
		let s = this;
		if (s.numberValue != value) {
			s.numberValue = value;
			s.setNumber();
		}
	}

	public get text() {
		let s = this;
		return s.numberValue;
	}

	private setNumber() {
		let s = this;
		if (s.numberImages.length > 0) {
			for (let i = 0; i < s.numberImages.length; ++i) {
				s.removeChild(s.numberImages[i]);
				s.numberImagePool.push(s.numberImages[i]);
			}
			s.numberImages.length = 0;
		}
		if (s.numberValue && s.numberValue.length > 0) {
			let num = s.numberValue.length;
			let numberBitmap: Laya.Sprite;
			let tex: Laya.Texture;
			let name;
			let spriteWidth: number = 0;
			let spriteHeight: number = 0;
			let temp: number = num / 2;//Math.floor(num / 2);
			for (let i = 0; i < num; ++i) {
				name = s.numberValue[i];
				if (s.numberImagePool.length > 0) {
					numberBitmap = s.numberImagePool.pop();
				} else {
					numberBitmap = new Laya.Sprite;
				}
				tex = s.numberTexture[s.imageAlias + name];
				if (!tex) {
					tex = Laya.Loader.getRes(s.path + `.${s.imageAlias + name}`);
				}
				numberBitmap.texture = tex;
				if (numberBitmap) {
					s.addChild(numberBitmap);
					if (s.horizontalAlign == "left") {
						numberBitmap.x = 0 + i * numberBitmap.width;
					} else if (s.horizontalAlign == "center") {
						numberBitmap.x = 0 + (i - temp) * numberBitmap.width;
					} else if (s.horizontalAlign == "right") {
						numberBitmap.x = 0 - (i + 1) * numberBitmap.width;
					}
					numberBitmap.x += i * s.deltaWidth;

					if (s.verticalAlign == "top") {
						numberBitmap.y = 0;
					} else if (s.verticalAlign == "middle") {
						numberBitmap.y = 0 - numberBitmap.height / 2;
					} else if (s.verticalAlign == "bottom") {
						numberBitmap.y = 0 - numberBitmap.height;
					}
					s.numberImages.push(numberBitmap);
					spriteWidth += (numberBitmap.width + s.deltaWidth);
					spriteHeight = numberBitmap.height;
				}
			}
			s.width = spriteWidth;
			s.height = spriteHeight;
			if (s.horizontalAlign == "center") {
				s.x = s.startX + ((num - 1) * s.deltaWidth * -1) / 2;
			}
		}
	}

	public hide() {
		let s = this;
		if (s.parent) {
			s.parent.removeChild(s);
		}
	}
}
