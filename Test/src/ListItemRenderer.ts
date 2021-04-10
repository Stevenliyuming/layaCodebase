import { DefaultRenderer } from "./basicUI/DefaultRenderer";
import { Image } from "./basicUI/Image";
export class ListItemRenderer extends DefaultRenderer {
	private itemImage: Image;
	public constructor() {
		super();
	}

	/**
	 * 初始化一些必要的逻辑数据
	 * 这个方法是在第一次加入stage的时候,做调用
	 */
	public initData(): void {
	}

	public draw(): void {
		//super.draw();
		if (this.itemImage) {
			this.width = this.itemImage.texture.sourceWidth;
			this.height = this.itemImage.texture.sourceHeight;
		}
	}

	/**
	 * 做ui的销毁
	 * 一般情况下,需要手动调用销毁
	 */
	public destroy(): void {
		let s = this;
		if (s.itemImage) {
			if (s.itemImage.parent) {
				s.itemImage.parent.removeChild(s.itemImage);
			}
			s.itemImage = null;
		}
	}

	public validateNow(): void {
		let s = this;
		if (s.data) {
			if (!s.itemImage) {
				s.itemImage = new Image;
				s.addChild(s.itemImage);
			}
			s.itemImage.texture = Laya.loader.getRes(s.data.res);//RES.getRes(s.data.res);
			s.onInvalidate(null);
		}
	}
}