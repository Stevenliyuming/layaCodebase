import { BasicGroup } from "./BasicGroup";
import { BasicUIEvent } from "./BasicUIEvent";
import { DefaultRenderer } from "./DefaultRenderer";
import { ILayout, Point, Event, Sprite } from "./Layout";
import { Scroller } from "./Scroller";
import { Style } from "./Style";

	/**列表组件 */
	export class ListGroup extends BasicGroup implements ILayout {
		protected contentView: BasicGroup;
		public scrollBar: Scroller;
		protected posStart: Point;
		protected alignType: string;
		protected itemInterval: number = 0;
		protected items: Sprite[] = [];

		/** 用于数据项目的项呈示器。您应该直接为此属性赋值自定义类的类定义，而不是一个实例，注意：该类必须实现 ListItemRenderer 接口 */
		public itemRenderer: any;
		/** 列表数据源 */
		public dataProvider: any;
		/**当前选中的Item呈视项 */
		protected itemSelected: any;
		/**是否自动执行被选项选中定义函数 */
		protected executeSelected: boolean;

		/**设置宽与高 */
		public constructor(w: number, h: number, type: string = Style.VERTICAL, interval: number = 10, itemList: Sprite[] = []) {
			super();
			let s = this;
			s.alignType = type;
			s.itemInterval = interval;
			s.contentView = new BasicGroup();
			s.scrollBar = new Scroller(w, h, s.contentView, type);
			s.addChild(s.scrollBar);
			s.width = w;
			s.height = h;
			s.initItem(itemList);
		}

		protected initItem(items: Sprite[]) {
			let s = this;
			if(items.length <= 0) return;
			items.forEach(element => {
				s.addItem(element);
			});
			s.invalidate();
		}

		public addItem(item: Sprite): void {
			let s = this;
			s.contentView.addChild(item);
			item.on(BasicUIEvent.TOUCH_BEGIN, s, s.onTouch);
			item.on(BasicUIEvent.TOUCH_END, s, s.onTouch);
			s.items.push(item);
		}

		public removeItem(item: Sprite): void {
			let s = this;
			if (s.contentView.contains(item)) {
				s.contentView.removeChild(item);
				item.off(BasicUIEvent.TOUCH_BEGIN, s, s.onTouch);
				item.off(BasicUIEvent.TOUCH_END, s, s.onTouch);
				if (item instanceof BasicGroup) {
					item.dispose();
				}
				s.invalidate();
			}
		}

		public layout(type: string, interval: number): void {
			let s = this;
			let w:number = 0;
			let h:number = 0;
			if(type == Style.VERTICAL) {
				w = s.width;
				s.items.forEach((element, index) => {
					element.x = 0;
					element.y = 0 + index * (element.height + interval);
					h = element.y + element.height + interval;
				});
			} else if(type == Style.HORIZONTAL) {
				h = s.height
				s.items.forEach((element, index) => {
					element.x = 0 + index * (element.width + interval)
					element.y = 0;

					w = element.x + element.width + interval;
				});
			}
			s.contentView.width = w;
			s.contentView.height = h;
		}

		/**设置可配置渲染列表
		 * renderer 渲染项实现,继承DisplayObjectContainer类，实现IListItemrenderer接口
		 * data 渲染数据
		 */
		public renderList(renderer: any, data: any[] = [], executeSelected: boolean = true) {
			let s = this;
			if (renderer && data) {
				s.clear();
				s.executeSelected = executeSelected;
				s.itemRenderer = renderer;
				s.dataProvider = data.concat();
				for (let i = 0; i < data.length; ++i) {
					let displayItemUI:DefaultRenderer = new renderer();
                    displayItemUI.data = data[i];//给显示项绑定数据
                    displayItemUI.dataIndex = i;//数据项下标
                    displayItemUI.list = s;//给显示项绑定所属列表
                    displayItemUI.validateNow();
					s.addItem(displayItemUI);
				}
				s.invalidate();
			}
		}

		/**设置实例化渲染列表 */
		public setItemList(itemList: Sprite[] = []) {
			let s = this;
			s.clear();
			s.initItem(itemList);
		}

		/**如果需要给列表填充新的显示项 需要调用此方法清理列表 */
		protected clear() {
			let s = this;
			s.itemRenderer = null;
			if (s.dataProvider && s.dataProvider instanceof Array) {
				s.dataProvider.length = 0;
				s.dataProvider = null;
			}
			s.items.forEach(element => {
				s.removeItem(element);
			});
			s.items.length = 0;
		}

		/**设置是否可以鼠标滚动列表 */
		public setMouseWheelEnable(value: boolean) {
			let s = this;
			s.scrollBar.setMouseWheelEnable(value);
		}

		/***两点间的距离 */
		public twoDistance(a: any, b: any): number {
			var x: number = a.x - b.x;
			var y: number = a.y - b.y;
			return Math.sqrt(x * x + y * y);
		}

		protected onTouch(e: Event): void {
			let s = this;
			if (e.type == BasicUIEvent.TOUCH_BEGIN) {
				s.posStart = new Point(e.stageX, e.stageY);
			} else {
				var posEnd: Point = new Point(e.stageX, e.stageY);
				if (s.posStart && s.twoDistance(s.posStart, posEnd) < 20) {
					s.onClick(e.currentTarget);
				}
				s.posStart = null;
			}
		}

		protected onClick(item: Sprite): void {
			let s = this;
			if (s.itemRenderer) {
				if (s.itemSelected && s.executeSelected) (<DefaultRenderer>s.itemSelected).setSelected(false);
				s.itemSelected = item;
				(<DefaultRenderer>s.itemSelected).setSelected(true);
			} else {
				s.itemSelected = item;
			}
			var param: Object = { item: item, index: s.items.indexOf(item) };
			s.dispatchEventWith(BasicUIEvent.ITEM_SELECTED, false, param);
		}

		public draw(): void {
			//console.log("draw name=" + this.name);
			let s = this;
			s.layout(s.alignType, s.itemInterval);
		}
	}