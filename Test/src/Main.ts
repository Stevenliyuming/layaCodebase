import GameConfig from "./GameConfig";
import { MainScene } from "./MainScene";
import Global from "./util/Global";
import { SceneManager } from "./view/SceneManager";
class Main {
	constructor() {
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		Laya.stage.alignV = GameConfig.alignV;
		Laya.stage.alignH = GameConfig.alignH;
		Laya.stage.bgColor = "#00BFFF";
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		//Laya.alertGlobalError(true);
		Laya.stage.frameRate = Global.FRAME_RATE.toString();

		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);

		this.showScene();
	}

	onVersionLoaded(): void {
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
	}

	onConfigLoaded(): void {
		//加载IDE指定的场景
		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
	}

	private sceneLayer: Laya.Sprite;
	private gameScale: number = 1;
	private showScene() {
		let s = this;
		// s.sceneLayer = new Laya.Sprite;
		// s.sceneLayer.width = GameConfig.width;
		// s.sceneLayer.height = GameConfig.height;
		// Laya.stage.addChild(s.sceneLayer);
		// Laya.stage.on(Laya.Event.RESIZE, s, s.stageResize);
		// s.stageResize();

		Laya.loader.load(["../laya/assets/img/bg.png", "../laya/assets/img/A.png", "../laya/assets/img/A点击.png"], Laya.Handler.create(this, () => {
			// let bg = new Laya.Sprite;
			// bg.texture = Laya.loader.getRes("../laya/assets/img/bg.png");
			// s.sceneLayer.addChild(bg);

			// var button:Laya.Button = new Laya.Button();//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
			// button.skin = "../laya/assets/img/A.png";
			// button.stateNum = 1;
			// button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
			// button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
			// button.clickHandler = Laya.Handler.create(this, this.onClickButton, [button], false);//设置 button 的点击事件处理器。
			// s.sceneLayer.addChild(button);//将此 button 对象添加到显示列表。

			SceneManager.instance.showScene(new MainScene);
		}));
	}

	private onClickButton(e: any) {
		console.log(e);
	}

	private stageResize() {
		let s = this;
		s.sceneLayer.width = GameConfig.width;
		s.sceneLayer.height = GameConfig.height;
		let scaleX = Laya.stage.width / GameConfig.width;
		let scaleY = Laya.stage.height / GameConfig.height;
		s.gameScale = scaleX < scaleY ? scaleX : scaleY;
		s.sceneLayer.scaleX = s.sceneLayer.scaleY = s.gameScale;
		s.sceneLayer.x = (Laya.stage.width - s.sceneLayer.width * s.gameScale) / 2;
		s.sceneLayer.y = (Laya.stage.height - s.sceneLayer.height * s.gameScale) / 2;
		console.log("GameConfig.width:" + GameConfig.width);
		console.log("GameConfig.height:" + GameConfig.height);
		console.log("stage.displayWidth:" + Laya.stage.displayWidth);
		console.log("stage.width:" + Laya.stage.width);
		console.log("stage.designWidth:" + Laya.stage.designWidth);
		console.log("Browser.clientWidth:" + Laya.Browser.clientWidth);
		console.log("gameScale:" + s.gameScale);
		console.log("sceneLayer.x:" + s.sceneLayer.x);
		console.log("sceneLayer.y:" + s.sceneLayer.y);
	}
}
//激活启动类
new Main();
