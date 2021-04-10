import { BasicUIEvent } from "./BasicUIEvent";
import { ILayout, Point, Event, Sprite } from "./Layout";
import { Progress } from "./Progress";
import { Style } from "./Style";
import { UISkin } from "./UISkin";

	/***滑动器 */
	export class Slider extends Progress implements ILayout {
		protected skinBar: Sprite;
		protected type: string;
		public constructor() {
			super();
		}

		/**
		 * bg:滑动器背景
		 * skin:滑动器填充的滑动条
		 * bar:滑动器滑动按钮
		 */
		public setSkin(bg: Sprite = null, skin: Sprite = null, bar: Sprite = null) {
			super.setSkin(bg, skin);
			this.skinBar = bar || UISkin.sliderBar;
			this.addChild(this.skinBar);
			//this.skinBar.touchEnabled = true;
			this.skinBar.on(BasicUIEvent.TOUCH_BEGIN, this, this.onTouch);
			this.layout();
			this.value = 0;
		}

		protected onTouch(e: Event): void {
			switch (e.type) {
				case BasicUIEvent.TOUCH_BEGIN:
					this.stage.on(BasicUIEvent.TOUCH_END, this, this.onTouch);
					this.stage.on(BasicUIEvent.TOUCH_MOVE, this, this.onTouch);
					this.dispEvent(BasicUIEvent.START);
					break;
				case BasicUIEvent.TOUCH_MOVE:
					this.moveDo(e.stageX, e.stageY);
					this.dispEvent(BasicUIEvent.MOVE);
					break;
				case BasicUIEvent.TOUCH_END:
					this.stage.off(BasicUIEvent.TOUCH_END, this, this.onTouch);
					this.stage.off(BasicUIEvent.TOUCH_MOVE, this, this.onTouch);
					this.dispEvent(BasicUIEvent.OVER);
					break;
			}
		}

		protected moveDo(x: number, y: number): void {
			let s = this;
			var p: Point = s.globalToLocal(new Point(x, y));
			var v: number;
			if (s.type == Style.HORIZONTAL) v = p.x / s.skinProgress.width;
			else v = p.y / s.skinProgress.width;
			s.value = v;
		}

		/**设置进度值，只能是0－1之间 */
		public set value(v: number) {
			v = v < 0 ? 0 : v > 1 ? 1 : v;
			this._value = v;
			this.skinProgress.scaleX = v;
			if (this.type == Style.HORIZONTAL) this.skinBar.x = this.skinProgress.width * v;
			else this.skinBar.y = this.skinProgress.width * v;
		}

		/**获取进度值 */
		public get value(): number {
			return this._value;
		}

		/**横竖版布局，默认是横版布局 */
		public layout(type: string = Style.HORIZONTAL, interval: number = 0): void {
			this.type = type
			if (type == Style.VERTICAL) {
				var angle = 90;
				this.skinBar.x = -this.skinProgress.height >> 1;
			} else {
				var angle = 0;
				this.skinBar.y = this.skinProgress.height >> 1;
			}
			this.skinBg.rotation = angle;
			this.skinProgress.rotation = angle;
			this.value = this._value;
		}
	}