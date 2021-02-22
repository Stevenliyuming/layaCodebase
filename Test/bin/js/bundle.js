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
    GameConfig.scaleMode = "full";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Global {
        static getQualifiedClassName(value) {
            var type = typeof value;
            if (!value || (type != "object" && !value.prototype)) {
                return type;
            }
            var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
            if (prototype.hasOwnProperty("__class__")) {
                return prototype["__class__"];
            }
            var constructorString = prototype.constructor.toString().trim();
            var index = constructorString.indexOf("(");
            var className = constructorString.substring(9, index);
            Object.defineProperty(prototype, "__class__", {
                value: className,
                enumerable: false,
                writable: true
            });
            return className;
        }
        static getDefinitionByName(name) {
            if (!name)
                return null;
            var definition = Global.getDefinitionByNameCache[name];
            if (definition) {
                return definition;
            }
            var paths = name.split(".");
            var length = paths.length;
            definition = window;
            for (var i = 0; i < length; i++) {
                var path = paths[i];
                definition = definition[path];
                if (!definition) {
                    return null;
                }
            }
            Global.getDefinitionByNameCache[name] = definition;
            return definition;
        }
    }
    Global.FRAME_RATE = 60;
    Global.STATS_BTN = false;
    Global.getDefinitionByNameCache = {};

    class BaseScene extends Laya.UIComponent {
        constructor() {
            super();
            this.isClear = false;
        }
        initData() {
            let s = this;
            s._stage = Laya.stage;
            s.modulePath = "../laya/assets";
            s.skeletonPath = s.modulePath + "/skeleton/";
            s.soundPath = s.modulePath + "/sound/";
            s.videopath = s.modulePath + "video/";
        }
        hide() {
            console.log("remove" + Global.getQualifiedClassName(this));
        }
    }

    class MainScene extends BaseScene {
        constructor() {
            super();
            this.init();
        }
        init() {
            let s = this;
            let playGroup = new Laya.UIComponent;
            s.addChild(playGroup);
            playGroup.width = GameConfig.width;
            playGroup.height = GameConfig.height;
            playGroup.centerX = 0;
            playGroup.centerY = 0;
            let bg = new Laya.Sprite;
            bg.texture = Laya.loader.getRes("../laya/assets/img/bg.png");
            playGroup.addChild(bg);
            var button = new Laya.Button();
            button.skin = "../laya/assets/img/A.png";
            button.stateNum = 1;
            button.x = 100;
            button.y = 100;
            button.clickHandler = Laya.Handler.create(this, this.onClickButton, [button], false);
            playGroup.addChild(button);
        }
        onClickButton(e) {
            console.log(e);
        }
    }

    class ObjectPool {
        static getByClass(clz, flag = "", pop = true) {
            var key = Global.getQualifiedClassName(clz);
            key = flag + key;
            var item = ObjectPool.getObject(key, pop);
            if (item == null)
                item = new clz();
            if (!pop) {
                ObjectPool.recycleClass(item, flag);
            }
            return item;
        }
        static recycleClass(obj, flag = "") {
            if (!obj)
                return;
            var key = Global.getQualifiedClassName(obj);
            key = flag + key;
            ObjectPool.recycleObject(key, obj);
        }
        static hasClass(clz, flag = "") {
            return ObjectPool.getByClass(clz, flag, false);
        }
        static getObject(name, pop = true) {
            if (ObjectPool._dataPool.hasOwnProperty(name) && ObjectPool._dataPool[name].length > 0) {
                var obj = null;
                if (pop) {
                    obj = ObjectPool._dataPool[name].pop();
                    if (ObjectPool._dataPool[name].length == 0)
                        delete ObjectPool._dataPool[name];
                }
                else {
                    obj = ObjectPool._dataPool[name][0];
                }
                return obj;
            }
            return null;
        }
        static setObject(name, item) {
            ObjectPool.recycleObject(name, item);
        }
        static recycleObject(name, item) {
            if (!item)
                return;
            if (!ObjectPool._dataPool.hasOwnProperty(name)) {
                ObjectPool._dataPool[name] = [];
            }
            if (item.hasOwnProperty("destroy"))
                item.destroy();
            if (ObjectPool._dataPool[name].indexOf(item) < 0) {
                ObjectPool._dataPool[name].push(item);
            }
        }
        static hasObject(name) {
            return ObjectPool.getObject(name, false);
        }
        static dispose(clz) {
            var key = Global.getQualifiedClassName(clz);
            ObjectPool.disposeObjects(key);
        }
        static disposeObjects(name) {
            if (ObjectPool._dataPool.hasOwnProperty(name)) {
                ObjectPool._dataPool[name].length = 0;
                delete ObjectPool._dataPool[name];
            }
        }
    }
    ObjectPool._dataPool = {};

    class SceneManager {
        constructor() {
            this.gameScale = 1;
            this.designWidth = GameConfig.width;
            this.designHeight = GameConfig.height;
            this.fixDisplayArr = [];
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new SceneManager();
                this._instance.Init();
            }
            return this._instance;
        }
        Init() {
            let s = this;
            s._stage = Laya.stage;
            s.gameLayer = new Laya.Sprite;
            s.gameLayer.width = s.designWidth;
            s.gameLayer.height = s.designHeight;
            s._stage.addChildAt(s.gameLayer, 0);
            s._stage.on(Laya.Event.RESIZE, s, s.contentSizeChanged);
            s.contentSizeChanged();
        }
        contentSizeChanged() {
            let s = this;
            let stageWidth = s._stage.width;
            let stageHeight = s._stage.height;
            let scaleX = stageWidth / s.designWidth;
            let scaleY = stageHeight / s.designHeight;
            if (scaleX < scaleY) {
                s.gameScale = scaleX;
            }
            else {
                s.gameScale = scaleY;
            }
            if (s.gameLayer) {
                s.gameLayer.width = s.designWidth;
                s.gameLayer.height = s.designHeight;
                s.gameLayer.scaleX = s.gameLayer.scaleY = s.gameScale;
                s.gameLayer.x = (stageWidth - s.gameLayer.width * s.gameScale) / 2;
                s.gameLayer.y = (stageHeight - s.gameLayer.height * s.gameScale) / 2;
            }
            s.fixLayout();
        }
        showScene(_scene) {
            let s = this;
            if (_scene) {
                s.gameLayer.addChild(_scene);
                s.setCurrentScene(_scene);
            }
        }
        setCurrentScene(scene) {
            let s = this;
            if (s.currentScene) {
                s.removeScene(s.currentScene);
                s.fixListen(s.currentScene, NaN, NaN, NaN, NaN);
            }
            s.currentScene = scene;
            s.fixListen(s.currentScene, 0, 0, 0, 0);
        }
        removeScene(scene) {
            let s = this;
            if (scene && scene.parent == s.gameLayer) {
                s.gameLayer.removeChild(scene);
                scene = null;
            }
        }
        dispose() {
            let s = this;
            let num = s.gameLayer.numChildren;
            while (num > 0) {
                let child = s.gameLayer.getChildAt(0);
                if (child instanceof BaseScene) {
                    s.removeScene(child);
                }
                else {
                    s.gameLayer.removeChild(child);
                }
                num -= 1;
            }
            if (s.gameLayer && s.gameLayer.parent == s._stage) {
                s._stage.removeChild(s.gameLayer);
                s.gameLayer = null;
            }
            s.currentScene = null;
            s._stage.off(Laya.Event.RESIZE, s, s.contentSizeChanged);
        }
        fixListen(obj, left = NaN, right = NaN, top = NaN, bottom = NaN, relativeParent = null) {
            let s = this;
            let fixObj;
            let index = -1;
            for (let i = 0; i < s.fixDisplayArr.length; ++i) {
                if (s.fixDisplayArr[i].display == obj) {
                    index = i;
                    fixObj = s.fixDisplayArr[i];
                    break;
                }
            }
            if (left != left && right != right && top != top && bottom != bottom) {
                if (fixObj) {
                    s.fixDisplayArr.splice(index, 1);
                    ObjectPool.recycleClass(fixObj);
                }
            }
            else {
                if (!fixObj) {
                    fixObj = ObjectPool.getByClass(FixDisplay);
                    s.fixDisplayArr.push(fixObj);
                }
                fixObj.display = obj;
                fixObj.left = left;
                fixObj.right = right;
                fixObj.top = top;
                fixObj.bottom = bottom;
                fixObj.relativeParent = relativeParent;
            }
            s.fixLayout();
        }
        fixLayout() {
            let s = this;
            let num = s.fixDisplayArr.length;
            let fixObj;
            let parentWidth;
            let parentHeight;
            let thisWidth;
            let thisHeight;
            let relativeObj;
            let newX, newY;
            let localPos;
            let globalPos;
            for (let i = 0; i < num; ++i) {
                fixObj = s.fixDisplayArr[i];
                relativeObj = fixObj.relativeParent ? fixObj.relativeParent : s._stage;
                parentWidth = relativeObj == s._stage ? s._stage.width : relativeObj.width;
                parentHeight = relativeObj == s._stage ? s._stage.height : relativeObj.height;
                thisWidth = fixObj.display.width;
                thisWidth = fixObj.display.height;
                if (isNaN(parentWidth) || parentHeight == undefined) {
                    parentWidth = 0;
                }
                if (isNaN(parentHeight) || parentHeight == undefined) {
                    parentHeight = 0;
                }
                if (isNaN(thisWidth) || thisWidth == undefined) {
                    thisWidth = 0;
                }
                if (isNaN(thisHeight) || thisHeight == undefined) {
                    thisWidth = 0;
                }
                if (!isNaN(fixObj.left) && isNaN(fixObj.right)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(fixObj.left, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newX = localPos.x;
                }
                else if (!isNaN(fixObj.right) && isNaN(fixObj.left)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(parentWidth - fixObj.right, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newX = localPos.x;
                }
                else if (!isNaN(fixObj.left) && !isNaN(fixObj.right)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(fixObj.left, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newX = localPos.x;
                    globalPos = relativeObj.localToGlobal(new Laya.Point(parentWidth - fixObj.right, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    thisWidth = localPos.x - newX;
                }
                if (!isNaN(fixObj.top) && isNaN(fixObj.bottom)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, fixObj.top));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newY = localPos.y;
                }
                else if (!isNaN(fixObj.bottom) && isNaN(fixObj.top)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, parentHeight - fixObj.bottom));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newY = localPos.y;
                }
                else if (!isNaN(fixObj.top) && !isNaN(fixObj.bottom)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, fixObj.top));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newY = localPos.y;
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, parentHeight - fixObj.bottom));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    thisHeight = localPos.y - newY;
                }
                fixObj.display.x = newX;
                fixObj.display.y = newY;
                if (fixObj.display.width != thisWidth) {
                    fixObj.display.width = thisWidth;
                }
                if (fixObj.display.height != thisHeight) {
                    fixObj.display.height = thisHeight;
                }
            }
        }
    }
    class FixDisplay {
    }

    class Main {
        constructor() {
            this.gameScale = 1;
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.stage.bgColor = "#00BFFF";
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.stage.frameRate = Global.FRAME_RATE.toString();
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
            Laya.loader.load(["../laya/assets/img/bg.png", "../laya/assets/img/A.png", "../laya/assets/img/A点击.png"], Laya.Handler.create(this, () => {
                SceneManager.instance.showScene(new MainScene);
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
