import GameConfig from "./GameConfig";
import { ResLoader } from "./loader/ResLoader";
import MainScene from "./MainScene";
import Global from "./util/Global";
import HeartBeat from "./util/HeartBeat";
import SceneManager from "./view/SceneManager";
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

	private showScene() {
		let resCount = 0;
		function onLoad() {
			resCount += 1;
			if(resCount == 2) {
				HeartBeat.init();
				SceneManager.instance.showScene(new MainScene);
			}
		}
		Laya.loader.load([
			"../laya/assets/img/bg.png",
			"../laya/assets/img/A.png",
			"../laya/assets/img/A点击.png",
			"../laya/assets/img/slider_bar_v.png",
			"../laya/assets/img/slider_bar_h.png",
			"../laya/assets/img/hand.png",
			"../laya/assets/img/playSound.png",
		], Laya.Handler.create(this, () => {
			onLoad();
		}));

		ResLoader.getInstance().resLoad("http://dev4iandcode.oss-cn-shenzhen.aliyuncs.com/s/platform/interactive/common/interactiveTemplate/mainScratch/moduleRelease/resource.pkg", null, (data: any) => {
            console.log(data);
			onLoad();
            //codeBase.EgretProto.inject();

            //this.createGameScene();
        }, this, "get", "arraybuffer");
	}
}
//激活启动类
new Main();
