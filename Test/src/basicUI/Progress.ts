import { BasicGroup } from "./BasicGroup";
import { Label } from "./Label";
import { Sprite } from "./Layout";
import { UISkin } from "./UISkin";

	/***进度条 */
	export class Progress extends BasicGroup {
		protected skinBg: Sprite;
		protected skinProgress: Sprite;
		protected text: Label;
		protected _value: number = 0;

		public constructor() {
			super();
		}

		/**
		 * bg:进度条背景
		 * skin:进度条进度
		 */
		public setSkin(bg: Sprite, skin: Sprite) {
			this.skinBg = bg || UISkin.progressBackground;
			this.skinProgress = skin || UISkin.progressSkin;
			this.addChild(this.skinBg);
			this.addChild(this.skinProgress);
			this.text = new Label;
			this.addChild(this.text);
		}

		/**值只能是0－1之间 */
		public set value(v: number) {
			v = v < 0 ? 0 : v > 1 ? 1 : v;
			this._value = v;
			this.skinProgress.scaleX = v;
		}

		public get value(): number {
			return this._value;
		}

		/**
		 * 显示进度文本
		 */
		public showText(text: string, x: number = -1, y: number = -1): void {
			this.text.text = text;
			if (x == -1) this.text.x = (this.skinBg.width - this.text.width) >> 1
			else this.text.x = x;
			if (y == -1) this.text.y = this.skinBg.height + 5;
			else this.text.y = y;
		}
	}