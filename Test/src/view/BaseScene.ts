import Global from "../util/Global";
export default class BaseScene extends Laya.UIComponent {
	protected isClear: boolean = false;
	protected modulePath: string;
	protected skeletonPath: string;
	protected soundPath: string;
	protected videopath: string;
	public _stage:Laya.Stage;
	public constructor() {
		super();
		//this.once(egret.Event.ADDED_TO_STAGE, this.init, this);
	}

	/**
	 * 初始化一些必要的逻辑数据
	 * 这个方法是在第一次加入stage的时候,做调用
	 */
	public initData(): void {
		//super.initData();
		let s = this;
		s._stage = Laya.stage;
		s.modulePath = "../laya/assets";
		s.skeletonPath = s.modulePath + "/skeleton/";
		s.soundPath = s.modulePath + "/sound/";
		s.videopath = s.modulePath + "video/";
	}

	public hide() {
		console.log("remove" + Global.getQualifiedClassName(this));
	}

	// protected createGroup(pr:any, width:number=1920, height:number=1080) {
	// 	let s = this;
	// 	let group = new BaseGroup;
	// 	s.addElement(group);
	// 	group.width = width;
	// 	group.height = height;
	// 	return group;
	// }
}