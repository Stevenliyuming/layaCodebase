export default class Skeleton extends Laya.Sprite {
    private _display: Laya.Skeleton;
    //private _dragonbonesData: any;
    // private _boneData: dragonBones.DragonBonesData
    // private _atlasData: dragonBones.TextureAtlasData[];
    //private _textureData: any;
    //private _texture: Laya.Texture;
    //public _armature: any;//dragonBones.EgretArmatureDisplay;
    //private _boneName: string;
    //private _aramtureName: string;
    private _endFunc: Function;
    private _endObject: any;
    private _completeEndFunc: Function;
    private _completeEndObject: any;
    private _sound: string;
    private _endAct: string;
    private _soundEndCallBack: Function;
    private _soundEndObject: any;
    private _curActionName: string;
    private _loop:boolean = false;
    //private _timeScale: number = 1;
    private _archorX: number = 0;
    private _archorY: number = 0;

    private loaded:boolean = false;
    private loadExecute:boolean = false;

    // private _movieClip: Laya.MovieClip;
    // private _mcScale: number = 1;
    // private _mcData: any;
    // private _mcTeX: any;
    // private _mcFrameRate: number;

    public constructor() {
        super();
        let s = this;
        s._display = new Laya.Skeleton;
        s.addChild(s._display);
    }

    public get display(): any {
        return this._display;
    }

    /**
     * bName:龙骨文件和帧动画文件前缀名称，导出时要统一命名
     * skPath:放置龙骨动画文件的文件夹路径
     * boneName:龙骨动画名称
     * armatureName:龙骨动画骨架名称
     * movieClipScale:帧动画缩放大小，有些帧动画导出时为了减小贴图大小，会缩放导出比例，显示的时候会比骨骼动画小，所以需要手动放大以达到骨骼动画的大小
     */
    public setDataByName(bName: string, skPath: string): void {
        let s = this;
        //s.clear();
        s._display.load(skPath + bName, Laya.Handler.create(s, s.loadFinish));
        s._display.x = -s._archorX;
        s._display.y = -s._archorY;
        s._display.on(Laya.Event.STOPPED, s, s.completeEndCall);
        //s._display.on(Laya.Event.COMPLETE, s, s.completeEndCall);

        // s._display.on(Laya.Event.LABEL, s, (event) => {
        //     let tEventData: Laya.EventData = event as Laya.EventData;
        //     console.log("动画事件 触发:", tEventData)
        // });
    
    }

    private loadFinish(e:Laya.Event) {
        let s = this;
        s.loaded = true;
        if(s.loadExecute) {
            s.play();
        }
    }

    /**
     * bName:龙骨名称
     * armatureName:骨架名称，骨架名称和龙骨名称一致时，可以只传bName
     */
    public setData(dragonData: any, textureData: any, tex: Laya.Texture, bName: string, armatureName: string = null): void {
        let s = this;
        // if (dragonData == null || textureData == null || tex == null) {
        //     console.error("龙骨资源不能为空！");
        //     return;
        // }
        // s.clear();
        // s._dragonbonesData = dragonData;
        // s._textureData = textureData;
        // s._texture = tex;
        // let egretFactory: dragonBones.EgretFactory = dragonBones.EgretFactory.factory;
        // //往龙骨工厂里添加资源
        // s._boneData = egretFactory.getDragonBonesData(bName);
        // if (s._boneData == null) {
        //     s._boneData = egretFactory.parseDragonBonesData(s._dragonbonesData, bName);
        // }
        // s._atlasData = egretFactory.getTextureAtlasData(bName);
        // if (s._atlasData == null) {
        //     egretFactory.parseTextureAtlasData(s._textureData, s._texture, bName);
        // }
        // s._atlasData = egretFactory.getTextureAtlasData(bName);
        // s._boneName = bName;
        // s._aramtureName = armatureName;
        // //不同龙骨文件骨架名称可能会一样，加上龙骨文件名称，避免错误
        // if (s._aramtureName) {
        //     s._armature = egretFactory.buildArmatureDisplay(s._aramtureName, s._boneName);//egretFactory.buildArmature(s._aramtureName, s._boneName);
        // }
        // else {
        //     //如果不传骨架名称，默认为龙骨名称就是骨架名称
        //     s._armature = egretFactory.buildArmatureDisplay(s._boneName);
        //     if (!s._armature) {
        //         console.log("不存在Aramture名称为：" + s._boneName + "的龙骨动画,需要指定一个正确骨架名称", "warn");
        //     }
        // }
        // s._armature.animation.timeScale = s._timeScale;
        // s._armature.addDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, s.skEnd, s);
        // s._armature.addDBEventListener(dragonBones.EventObject.COMPLETE, s.completeEndCall, s);
        // s._display = s._armature;
        // s._display.x = -s._archorX;
        // s._display.y = -s._archorY;
        // s.addChild(s._display);
    }

    public setMovieClipData(_mcData: any, _mcTexture: any, _mcName: string, _scale: number): void {
        let s = this;
        // if (_mcData == null || _mcTexture == null) {
        //     console.error("帧动画数据不能为空！");
        //     return;
        // }
        // // let readd: boolean = false;
        // // if (s._display && s._display.parent) {
        // // 	readd = true;
        // // }
        // s.clear();
        // s._mcData = _mcData;
        // s._mcTeX = _mcTexture;
        // var mcDataFactory = new egret.MovieClipDataFactory(_mcData, _mcTexture);
        // var mcData = mcDataFactory.generateMovieClipData(_mcName);
        // s._movieClip = new egret.MovieClip(mcData);
        // s._display = s._movieClip;
        // s.scale(_scale, _scale);
        // s._mcScale = _scale;
        // s._display.addEventListener(egret.Event.LOOP_COMPLETE, s.skEnd, s);
        // s._display.addEventListener(egret.Event.COMPLETE, s.completeEndCall, s);
        // s._display.x = -s._archorX;
        // s._display.y = -s._archorY;
        // s._mcFrameRate = mcData.frameRate;
        // s.addChild(s._display);
    }

    public scaleXY(sx: number, sy: number): void {
        let s = this;
        if (!s._display) return;
        // if (s._movieClip) {
        //     sx *= s._mcScale;
        //     sy *= s._mcScale;
        // }
        s._display.scaleX = sx;
        s._display.scaleY = sy;
    }

    public set scaleX(val: number) {
        let s = this;
        if (!s._display) return;
        // if (s._movieClip) {
        //     val *= s._mcScale;
        // }
        s._display.scaleX = val;
    }
    public get scaleX(): number {
        let s = this;
        let val = s._display.scaleX;
        // if (s._movieClip) {
        //     val = s._display.scaleX / s._mcScale;
        // }
        return val;
    }

    public set scaleY(val: number) {
        let s = this;
        if (!s._display) return;
        // if (s._movieClip) {
        //     val *= s._mcScale;
        // }
        s._display.scaleY = val;
    }
    public get scaleY(): number {
        let s = this;
        let val = s._display.scaleY;
        // if (s._movieClip) {
        //     val = s._display.scaleY / s._mcScale;
        // }
        return val;
    }

    public set alpha(val: number) {
        let s = this;
        if (!s._display) return;
        s._display.alpha = val;
    }
    public get alpha(): number {
        let s = this;
        return s._display ? s._display.alpha : 1;
    }

    // public get boneName(): string {
    //     return this._boneName;
    // }
    public get curActionName(): string {
        return this._curActionName;
    }

    private skEnd(e: Laya.Event): void {
        let s = this;
        if (s._endFunc != null) {
            s._endFunc.call(s._endObject, this);
        }
        if (s._sound == null && s._endAct) {
            s.gotoAndPlay(s._endAct);
            s._endAct = null;
        }
        //console.log("skEnd");
    }

    //添加动画最后一次循环结束时间监听
    public addAnimationCompleteListener(_fun: Function, obj: any) {
        let s = this;
        s._completeEndFunc = _fun;
        s._completeEndObject = obj;
    }
    //移除动画最后一次循环结束时间监听
    public removeAnimationCompleteListener() { }

    private completeEndCall(e: Laya.Event): void {
        let s = this;
        /**在这里派发一个loop_complete事件：帧动画播放最后一次底层是没有派发这个事件的 */
        // if (s._movieClip) {
        //     s._movieClip.dispatchEvent(new egret.Event(egret.Event.LOOP_COMPLETE));
        // }

        if (s._completeEndFunc != null) {
            let fun = s._completeEndFunc;
            let funObj = s._completeEndObject;
            s._completeEndFunc = null;
            s._completeEndObject = null;
            fun.call(funObj, this);
        }
        //console.log("completeEndCall");
    }

    /**调整速度百分比
     * @param val 速度百分比，默认是1 例如2，就是两倍
    */
    public setTimeScale(val: number): void {
        let s = this;
        // if (s._armature) {
        //     s._timeScale = val;
        //     s._armature.animation.timeScale = s._timeScale;
        // } else if (s._movieClip) {
        //     s._movieClip.frameRate = val * s._mcFrameRate;
        // }
    }

    public dispose(): void {
        let s = this;
        s.clear(true);
    }

    private clear(remove: boolean = false): void {
        let s = this;
        if (s._display && s._display.parent) {
            if ((<any>s._display.parent).removeElement)
                (<any>s._display.parent).removeElement(s._display);
            else
                (<any>s._display.parent).removeChild(s._display);
        }
        if (remove)
            s.hide();

        // if (s._armature) {
        //     // s._armature.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, s.skEnd, s);
        //     // s._armature.removeDBEventListener(dragonBones.EventObject.COMPLETE, s.completeEndCall, s);
        //     s._armature.dispose();
        //     s._armature = null;
        // }
        // if (s._dragonbonesData) {
        //     dragonBones.EgretFactory.factory.removeDragonBonesData(s._boneName);
        //     s._boneData = s._dragonbonesData = null;
        // }
        // if (s._textureData) {
        //     dragonBones.EgretFactory.factory.removeTextureAtlasData(s._boneName);
        //     s._atlasData = s._textureData = null;
        // }
        if (s._soundEndCallBack != null) {
            s._soundEndCallBack = null;
            s._soundEndObject = null;
        }
        if (s._sound) {
            Laya.SoundManager.stopSound(s._sound);
        }
        // s._textureData = null;
        // s._texture = null;
        s._display = null;

        //清空帧动画数据		
        // if (s._movieClip) {
        //     s._movieClip.removeEventListener(egret.Event.LOOP_COMPLETE, s.skEnd, s);
        //     s._movieClip.removeEventListener(egret.Event.COMPLETE, s.completeEndCall, s);
        //     s._movieClip.stop();
        // }
        // if (s._mcData) {
        //     s._mcData = null;
        // }
        // if (s._mcTeX) {
        //     s._mcTeX = null;
        // }
        //s._mcScale = 1.0;
    }

    public gotoAndPlay(actionName: string, loop: boolean = true, sound: string = null, endAct: string = null, soundEndCall: Function = null, soundThisObject: any = null): void {
        let s = this;
        s._curActionName = actionName;
        s._loop = loop;
        s._sound = sound;
        s._endAct = endAct;
        s._soundEndCallBack = soundEndCall;
        s._soundEndObject = soundThisObject;

        //判断播放骨骼动画还是帧动画
        if(s.loaded) {
            s.play();
        } else {
            s.loadExecute = true;
        }
    }

    private play() {
        let s = this;
        if (s._display) {
            s._display.play(s._curActionName, s._loop);
        }
        // else if (s._movieClip) {
        //     s._movieClip.gotoAndPlay(actionName, playTimes);
        // }

        if (s._sound) {
            Laya.SoundManager.playSound(s._sound, 1, Laya.Handler.create(s, s.soundEnd));
        }
    }

    private soundEnd(): void {
        let s = this;
        let func: Function, obj: any;
        func = s._soundEndCallBack;
        obj = s._soundEndObject;
        if (s._endAct) {
            s.gotoAndPlay(s._endAct);
            s._endAct = null;
        }
        if (func != null) {
            func.call(obj);
        }
    }

    /**停止动画
     * @param actionName 为null则停止所有动画
     * @param removeFromClock 是否从绘制时钟里面移除 
    */
    public stop(actionName: string = null, removeFromClock: boolean = true): void {
        let s = this;
        if (s._display) {
            s._display.stop();
        }
        // else if (s._movieClip) {
        //     s._movieClip.stop();
        // }
    }

    public show(pr: any, toX: number = 0, toY: number = 0): void {
        let s = this;
        pr.addChild(s);
        s.x = toX;
        s.y = toY;
    }

    public hide(): void {
        let s = this;
        if (s.parent) {
            if ((<any>s.parent).removeElement)
                (<any>s.parent).removeElement(this);
            else
                (<any>s.parent).removeChild(this);
        }
    }

    public setPlayEnd(func: Function, thisObject: any): void {
        let s = this;
        s._endFunc = func;
        s._endObject = thisObject;
    }
    public clearPlayEnd() {
        let s = this;
        if (s._endFunc) {
            s._endFunc = null;
            s._endObject = null;
        }
    }

    public set archorX(val: number) {
        let s = this;
        s._archorX = val;
        if (s._display)
            s._display.x = -s._archorX;
    }
    public set archorY(val: number) {
        let s = this;
        s._archorY = val;
        if (s._display)
            s._display.y = -s._archorY;
    }

    public get archorY(): number {
        return this._archorY;
    }
    public get archorX(): number {
        return this._archorX;
    }
}