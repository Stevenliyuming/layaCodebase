import { Group } from "./Group";

export class DefaultRenderer extends Group {
	public _selected: boolean;
	/**
	 * item render所在的list
	 * @type {null}
	 */
	public list: any = null;
	/**
	 * 渲染项数据下标
	 */
	public dataIndex: number;

	public constructor() {
		super();
	}

	public createChildren(): void {
		super.createChildren();
	}

	/**
	 * 初始化一些必要的逻辑数据
	 * 这个方法是在第一次加入stage的时候,做调用
	 */
	public initData(): void {
	}

	public draw(): void {
		super.draw();
	}

	/**
	 * 设置数据
	 */
	public set data(value: any) {
		this._data = value;
		this.invalidate();
	}
	public get data(): any {
		return this._data;
	}

	/**
	 * 刷新
	 */
	public refresh(): void {
		this.data = this._data;
	}

	/**
	 * 设置选中
	 */
	public set selected(value: boolean) {
		this.setSelected(value);
	}
	public get selected(): boolean {
		return this._selected;
	}

	public setSelected(value: boolean) {
		if (this._selected != value) {
			this._selected = value;
			this.invalidate();
		}
	}

	/**
	 * 做ui的销毁
	 * 一般情况下,需要手动调用销毁
	 */
	public destroy(): void {
	}

	/**
	 * 首次材质下载完成会调用加载一次,刷新UI皮肤显示
	 * 使用了框架的UI机制,单ui的资源下载完成会调用改方法刷新
	 * 若view中有逻辑使用到ui的素材,应该在这里做素材的赋值
	 */
	public validateNow(): void {
	}
}