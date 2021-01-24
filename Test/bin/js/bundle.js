(function () {
    'use strict';

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
        }
    }
    GameConfig.width = 1920;
    GameConfig.height = 1080;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            this.gameScale = 1;
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.alignV = "middle";
            Laya.stage.alignH = "center";
            Laya.stage.scaleMode = "full";
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.bgColor = "#00BFFF";
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.stage.frameRate = "60";
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
            this.showScene();
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
        showScene() {
            let s = this;
            s.sceneLayer = new Laya.Sprite;
            s.sceneLayer.width = GameConfig.width;
            s.sceneLayer.height = GameConfig.height;
            Laya.stage.addChild(s.sceneLayer);
            Laya.stage.on(Laya.Event.RESIZE, s, s.stageResize);
            s.stageResize();
            Laya.loader.load(["../laya/assets/res/bg.png", "../laya/assets/res/A.png", "../laya/assets/res/A点击.png"], Laya.Handler.create(this, () => {
                let bg = new Laya.Sprite;
                bg.texture = Laya.loader.getRes("../laya/assets/res/bg.png");
                s.sceneLayer.addChild(bg);
                var button = new Laya.Button();
                button.skin = "../laya/assets/res/A.png";
                button.stateNum = 1;
                button.x = 100;
                button.y = 100;
                button.clickHandler = Laya.Handler.create(this, this.onClickButton, [button], false);
                s.sceneLayer.addChild(button);
            }));
        }
        onClickButton(e) {
            console.log(e);
        }
        stageResize() {
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
    new Main();

}());
