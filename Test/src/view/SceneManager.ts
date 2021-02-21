//场景管理类
import GameConfig from "../GameConfig";
import BaseScene from "./BaseScene";
import ObjectPool from "../util/ObjectPool";
export class SceneManager {
    private static _instance: SceneManager;
    public _stage: Laya.Stage;
    public currentScene: BaseScene;
    public gameScale: number = 1;
    public gameLayer: Laya.Sprite;
    /**
     * 设计分辨率
     */
    public designWidth: number = GameConfig.width;
    public designHeight: number = GameConfig.height;

    private fixDisplayArr: FixDisplay[] = [];

    private constructor() {
    }

    public static get instance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
            this._instance.Init();
        }
        return this._instance;
    }

    public Init() {
        let s = this;
        s._stage = Laya.stage;
        //s._stage.scaleMode = egret.StageScaleMode.FIXED_WIDTH;
        //s._stage.orientation = egret.OrientationMode.AUTO;
        s.gameLayer = new Laya.Sprite;
        s.gameLayer.width = s.designWidth;
        s.gameLayer.height = s.designHeight;
        s._stage.addChildAt(s.gameLayer, 0);
        s._stage.on(Laya.Event.RESIZE, s, s.contentSizeChanged);
        s.contentSizeChanged();
    }

    public contentSizeChanged() {
        // let scale = 1920 / 1080 > this._moduleBase.stage.stageWidth / this._moduleBase.stage.stageHeight ? 1 : 0;
        // if (scale == 1) {
        // 	this._moduleBase.stage.scaleMode = egret.StageScaleMode.FIXED_WIDTH;
        // 	//console.log("竖屏");
        // } else {
        // 	this._moduleBase.stage.scaleMode = egret.StageScaleMode.FIXED_HEIGHT;
        // 	//console.log("横屏");
        // }
        //console.log("stageWidth:" + this.stage.stageWidth + "     stageHeight:" + this.stage.stageHeight);
        //console.log("sceneWidth:" + SceneManager.Instance.currentScene.width + "     sceneHeight:" + SceneManager.Instance.currentScene.height);
        //console.log("sceneScaleX:" + SceneManager.Instance.currentScene.scaleX + "     sceneScaleY:" + SceneManager.Instance.currentScene.scaleY);

        //计算游戏画面等比例缩放系数
        let s = this;
        let stageWidth: number = s._stage.width;
        let stageHeight: number = s._stage.height;
        let scaleX = stageWidth / s.designWidth;
        let scaleY = stageHeight / s.designHeight;
        if (scaleX < scaleY) {
            s.gameScale = scaleX;
        } else {
            s.gameScale = scaleY;
        }

        if (s.gameLayer) {
            s.gameLayer.width = s.designWidth;
            s.gameLayer.height = s.designHeight;
            s.gameLayer.scaleX = s.gameLayer.scaleY = s.gameScale;
            s.gameLayer.x = (stageWidth - s.gameLayer.width * s.gameScale) / 2;
            s.gameLayer.y = (stageHeight - s.gameLayer.height * s.gameScale) / 2;
            // s.gameLayer.graphics.clear();
            // s.gameLayer.graphics.beginFill(0xff0000, 0.5);
            // s.gameLayer.graphics.drawRect(0, 0, s.gameLayer.width, s.gameLayer.height);
            // s.gameLayer.graphics.endFill();
        }

        //约束布局
        s.fixLayout();
    }

    public showScene(_scene: BaseScene) {
        let s = this;
        if (_scene) {
            s.gameLayer.addChild(_scene);
            s.setCurrentScene(_scene);
        }
    }

    private setCurrentScene(scene: any) {
        let s = this;
        if (s.currentScene) {
            s.removeScene(s.currentScene);
            s.fixListen(s.currentScene, NaN, NaN, NaN, NaN);
        }
        s.currentScene = scene;
        s.fixListen(s.currentScene, 0, 0, 0, 0);
    }

    public removeScene(scene: BaseScene) {
        let s = this;
        if (scene && scene.parent == s.gameLayer) {
            s.gameLayer.removeChild(scene);
            scene = null;
        }
    }

    public dispose() {
        let s = this;
        let num = s.gameLayer.numChildren;
        while (num > 0) {
            let child = s.gameLayer.getChildAt(0);
            if (child instanceof BaseScene) {
                s.removeScene(child);
            } else {
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

    /**
     * obj 需要布局约束的对象
     * left 相对左边距
     * right 右边距
     * top 上边距
     * bottom 下边距
     * relativeParent 约束布局的父级对象
     */
    public fixListen(obj: Laya.Sprite, left: number = NaN, right: number = NaN, top: number = NaN, bottom: number = NaN, relativeParent: Laya.Sprite = null) {
        let s = this;
        let fixObj: FixDisplay;
        let index: number = -1;
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
        } else {
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

    private fixLayout() {
        let s = this;
        let num = s.fixDisplayArr.length;
        let fixObj: FixDisplay;
        let parentWidth: number;
        let parentHeight: number;
        let thisWidth: number;
        let thisHeight: number;
        let relativeObj: Laya.Sprite;
        let newX: number, newY: number;
        let localPos: Laya.Point;
        let globalPos: Laya.Point;
        for (let i = 0; i < num; ++i) {
            fixObj = s.fixDisplayArr[i];
            relativeObj = fixObj.relativeParent ? fixObj.relativeParent : s._stage;
            parentWidth = relativeObj == s._stage ? s._stage.width : relativeObj.width;
            parentHeight = relativeObj == s._stage ? s._stage.height : relativeObj.height;
            thisWidth = fixObj.display.width;
            thisWidth = fixObj.display.height;

            //为了保证得到的宽高是数值型,这里进行了严格的检测
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

            // var widthChanged: boolean = false;//宽度有改变
            // var heightChanged: boolean = false;//高度有改变

            if (!isNaN(fixObj.left) && isNaN(fixObj.right)) {
                //fixObj.display.x = fixObj.left;
                globalPos = relativeObj.localToGlobal(new Laya.Point(fixObj.left, 0));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                newX = localPos.x;
            } else if (!isNaN(fixObj.right) && isNaN(fixObj.left)) {
                //fixObj.display.x = parentWidth - fixObj.right - thisWidth;
                globalPos = relativeObj.localToGlobal(new Laya.Point(parentWidth - fixObj.right, 0));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                newX = localPos.x;
            } else if (!isNaN(fixObj.left) && !isNaN(fixObj.right)) {
                //fixObj.display.x = fixObj.left;
                globalPos = relativeObj.localToGlobal(new Laya.Point(fixObj.left, 0));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                newX = localPos.x;

                globalPos = relativeObj.localToGlobal(new Laya.Point(parentWidth - fixObj.right, 0));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));

                thisWidth = localPos.x - newX;
            }

            if (!isNaN(fixObj.top) && isNaN(fixObj.bottom)) {
                //fixObj.display.y = fixObj.top;
                globalPos = relativeObj.localToGlobal(new Laya.Point(0, fixObj.top));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                newY = localPos.y;
            } else if (!isNaN(fixObj.bottom) && isNaN(fixObj.top)) {
                //fixObj.display.y = parentHeight - fixObj.bottom - thisHeight;
                globalPos = relativeObj.localToGlobal(new Laya.Point(0, parentHeight - fixObj.bottom));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                newY = localPos.y;
            } else if (!isNaN(fixObj.top) && !isNaN(fixObj.bottom)) {
                //fixObj.display.y = fixObj.top;
                globalPos = relativeObj.localToGlobal(new Laya.Point(0, fixObj.top));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                newY = localPos.y;

                globalPos = relativeObj.localToGlobal(new Laya.Point(0, parentHeight - fixObj.bottom));
                localPos = (<Laya.Sprite>fixObj.display.parent).globalToLocal(new Laya.Point(globalPos.x, globalPos.y));

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

/**
 * 约束布局对象类
 */
class FixDisplay {
    display: Laya.Sprite;
    left: number;
    right: number;
    top: number;
    bottom: number;
    relativeParent: Laya.Sprite
}