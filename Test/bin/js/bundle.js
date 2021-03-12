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

    class Skeleton extends Laya.Sprite {
        constructor() {
            super();
            this._loop = false;
            this._archorX = 0;
            this._archorY = 0;
            this.loaded = false;
            this.loadExecute = false;
            let s = this;
            s._display = new Laya.Skeleton;
            s.addChild(s._display);
        }
        get display() {
            return this._display;
        }
        setDataByName(bName, skPath) {
            let s = this;
            s._display.load(skPath + bName, Laya.Handler.create(s, s.loadFinish));
            s._display.x = -s._archorX;
            s._display.y = -s._archorY;
            s._display.on(Laya.Event.STOPPED, s, s.completeEndCall);
        }
        loadFinish(e) {
            let s = this;
            s.loaded = true;
            if (s.loadExecute) {
                s.play();
            }
        }
        setData(dragonData, textureData, tex, bName, armatureName = null) {
            let s = this;
        }
        setMovieClipData(_mcData, _mcTexture, _mcName, _scale) {
            let s = this;
        }
        scaleXY(sx, sy) {
            let s = this;
            if (!s._display)
                return;
            s._display.scaleX = sx;
            s._display.scaleY = sy;
        }
        set scaleX(val) {
            let s = this;
            if (!s._display)
                return;
            s._display.scaleX = val;
        }
        get scaleX() {
            let s = this;
            let val = s._display.scaleX;
            return val;
        }
        set scaleY(val) {
            let s = this;
            if (!s._display)
                return;
            s._display.scaleY = val;
        }
        get scaleY() {
            let s = this;
            let val = s._display.scaleY;
            return val;
        }
        set alpha(val) {
            let s = this;
            if (!s._display)
                return;
            s._display.alpha = val;
        }
        get alpha() {
            let s = this;
            return s._display ? s._display.alpha : 1;
        }
        get curActionName() {
            return this._curActionName;
        }
        skEnd(e) {
            let s = this;
            if (s._endFunc != null) {
                s._endFunc.call(s._endObject, this);
            }
            if (s._sound == null && s._endAct) {
                s.gotoAndPlay(s._endAct);
                s._endAct = null;
            }
        }
        addAnimationCompleteListener(_fun, obj) {
            let s = this;
            s._completeEndFunc = _fun;
            s._completeEndObject = obj;
        }
        removeAnimationCompleteListener() { }
        completeEndCall(e) {
            let s = this;
            if (s._completeEndFunc != null) {
                let fun = s._completeEndFunc;
                let funObj = s._completeEndObject;
                s._completeEndFunc = null;
                s._completeEndObject = null;
                fun.call(funObj, this);
            }
        }
        setTimeScale(val) {
            let s = this;
        }
        dispose() {
            let s = this;
            s.clear(true);
        }
        clear(remove = false) {
            let s = this;
            if (s._display && s._display.parent) {
                if (s._display.parent.removeElement)
                    s._display.parent.removeElement(s._display);
                else
                    s._display.parent.removeChild(s._display);
            }
            if (remove)
                s.hide();
            if (s._soundEndCallBack != null) {
                s._soundEndCallBack = null;
                s._soundEndObject = null;
            }
            if (s._sound) {
                Laya.SoundManager.stopSound(s._sound);
            }
            s._display = null;
        }
        gotoAndPlay(actionName, loop = true, sound = null, endAct = null, soundEndCall = null, soundThisObject = null) {
            let s = this;
            s._curActionName = actionName;
            s._loop = loop;
            s._sound = sound;
            s._endAct = endAct;
            s._soundEndCallBack = soundEndCall;
            s._soundEndObject = soundThisObject;
            if (s.loaded) {
                s.play();
            }
            else {
                s.loadExecute = true;
            }
        }
        play() {
            let s = this;
            if (s._display) {
                s._display.play(s._curActionName, s._loop);
            }
            if (s._sound) {
                Laya.SoundManager.playSound(s._sound, 1, Laya.Handler.create(s, s.soundEnd));
            }
        }
        soundEnd() {
            let s = this;
            let func, obj;
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
        stop(actionName = null, removeFromClock = true) {
            let s = this;
            if (s._display) {
                s._display.stop();
            }
        }
        show(pr, toX = 0, toY = 0) {
            let s = this;
            pr.addChild(s);
            s.x = toX;
            s.y = toY;
        }
        hide() {
            let s = this;
            if (s.parent) {
                if (s.parent.removeElement)
                    s.parent.removeElement(this);
                else
                    s.parent.removeChild(this);
            }
        }
        setPlayEnd(func, thisObject) {
            let s = this;
            s._endFunc = func;
            s._endObject = thisObject;
        }
        clearPlayEnd() {
            let s = this;
            if (s._endFunc) {
                s._endFunc = null;
                s._endObject = null;
            }
        }
        set archorX(val) {
            let s = this;
            s._archorX = val;
            if (s._display)
                s._display.x = -s._archorX;
        }
        set archorY(val) {
            let s = this;
            s._archorY = val;
            if (s._display)
                s._display.y = -s._archorY;
        }
        get archorY() {
            return this._archorY;
        }
        get archorX() {
            return this._archorX;
        }
    }

    class BaseUIComponent extends Laya.Sprite {
        constructor() {
            super();
            this._isAddedToStage = false;
            this._top = NaN;
            this._left = NaN;
            this._bottom = NaN;
            this._right = NaN;
            this._horizontalCenter = NaN;
            this._verticalCenter = NaN;
            this._hasInvalidatePosition = false;
            this._drawDelay = false;
            this._hasInvalidate = false;
            this._data = null;
            this._enabled = true;
            this.elements = [];
            this.hashCode = 0;
            let s = this;
            s.hashCode = ++BaseUIComponent.$hashCode;
            s._drawDelay = false;
            s._isAddedToStage = false;
        }
        onEnable() {
            super.onEnable();
            let s = this;
            s._isAddedToStage = true;
            s.createChildren();
            s.initData();
            s.onInvalidatePosition();
            s.invalidate();
        }
        onDisable() {
            super.onDisable();
        }
        initData() {
        }
        createChildren() {
        }
        set width(w) {
            if (w >= 0) {
                super.set_width(w);
                this.onInvalidatePosition();
                this.invalidate();
            }
        }
        get width() {
            return this.get_width();
        }
        set height(h) {
            if (h >= 0) {
                super.set_height(h);
                this.onInvalidatePosition();
                this.invalidate();
            }
        }
        get height() {
            return this.get_height();
        }
        setSize(w, h) {
            let s = this;
            if (s.width != w || s.height != h) {
                s.width = w;
                s.height = h;
                s.onInvalidatePosition();
                s.invalidate();
            }
        }
        get top() {
            return this._top;
        }
        set top(value) {
            let s = this;
            if (s._top != value) {
                s._top = value;
                s.onInvalidatePosition();
            }
        }
        get left() {
            return this._left;
        }
        set left(value) {
            let s = this;
            if (s._left != value) {
                s._left = value;
                s.onInvalidatePosition();
            }
        }
        get bottom() {
            return this._bottom;
        }
        set bottom(value) {
            let s = this;
            if (s._bottom != value) {
                s._bottom = value;
                s.onInvalidatePosition();
            }
        }
        get right() {
            return this._right;
        }
        set right(value) {
            let s = this;
            if (s._right != value) {
                s._right = value;
                s.onInvalidatePosition();
            }
        }
        get horizontalCenter() {
            return this._horizontalCenter;
        }
        set horizontalCenter(value) {
            let s = this;
            if (s._horizontalCenter != value) {
                s._horizontalCenter = value;
                s.onInvalidatePosition();
            }
        }
        get verticalCenter() {
            return this._verticalCenter;
        }
        set verticalCenter(value) {
            let s = this;
            if (s._verticalCenter != value) {
                s._verticalCenter = value;
                s.onInvalidatePosition();
            }
        }
        onInvalidatePosition() {
            let s = this;
            if (!s._hasInvalidatePosition) {
                s._hasInvalidatePosition = true;
                Laya.timer.frameLoop(1, s, s.resetPosition);
                let child;
                for (var i = 0; i < s.numChildren; i++) {
                    child = s.getChildAt(i);
                    if (child instanceof BaseUIComponent) {
                        child.onInvalidatePosition();
                    }
                }
            }
        }
        resetPosition() {
            let s = this;
            var pr = s.parent;
            if (pr != null) {
                var parentWidth = pr.width;
                var parentHeight = pr.height;
                var thisWidth = s.width;
                var thisHeight = s.height;
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
                var widthChanged = false;
                var heightChanged = false;
                if (!isNaN(s._top) && isNaN(s._bottom)) {
                    s.y = s._top;
                }
                else if (!isNaN(s._bottom) && isNaN(s._top)) {
                    s.y = parentHeight - s._bottom - thisHeight;
                }
                else if (!isNaN(s._top) && !isNaN(s._bottom)) {
                    s.y = s._top;
                    thisHeight = parentHeight - s._top - s._bottom;
                    if (s.height != thisHeight) {
                        s.height = thisHeight;
                        heightChanged = true;
                    }
                }
                if (!isNaN(s._left) && isNaN(s._right)) {
                    s.x = s._left;
                }
                else if (!isNaN(s._right) && isNaN(s.left)) {
                    s.x = parentWidth - s._right - thisWidth;
                }
                else if (!isNaN(s.left) && !isNaN(s._right)) {
                    s.x = s._left;
                    thisWidth = parentWidth - s._left - s._right;
                    if (s.width != thisWidth) {
                        s.width = thisWidth;
                        widthChanged = true;
                    }
                }
                if (!isNaN(s._horizontalCenter) && !widthChanged) {
                    s.x = (parentWidth - thisWidth) / 2 + s._horizontalCenter;
                }
                if (!isNaN(s._verticalCenter) && !heightChanged) {
                    s.y = (parentHeight - thisHeight) / 2 + s._verticalCenter;
                }
                if (s.elements.length > 0) {
                    for (let i = 0; i < s.elements.length; ++i) {
                        this.addChild(s.elements[i]);
                    }
                    s.elements.length = 0;
                }
                let child;
                for (var i = 0; i < s.numChildren; i++) {
                    child = s.getChildAt(i);
                    if ((widthChanged || heightChanged) && child instanceof BaseUIComponent) {
                        child.onInvalidatePosition();
                    }
                    else {
                        if (child instanceof Laya.UIComponent) {
                            BaseUIComponent.resetChildPosition(child);
                        }
                    }
                }
            }
            Laya.timer.clear(s, s.resetPosition);
            s._hasInvalidatePosition = false;
        }
        static resetChildPosition(child) {
            var pr = child.parent;
            if (pr != null && child['top'] !== undefined && child['bottom'] !== undefined && child['left'] !== undefined && child['right'] !== undefined && child['centerX'] !== undefined && child['centerY'] !== undefined) {
                var parentWidth = pr.width;
                var parentHeight = pr.height;
                var thisWidth = child.width;
                var thisHeight = child.height;
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
                var widthChanged = false;
                var heightChanged = false;
                if (!isNaN(child['top']) && isNaN(child['bottom'])) {
                    child.y = child['top'];
                }
                else if (!isNaN(child['bottom']) && isNaN(child['top'])) {
                    child.y = parentHeight - child['bottom'] - thisHeight;
                }
                else if (!isNaN(child['top']) && !isNaN(child['bottom'])) {
                    child.y = child['top'];
                    thisHeight = parentHeight - child['top'] - child['bottom'];
                    if (child.height != thisHeight) {
                        child.height = thisHeight;
                        heightChanged = true;
                    }
                }
                if (!isNaN(child['left']) && isNaN(child['right'])) {
                    child.x = child['left'];
                }
                else if (!isNaN(child['right']) && isNaN(child['left'])) {
                    child.x = parentWidth - child['right'] - thisWidth;
                }
                else if (!isNaN(child['left']) && !isNaN(child['right'])) {
                    child.x = child['left'];
                    thisWidth = parentWidth - child['left'] - child['right'];
                    if (child.width != thisWidth) {
                        child.width = thisWidth;
                        widthChanged = true;
                    }
                }
                if (!isNaN(child['centerX']) && !widthChanged) {
                    child.x = (parentWidth - thisWidth) / 2 + child['centerX'];
                }
                if (!isNaN(child['centerY']) && !heightChanged) {
                    child.y = (parentHeight - thisHeight) / 2 + child['centerY'];
                }
                if (widthChanged || heightChanged) {
                    if (child.numChildren == undefined)
                        return;
                    let temp;
                    for (var i = 0; i < child.numChildren; i++) {
                        temp = child.getChildAt(i);
                        if (temp instanceof BaseUIComponent) {
                            temp.onInvalidatePosition();
                        }
                        else {
                            BaseUIComponent.resetChildPosition(temp);
                        }
                    }
                }
            }
        }
        addElement(child) {
            let s = this;
            if (s.elements.indexOf(child) >= 0)
                return;
            if (child instanceof Laya.UIComponent) {
                s.elements.push(child);
                s.onInvalidatePosition();
            }
            else {
                s.addChild(child);
            }
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
        }
        clean() {
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._enabled = value;
        }
        get cx() {
            return this.width / 2;
        }
        get cy() {
            return this.height / 2;
        }
        removeFromParent() {
            if (this.parent)
                this.parent.removeChild(this);
        }
        getGlobalXY() {
            var point = new Laya.Point(0, 0);
            point = this.localToGlobal(point, false);
            return point;
        }
        get actualWidth() {
            return this.width * this.scaleX;
        }
        get actualHeight() {
            return this.height * this.scaleX;
        }
        getRegPoint() {
            var regPoint = new Laya.Point(0, 0);
            if (this.pivotX != 0) {
                regPoint.x = this.pivotX;
            }
            if (this.pivotY != 0) {
                regPoint.y = this.pivotY;
            }
            return regPoint;
        }
        invalidate() {
            let s = this;
            if (!s._hasInvalidate && !s._drawDelay) {
                Laya.timer.frameLoop(2, s, s.onInvalidate);
                s._hasInvalidate = true;
            }
        }
        onInvalidate(event) {
            let s = this;
            s.draw();
            Laya.timer.clear(s, s.onInvalidate);
            s._hasInvalidate = false;
        }
        draw() {
        }
        set drawDelay(delay) {
            let s = this;
            s._drawDelay = delay;
            if (s._drawDelay) {
                s.off(Laya.Event.FRAME, s, s.onInvalidate);
                s._hasInvalidate = false;
            }
            else {
                s.invalidate();
            }
        }
        get drawDelay() {
            return this._drawDelay;
        }
        get isAddedToStage() {
            return this._isAddedToStage;
        }
    }
    BaseUIComponent.$hashCode = 0;

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
            var index = constructorString.indexOf("{");
            var className = constructorString.substring(0, index);
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

    class HeartBeat {
        static onEnterFrame(event) {
            var i = 0;
            var j = 0;
            var lenght = 0;
            var item = null;
            var runNum = 1;
            if (HeartBeat._lastTime > 0 && HeartBeat._eplasedTime > 0) {
                var timeNum = Math.floor((Date.now() - HeartBeat._lastTime) - HeartBeat._eplasedTime);
                if (timeNum > 0) {
                    HeartBeat._cumulativeTime += timeNum;
                    if (HeartBeat._cumulativeTime > HeartBeat._eplasedTime) {
                        runNum += Math.floor(HeartBeat._cumulativeTime / HeartBeat._eplasedTime);
                        HeartBeat._cumulativeTime = HeartBeat._cumulativeTime % HeartBeat._eplasedTime;
                    }
                }
            }
            for (var k = 0; k < runNum; k++) {
                lenght = HeartBeat._listeners.length - 1;
                for (i = lenght; i >= 0; i--) {
                    item = HeartBeat._listeners[i];
                    item.frameIndex++;
                    if (item.del) {
                        HeartBeat._listeners.splice(i, 1);
                        ObjectPool.recycleClass(item);
                        continue;
                    }
                    if (item.frameCount <= 1 || (item.frameIndex % item.frameCount) == 0) {
                        item.loopcount++;
                        if (item.loop > 0 && item.loopcount >= item.loop) {
                            item.del = true;
                        }
                        HeartBeat._functionCallList.unshift(item);
                    }
                }
            }
            lenght = HeartBeat._functionCallList.length;
            for (i = 0; i < lenght; i++) {
                item = HeartBeat._functionCallList.pop();
                HeartBeat.executeFunCall(item);
            }
            if (HeartBeat._listeners.length == 0)
                Laya.stage.off(Laya.Event.FRAME, this, HeartBeat.onEnterFrame);
            HeartBeat._lastTime = Laya.Browser.now();
        }
        static executeFunCall(item) {
            if (item.param && item.param.length > 0) {
                item.func.apply(item.thisArg, item.param);
            }
            else {
                if (item.func.length == 0) {
                    item.func.call(item.thisArg);
                }
                else {
                    item.func.call(item.thisArg, item.del);
                }
            }
        }
        static addListener(thisArg, respone, heartRrate = 1, repeat = -1, delay = 0, params = null, nowExecute = false) {
            if (respone == null || HeartBeat.hasListener(thisArg, respone))
                return false;
            var item = ObjectPool.getByClass(BeatItem);
            if (heartRrate <= 0)
                heartRrate = 1;
            item.setData(thisArg, respone, heartRrate, repeat, delay, params);
            HeartBeat._listeners.push(item);
            if (nowExecute) {
                item.loopcount++;
                HeartBeat.executeFunCall(item);
            }
            HeartBeat._lastTime = Date.now();
            Laya.timer.frameLoop(1, this, HeartBeat.onEnterFrame, null, true);
            return true;
        }
        static removeListener(thisArg, respone) {
            var i = 0;
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                if (HeartBeat._listeners[i].func == respone && HeartBeat._listeners[i].thisArg == thisArg) {
                    HeartBeat._listeners[i].del = true;
                    break;
                }
            }
        }
        static hasListener(thisArg, respone) {
            var i = 0;
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                if (HeartBeat._listeners[i].thisArg == thisArg && HeartBeat._listeners[i].func == respone && !HeartBeat._listeners[i].del) {
                    return true;
                }
            }
            return false;
        }
        static getHearBeatLenght() {
            return HeartBeat._listeners.length;
        }
        static init() {
            if (HeartBeat._eplasedTime == 0) {
                HeartBeat._eplasedTime = 1000 / Global.FRAME_RATE;
            }
        }
        static dispose() {
            var i = 0;
            var item;
            Laya.timer.clear(this, this.onEnterFrame);
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                item = HeartBeat._listeners[i];
                ObjectPool.recycleClass(item);
            }
            HeartBeat._listeners.length = 0;
            HeartBeat._functionCallList.length = 0;
            HeartBeat._lastTime = 0;
            HeartBeat._eplasedTime = 0;
            HeartBeat._cumulativeTime = 0;
        }
        static getHearBeatTrace() {
            var i = 0;
            var msg = "";
            var item = null;
            msg += "总数:" + HeartBeat._listeners.length + "\n";
            msg += "========================================================\n";
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                item = HeartBeat._listeners[i];
                if (item) {
                    msg += "基本信息 (" + i + "): ";
                    msg += "del=" + item.del + ", count=" + item.frameCount + ", index=" + item.frameIndex + ", loop=" + item.loop + ", loopCount=" + item.loopcount + "\n";
                    msg += "------------------------------------\n";
                }
            }
            msg += "========================================================\n";
            return msg;
        }
    }
    HeartBeat._listeners = new Array();
    HeartBeat._functionCallList = new Array();
    HeartBeat._MAX_EXECUTE_COUNT = 20;
    HeartBeat.isInit = false;
    HeartBeat._lastTime = 0;
    HeartBeat._eplasedTime = 0;
    HeartBeat._cumulativeTime = 0;
    HeartBeat.nowTime = 0;
    HeartBeat.realFrame = 0;
    HeartBeat.item = null;
    HeartBeat.endCall = false;
    class BeatItem {
        constructor() {
            this.func = null;
            this.thisArg = null;
            this.param = null;
            this.frameCount = 0;
            this.frameIndex = 0;
            this.loop = 0;
            this.loopcount = 0;
            this.delay = 0;
            this.del = false;
            this.traceMsg = null;
        }
        setData(thisArg, respone, heartRrate, repeat, delay, params) {
            this.thisArg = thisArg;
            this.func = respone;
            this.frameCount = heartRrate;
            this.loop = repeat;
            this.delay = delay;
            this.frameIndex = 0;
            this.loopcount = 0;
            this.del = false;
            this.param = params;
        }
    }

    class MyEvent {
        constructor(typeValue) {
            this.callStack = null;
            this.type = null;
            this.datas = {};
            this.type = typeValue;
        }
        addItem(property, value) {
            this.datas[property] = value;
        }
        getItem(property) {
            if (this.datas.hasOwnProperty(property)) {
                return this.datas[property];
            }
            return null;
        }
        hasItem(property) {
            return this.datas.hasOwnProperty(property);
        }
        destory() {
            this.callStack = null;
            for (var item in this.datas) {
                delete this.datas[item];
            }
        }
        removeItem(property) {
            if (this.datas.hasOwnProperty(property)) {
                delete this.datas[property];
                return true;
            }
            return false;
        }
        send() {
            EventManager.dispatchEvent(this);
        }
        static getEvent(type) {
            return EventManager.getEvent(type);
        }
        static sendEvent(type, param = null) {
            EventManager.dispatch(type, param);
        }
    }

    class EventManager {
        static getPacket(messageId, clientSide = true) {
            var packetArray = EventManager.packetCachePool[(clientSide ? "c_" : "s_") + messageId];
            if (packetArray == null) {
                packetArray = new Array();
                EventManager.packetCachePool[(clientSide ? "c_" : "s_") + messageId] = packetArray;
            }
            if (packetArray.length == 0) {
                var packetFactory = Global.getDefinitionByName("PacketFactory");
                if (packetFactory) {
                    return packetFactory.createPacket(messageId, clientSide);
                }
                return null;
            }
            return packetArray.shift();
        }
        static releasePacket(packet) {
            var packetArray = EventManager.packetCachePool[(packet.clientSide ? "c_" : "s_") + packet.header.messageId];
            if (packetArray == null) {
                packetArray = new Array();
                EventManager.packetCachePool[(packet.clientSide ? "c_" : "s_") + packet.header.messageId] = packetArray;
            }
            packetArray.push(packet);
        }
        static getEvent(type) {
            var eventArray = EventManager.eventCachePool[type];
            if (eventArray == null) {
                eventArray = [];
                EventManager.eventCachePool[type] = eventArray;
            }
            if (eventArray.length == 0) {
                return new MyEvent(type);
            }
            return eventArray.pop();
        }
        static releaseEvent(e) {
            var eventArray = EventManager.eventCachePool[e.type];
            if (eventArray == null) {
                eventArray = [];
                EventManager.eventCachePool[e.type] = eventArray;
            }
            e.destory();
            eventArray.push(e);
        }
        static addPacketEvent(messageId, response, thisArg) {
            if (response == null || EventManager.isContainerPacketEventListener(messageId, response, thisArg))
                return;
            var serverList = null;
            serverList = EventManager.packetEventList[EventManager.PREFIX + messageId];
            if (serverList == null) {
                serverList = new Array();
                EventManager.packetEventList[EventManager.PREFIX + messageId] = serverList;
            }
            serverList.push({ func: response, owner: thisArg });
        }
        static removePacketEvent(messageId, response, thisArg) {
            if (response == null || !EventManager.isContainerPacketEventListener(messageId, response, thisArg))
                return;
            var listenerList = EventManager.packetEventList[EventManager.PREFIX + messageId];
            if (listenerList)
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        listenerList.splice(i, 1);
                        break;
                    }
                }
        }
        static isContainerPacketEventListener(messageId, response, thisArg) {
            var listenerList = EventManager.packetEventList[EventManager.PREFIX + messageId];
            if (listenerList != null) {
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        return true;
                    }
                }
            }
            return false;
        }
        static dispactchPacket(packet) {
            if (packet != null) {
                this.packetSendCacheList.push(packet);
                HeartBeat.addListener(EventManager, EventManager.onFireDispactchPacket);
            }
            ;
        }
        static onFireDispactchPacket() {
            if (EventManager.packetSendCacheList.length > 0) {
                var packet = EventManager.packetSendCacheList.shift();
                var serverList = EventManager.packetEventList[EventManager.PREFIX + packet.header.messageId];
                if (serverList != null) {
                    var length = serverList.length;
                    for (var i = 0; i < length; i++) {
                        serverList[i]["func"].call(serverList[i]["owner"], packet);
                    }
                    EventManager.releasePacket(packet);
                }
            }
            if (this.packetSendCacheList.length == 0) {
                HeartBeat.removeListener(EventManager, EventManager.onFireDispactchPacket);
            }
        }
        static dispatch(type, param = null) {
            var myEvent = EventManager.getEvent(type);
            if (param) {
                var value = null;
                for (var key in param) {
                    if (key != "__class__" && key != "hashCode" && key != "__types__" && key != "__proto__") {
                        value = param[key];
                        if (!(value instanceof Function)) {
                            myEvent.addItem(key, value);
                        }
                    }
                }
            }
            EventManager.dispatchEvent(myEvent);
        }
        static dispatchEvent(e) {
            if (e != null) {
                EventManager.eventSendCacheList.push(e);
                HeartBeat.addListener(EventManager, EventManager.onFiredispatchEvent);
            }
        }
        static onFiredispatchEvent() {
            if (EventManager.eventSendCacheList.length > 0) {
                var e = EventManager.eventSendCacheList.shift();
                var listenerList = EventManager.commEventList[e.type];
                if (listenerList != null) {
                    for (var i = listenerList.length - 1; i >= 0; i--) {
                        listenerList[i]["func"].call(listenerList[i]["owner"], e);
                    }
                }
                EventManager.releaseEvent(e);
            }
            if (EventManager.eventSendCacheList.length == 0) {
                HeartBeat.removeListener(EventManager, EventManager.onFiredispatchEvent);
            }
        }
        static removeEventListener(eventType, response, thisArg) {
            var listenerList = EventManager.commEventList[eventType];
            if (listenerList != null) {
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        listenerList.splice(i, 1);
                        break;
                    }
                }
            }
        }
        static addEventListener(eventType, response, thisArg) {
            if (response == null || EventManager.isContainerEventListener(eventType, response, thisArg))
                return;
            var listenerList = EventManager.commEventList[eventType];
            if (listenerList == null) {
                listenerList = new Array();
                EventManager.commEventList["" + eventType] = listenerList;
            }
            listenerList.push({ func: response, owner: thisArg });
        }
        static isContainerEventListener(eventType, response, thisArg) {
            var listenerList = EventManager.commEventList["" + eventType];
            if (listenerList != null) {
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    EventManager.PREFIX = "PKT_";
    EventManager.packetEventList = {};
    EventManager.commEventList = {};
    EventManager.eventCachePool = {};
    EventManager.eventSendCacheList = [];
    EventManager.packetCachePool = {};
    EventManager.packetSendCacheList = [];

    class StringUtil {
        static dump(array) {
            var s = "";
            var a = "";
            for (var i = 0; i < array.length; i++) {
                if (i % 16 == 0)
                    s += ("0000" + i.toString(16)).substring(-4, 4) + " ";
                if (i % 8 == 0)
                    s += " ";
                var v = array[i].getInt32();
                s += ("0" + v.toString(16)).substring(-2, 2) + " ";
                if (((i + 1) % 16) == 0 || i == (array.length - 1)) {
                    s += " |" + a + "|\n";
                    a = "";
                }
            }
            return s;
        }
        static isUsage(value) {
            if (value == undefined || value == null || value == "" || value == "undefined" || value.trim() == "") {
                return false;
            }
            return true;
        }
        static randomRange(start, end = 0) {
            return Math.floor(start + (Math.random() * (end - start)));
        }
        static changToMoney(value, hasSign = false) {
            var i = 0;
            var count = 0;
            var str = "";
            if (hasSign) {
                if (value.charCodeAt(0) >= 48 && value.charCodeAt(0) <= 57) {
                    value = "+" + value;
                }
            }
            for (i = value.length - 1; i >= 0; i--) {
                str = value.charAt(i) + str;
                if (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) {
                    if (value.charCodeAt(i - 1) >= 48 && value.charCodeAt(i - 1) <= 57) {
                        count++;
                        if (count == 3) {
                            str = "," + str;
                            count = 0;
                        }
                    }
                }
                else {
                    count = 0;
                }
            }
            return str;
        }
        static getMatchesCount(subString, source) {
            var count = 0;
            var lastIndex = source.lastIndexOf(subString);
            var currentIndex = source.indexOf(subString);
            if (currentIndex == lastIndex && lastIndex >= 0) {
                return 1;
            }
            else if (currentIndex != lastIndex && lastIndex >= 0) {
                ++count;
                while (currentIndex != lastIndex) {
                    currentIndex = source.indexOf(subString, currentIndex + subString.length - 1);
                    if (currentIndex != -1) {
                        ++count;
                    }
                }
            }
            return count;
        }
        static changeIntToText(value = 0) {
            var str = "";
            if (value >= 10000) {
                str += Math.ceil(value / 10000).toFixed(0) + "万";
            }
            else if (value < 0) {
                str += "0";
            }
            else {
                str += value.toFixed(0);
            }
            return str;
        }
        static convertColor2Html(color = 0) {
            var colorHtml = "#000000";
            var colorTemp = "";
            try {
                colorTemp = color.toString(16);
                while (colorTemp.length < 6) {
                    colorTemp = "0" + colorTemp;
                }
                colorHtml = "#" + colorTemp;
            }
            catch (err) {
            }
            return colorHtml;
        }
        static htmlESC(value) {
            if (!StringUtil.isUsage(value)) {
                return null;
            }
            else {
                var ampPattern = /&/g;
                var ltPattern = /</g;
                var gtPattern = />/g;
                value = value.replace(ampPattern, "&amp;");
                value = value.replace(ltPattern, "&lt;");
                value = value.replace(gtPattern, "&gt;");
                return value;
            }
        }
        static replaceNumberToArray(value) {
            var numVector = new Array();
            var str = value.toString();
            var len = str.length;
            for (var i = 0; i < len; i++) {
                numVector.push(str.charAt(i));
            }
            return numVector;
        }
        static replace(content, src, target) {
            if (!StringUtil.isUsage(content))
                return "";
            while (content.indexOf(src) >= 0)
                content = content.replace(src, target);
            return content;
        }
        static splitStrArr(str, split) {
            var result = [];
            if (StringUtil.isUsage(str)) {
                var sd = str.split(split);
                for (var i = 0; i < sd.length; i++) {
                    if (StringUtil.isUsage(sd[i])) {
                        result.push(sd[i]);
                    }
                }
            }
            return result;
        }
        static parserStrToObj(str, item = null, kvSplit = "@", split = ";") {
            var obj = {};
            if (item)
                obj = item;
            if (!StringUtil.isUsage(str))
                return obj;
            var result1 = StringUtil.splitStrArr(str, split);
            var keyvalue = null;
            for (var i = 0; i < result1.length; i++) {
                keyvalue = StringUtil.splitStrArr(result1[i], kvSplit);
                if (keyvalue.length == 2) {
                    var typeValue = typeof (obj[keyvalue[0]]);
                    if (typeValue == "number") {
                        obj[keyvalue[0]] = parseInt(keyvalue[1]);
                    }
                    else if (typeValue == "boolean") {
                        obj[keyvalue[0]] = keyvalue[1] == "true";
                    }
                    else {
                        if (obj[keyvalue[0]] instanceof Array) {
                            obj[keyvalue[0]] = StringUtil.splitStrArr(keyvalue[1], ",");
                        }
                        else {
                            obj[keyvalue[0]] = keyvalue[1];
                        }
                    }
                }
            }
            return obj;
        }
        static parserObjToStr(obj, kvSplit = "@", split = ";") {
            var str = "";
            for (var key in obj) {
                if (key != "__class__" && key != "hashCode" && key != "__types__" && key != "__proto__") {
                    if (!(obj[key] instanceof Function)) {
                        str += key + kvSplit + obj[key] + split;
                    }
                }
            }
            return str;
        }
        static isPhone(str) {
            if (StringUtil.isUsage(str) && str.length == 11) {
                var num = parseInt(str);
                if (("" + num) == str) {
                    return true;
                }
            }
            return false;
        }
        static formatTime(timer, formate = ":") {
            var str = "";
            var minute = Math.floor(timer / 60);
            if (minute < 10) {
                str = "0" + minute;
            }
            else {
                str = "" + minute;
            }
            str += formate;
            var second = Math.floor(timer % 60);
            if (second < 10) {
                str += "0" + second;
            }
            else {
                str += "" + second;
            }
            return str;
        }
        static dateFormat(date, fmt) {
            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
    }

    class Style {
        constructor() {
        }
        static setStyle(style) {
            switch (style) {
                case Style.DARK:
                    Style.BACKGROUND = 0x444444;
                    Style.BUTTON_FACE = 0x666666;
                    Style.BUTTON_DOWN = 0x222222;
                    Style.INPUT_TEXT = 0xBBBBBB;
                    Style.LABEL_TEXT = 0xCCCCCC;
                    Style.PANEL = 0x666666;
                    Style.PROGRESS_BAR = 0x666666;
                    Style.TEXT_BACKGROUND = 0x555555;
                    Style.LIST_DEFAULT = 0x444444;
                    Style.LIST_ALTERNATE = 0x393939;
                    Style.LIST_SELECTED = 0x666666;
                    Style.LIST_ROLLOVER = 0x777777;
                    break;
                case Style.LIGHT:
                default:
                    Style.BACKGROUND = 0xCCCCCC;
                    Style.BUTTON_FACE = 0xFFFFFF;
                    Style.BUTTON_DOWN = 0xEEEEEE;
                    Style.INPUT_TEXT = 0x333333;
                    Style.LABEL_TEXT = 0x666666;
                    Style.PANEL = 0xF3F3F3;
                    Style.PROGRESS_BAR = 0xFFFFFF;
                    Style.TEXT_BACKGROUND = 0xFFFFFF;
                    Style.LIST_DEFAULT = 0xFFFFFF;
                    Style.LIST_ALTERNATE = 0xF3F3F3;
                    Style.LIST_SELECTED = 0xCCCCCC;
                    Style.LIST_ROLLOVER = 0xDDDDDD;
                    break;
            }
        }
    }
    Style.TEXT_BACKGROUND = 0xFFFFFF;
    Style.BACKGROUND = 0xCCCCCC;
    Style.BUTTON_FACE = 0xFFFFFF;
    Style.BUTTON_DOWN = 0xEEEEEE;
    Style.INPUT_TEXT = 0x333333;
    Style.LABEL_TEXT = 0x000000;
    Style.BUTTON_TEXT = 0x666666;
    Style.DROPSHADOW = 0x000000;
    Style.PANEL = 0xF3F3F3;
    Style.PROGRESS_BAR = 0xFFFFFF;
    Style.LIST_DEFAULT = 0xFFFFFF;
    Style.LIST_ALTERNATE = 0xF3F3F3;
    Style.LIST_SELECTED = 0xCCCCCC;
    Style.LIST_ROLLOVER = 0XDDDDDD;
    Style.BUTTON_DEFAULT_WIDTH = 100;
    Style.BUTTON_DEFAULT_HEIGHT = 32;
    Style.VIDEO_DEFAULT_WIDTH = 320;
    Style.VIDEO_DEFAULT_HEIGHT = 250;
    Style.embedFonts = false;
    Style.fontName = null;
    Style.fontSize = 26;
    Style.allowDefaultLabelFilter = true;
    Style.DARK = "dark";
    Style.LIGHT = "light";
    Style.allowColorFilterButtonEnabled = false;
    Style.allowButtonDefaultCoolDown = false;
    Style.defaultCoolDownFrames = 2;
    Style.TEXTINPUT_HEIGHT = 25;
    Style.TEXTINPUT_WIDTH = 100;
    Style.TEXTINPUT_COLOR = 0xffffff;
    Style.HORIZONTAL = "horizontal";
    Style.VERTICAL = "vertical";
    Style.SLIDER_WIDTH = 300;
    Style.SLIDER_HEIGHT = 17;
    Style.SCROLLBAR_WIDTH = 300;
    Style.SCROLLBAR_HEIGHT = 17;
    Style.BASEGROUP_WIDTH = 100;
    Style.BASEGROUP_HEIGHT = 100;

    class Button extends BaseUIComponent {
        constructor() {
            super();
            this._textureLabel = null;
            this._textureIcon = null;
            this._label = null;
            this._text = "";
            this._texture = null;
            this._imgDisplay = null;
            this._imgLabel = null;
            this._imgIcon = null;
            this._initDisplayData = false;
            this._selected = false;
            this._toggleGroup = null;
            this.stateArray = [Button.STATE_UP];
            this._currentState = Button.STATE_UP;
            this._textureDict = {};
            this._verticalSplit = true;
            this._labelMarginLeft = 0;
            this._labelMarginTop = 0;
            this._iconMarginLeft = 0;
            this._iconMarginTop = 0;
            this._autoSize = false;
            this._labelColor = Style.BUTTON_TEXT;
            this._labelBold = false;
            this._labelItalic = false;
            this._labelLineSpacing = 0;
            this._labelMultiline = false;
            this._labelStroke = 0;
            this._labelStrokeColor = 0x003350;
            this._fontSize = 12;
            this._fontName = null;
            this._scale9GridRect = null;
            this._fillMode = "scale";
            this._testPixelEnable = false;
        }
        createChildren() {
            super.createChildren();
            this.mouseThrough = false;
            this._imgDisplay = new Laya.Image;
            this.addChild(this._imgDisplay);
            this._imgDisplay.width = this.width;
            this._imgDisplay.height = this.height;
            this._label = new Laya.Text;
            this._label.autoSize = true;
            this._label.align = Laya.Stage.ALIGN_CENTER;
            this._label.valign = Laya.Stage.ALIGN_MIDDLE;
            this.addChild(this._label);
            this.on(Laya.Event.MOUSE_DOWN, this, this.onTouchEvent);
            this.on(Laya.Event.MOUSE_UP, this, this.onTouchEvent);
            this.on(Laya.Event.MOUSE_OUT, this, this.onTouchRleaseOutside);
        }
        onTouchEvent(event) {
            if (!this.enabled) {
                event.stopPropagation();
                return;
            }
            if (event.target == this) {
                if (this._testPixelEnable) {
                    if (!this.testPixel32(this.mouseX, this.mouseX)) {
                        event.stopPropagation();
                        return;
                    }
                }
                if (StringUtil.isUsage(this._toggleGroup)) {
                    if (event.type == Laya.Event.MOUSE_DOWN) {
                        this.selected = !this._selected;
                    }
                    this.onPlaySound();
                }
                else {
                    if (event.type == Laya.Event.MOUSE_DOWN) {
                        this._currentState = Button.STATE_DOWN;
                        this.callClickFunction();
                        this.onPlaySound();
                    }
                    else if (event.type == Laya.Event.MOUSE_UP) {
                        this._currentState = Button.STATE_UP;
                    }
                    else if (event.type == Laya.Event.MOUSE_OVER) {
                        this._currentState = Button.STATE_OVER;
                    }
                    if (this.statesLength == 1 && this._currentState == Button.STATE_DOWN) {
                        this.alpha = 0.8;
                    }
                    else {
                        this.alpha = 1;
                    }
                }
            }
            this.invalidate();
        }
        onTouchRleaseOutside(event) {
            if (!StringUtil.isUsage(this._toggleGroup) || (StringUtil.isUsage(this._toggleGroup) && !this._selected)) {
                this._currentState = Button.STATE_UP;
                this.invalidate();
                this.scaleX = 1;
                this.scaleY = 1;
                this.alpha = 1;
            }
        }
        setClickFunction(fun, obj) {
            this.clickFun = fun;
            this.clickFunObj = obj;
        }
        callClickFunction() {
            if (this.clickFun && this.clickFunObj) {
                this.clickFun.call(this.clickFunObj, this);
            }
        }
        get currentState() {
            return this._currentState;
        }
        set currentState(value) {
            if (this._currentState != value) {
                this._currentState = value;
                this.invalidate();
            }
        }
        get texture() {
            return this._texture;
        }
        set texture(value) {
            if (this._texture != value) {
                this._initDisplayData = false;
                this._texture = value;
                this.invalidate();
            }
        }
        get fillMode() {
            return this._fillMode;
        }
        set fillMode(value) {
            if (this._fillMode != value) {
                this._fillMode = value;
                this.invalidate();
            }
        }
        scale9GridRect() {
            return this._scale9GridRect;
        }
        scale9Grid(scale9Rectangle = []) {
            if (scale9Rectangle.length == 4) {
                if (this._scale9GridRect == null) {
                    this._scale9GridRect = new Laya.Rectangle;
                }
                let x = scale9Rectangle[0];
                let y = scale9Rectangle[2];
                let width = this.width - (scale9Rectangle[0] + scale9Rectangle[1]);
                let height = this.height - (scale9Rectangle[2] + scale9Rectangle[3]);
                this._scale9GridRect.x = x;
                this._scale9GridRect.y = y;
                this._scale9GridRect.width = width;
                this._scale9GridRect.height = height;
            }
            else {
                this._scale9GridRect = null;
            }
            this.invalidate();
        }
        draw() {
            let s = this;
            if (!s._initDisplayData) {
                if (!s._texture) {
                    if (Button.DEFAULT_TEXTURE == null) {
                        s.initDefaultTexture();
                    }
                    s._texture = Button.DEFAULT_TEXTURE;
                }
                s.splitTextureSource();
            }
            if (s._imgDisplay == null) {
                return;
            }
            if (s.statesLength == 1 && s._currentState == Button.STATE_DOWN) {
                s._imgDisplay.texture = s._textureDict[Button.STATE_UP];
            }
            else {
                s._imgDisplay.texture = s._textureDict[s._currentState];
            }
            if (s._scale9GridRect != null) {
                s._imgDisplay.sizeGrid = s._scale9GridRect.toString();
            }
            else {
                s._imgDisplay.sizeGrid = null;
            }
            s._imgDisplay.width = s.width;
            s._imgDisplay.height = s.height;
            s._imgDisplay.pivotX = s._imgDisplay.width / 2;
            s._imgDisplay.pivotY = s._imgDisplay.height / 2;
            s._imgDisplay.x = s.width / 2;
            s._imgDisplay.y = s.height / 2;
            if (s._textureLabel != null) {
                if (s._imgLabel == null) {
                    s._imgLabel = new Laya.Image;
                    s.addChild(s._imgLabel);
                }
                s._imgLabel.texture = s._textureLabel;
                if (!isNaN(s._labelMarginLeft)) {
                    s._imgLabel.x = s._labelMarginLeft;
                }
                else {
                    s._imgLabel.x = (s.width - s._imgLabel.width) / 2;
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._imgLabel.y = s._labelMarginTop;
                }
                else {
                    s._imgLabel.y = (s.height - s._imgLabel.height) / 2;
                }
            }
            if (s._textureIcon != null) {
                if (s._imgIcon == null) {
                    s._imgIcon = new Laya.Image;
                    s.addChild(s._imgIcon);
                }
                s._imgIcon.texture = s._textureIcon;
                if (!isNaN(s._iconMarginLeft)) {
                    s._imgIcon.x = s._iconMarginLeft;
                }
                else {
                    s._imgIcon.x = (s.width - s._imgIcon.width) / 2;
                }
                if (!isNaN(s._iconMarginTop)) {
                    s._imgIcon.y = s._iconMarginTop;
                }
                else {
                    s._imgIcon.y = (s.height - s._imgIcon.height) / 2;
                }
            }
            if (s._label) {
                if (!s._label.parent)
                    s.addChild(s._label);
                s._label.text = s._text;
                s._label.fontSize = s._fontSize;
                s._label.font = s._fontName;
                s._label.bold = s._labelBold;
                s._label.italic = s._labelItalic;
                s._label.stroke = s._labelStroke;
                if (!isNaN(s._labelMarginLeft)) {
                    s._label.x = s._labelMarginLeft;
                }
                else {
                    s._label.x = (s.width - s._label.width) / 2;
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._label.y = s._labelMarginTop;
                }
                else {
                    s._label.y = (s.height - s._label.height) / 2;
                }
            }
        }
        initDefaultTexture() {
            if (Button.DEFAULT_TEXTURE == null) {
                this.setSize(Style.BUTTON_DEFAULT_WIDTH, Style.BUTTON_DEFAULT_HEIGHT);
                var shape = new Laya.Sprite;
                shape.width = this.width;
                shape.height = this.height;
                shape.graphics.drawRect(0, 0, this.width, this.height, Style.BUTTON_FACE);
                shape.graphics.drawRect(0, 0, this.width - 1, this.height - 1, 0x000000);
                var htmlC = shape.drawToCanvas(shape.width, shape.height, 0, 0);
                Button.DEFAULT_TEXTURE = new Laya.Texture(htmlC.getTexture());
            }
        }
        splitTextureSource() {
            if (this._texture) {
                this._initDisplayData = true;
                var splitWidth = 0;
                var splitHeight = 0;
                var textureWidth = this._texture.sourceWidth;
                var textureHeight = this._texture.sourceHeight;
                if (this.stateArray.length == 1) {
                    splitWidth = textureWidth;
                    splitHeight = textureHeight;
                    this._textureDict[this.stateArray[0]] = this._texture;
                }
                else {
                    var i = 0;
                    var xOffset = 0;
                    var yOffset = 0;
                    if (this._verticalSplit) {
                        splitWidth = textureWidth;
                        splitHeight = textureHeight / this.statesLength;
                    }
                    else {
                        splitWidth = textureWidth / this.statesLength;
                        splitHeight = textureHeight;
                    }
                    for (i = 0; i < this.stateArray.length; i++) {
                        if (this._verticalSplit) {
                            this._textureDict[this.stateArray[i]] = Laya.Texture.createFromTexture(this._texture, xOffset, yOffset + i * splitHeight, splitWidth, splitHeight);
                        }
                        else {
                            this._textureDict[this.stateArray[i]] = Laya.Texture.createFromTexture(this._texture, xOffset + i * splitWidth, yOffset, splitWidth, splitHeight);
                        }
                    }
                }
                if (this._autoSize) {
                    this.width = splitWidth;
                    this.height = splitHeight;
                }
            }
        }
        set upSkin(value) {
            if (!this.isStateExist(Button.STATE_UP)) {
                this.stateArray.push(Button.STATE_UP);
            }
            this._textureDict[Button.STATE_UP] = value;
            this.invalidate();
        }
        get upSkin() {
            return this._textureDict[Button.STATE_UP];
        }
        set overSkin(value) {
            if (!this.isStateExist(Button.STATE_OVER)) {
                this.stateArray.push(Button.STATE_OVER);
            }
            this._textureDict[Button.STATE_OVER] = value;
            this.invalidate();
        }
        get overSkin() {
            return this._textureDict[Button.STATE_OVER];
        }
        set downSkin(value) {
            if (!this.isStateExist(Button.STATE_DOWN)) {
                this.stateArray.push(Button.STATE_DOWN);
            }
            this._textureDict[Button.STATE_DOWN] = value;
            this.invalidate();
        }
        get downSkin() {
            return this._textureDict[Button.STATE_DOWN];
        }
        set disableSkin(value) {
            if (!this.isStateExist(Button.STATE_DISABLE)) {
                this.stateArray.push(Button.STATE_DISABLE);
            }
            this._textureDict[Button.STATE_DISABLE] = value;
            this.invalidate();
        }
        get disableSkin() {
            return this._textureDict[Button.STATE_DISABLE];
        }
        isStateExist(state) {
            if (this.stateArray.indexOf(state) != -1) {
                return true;
            }
            return false;
        }
        set label(value) {
            this._text = value;
            if (this._label) {
                this._label.text = this._text;
            }
            this.invalidate();
        }
        get label() {
            return this._text;
        }
        set selected(value) {
            this._selected = value;
            this._currentState = (this._selected ? Button.STATE_DOWN : Button.STATE_UP);
            if (this._selected && StringUtil.isUsage(this._toggleGroup)) {
                var myevent = MyEvent.getEvent(Button.TOGGLE_PREFIX + this._toggleGroup);
                myevent.addItem("caller", this);
                myevent.addItem("group", this._toggleGroup);
                myevent.send();
            }
            this.invalidate();
        }
        get selected() {
            return this._selected;
        }
        setStatus(statusSkin = []) {
            let statusNum = statusSkin.length == 0 ? 1 : statusSkin.length;
            switch (statusNum) {
                case 1:
                    this.stateArray = [Button.STATE_UP];
                    break;
                case 2:
                    this.stateArray = [Button.STATE_UP, Button.STATE_DOWN];
                    break;
                case 3:
                    this.stateArray = [Button.STATE_UP, Button.STATE_DOWN, Button.STATE_OVER];
                    break;
                case 4:
                    this.stateArray = [Button.STATE_UP, Button.STATE_DOWN, Button.STATE_OVER, Button.STATE_DISABLE];
                    break;
            }
            this._initDisplayData = false;
            if (statusSkin.length > 0) {
                this._initDisplayData = true;
                for (let i = 0; i < this.stateArray.length; ++i) {
                    if (statusSkin[i]) {
                        this._textureDict[this.stateArray[i]] = statusSkin[i];
                    }
                    else {
                        this._initDisplayData = false;
                        console.warn("指定的状态数和状态图片数不一致");
                        break;
                    }
                }
            }
            if (this._initDisplayData)
                this.setSize(statusSkin[0].sourceWidth, statusSkin[0].sourceHeight);
            this.invalidate();
        }
        get statesLength() {
            return this.stateArray.length;
        }
        set imgLabel(value) {
            if (this._textureLabel != value) {
                this._textureLabel = value;
                this.invalidate();
            }
        }
        get imgLabel() {
            return this._textureLabel;
        }
        set imgIcon(value) {
            if (this._textureIcon != value) {
                this._textureIcon = value;
                this.invalidate();
            }
        }
        get imgIcon() {
            return this._textureIcon;
        }
        set labelColor(value) {
            if (this._labelColor != value) {
                this._labelColor = value;
                if (this._label) {
                    let colorStr = value.toString();
                    this._label.color = colorStr.substring(2, colorStr.length);
                }
                this.invalidate();
            }
        }
        get labelColor() {
            return this._labelColor;
        }
        set fontName(value) {
            if (this._fontName != value) {
                this._fontName = value;
                this.invalidate();
            }
        }
        get fontName() {
            return this._fontName;
        }
        set fontSize(value) {
            if (this._fontSize != value) {
                this._fontSize = value;
                this.invalidate();
            }
        }
        get fontSize() {
            return this._fontSize;
        }
        set labelMarginLeft(value) {
            if (this._labelMarginLeft != value) {
                this._labelMarginLeft = value;
                this.invalidate();
            }
        }
        get labelMarginLeft() {
            return this._labelMarginLeft;
        }
        set labelMarginTop(value) {
            if (this._labelMarginTop != value) {
                this._labelMarginTop = value;
                this.invalidate();
            }
        }
        get labelMarginTop() {
            return this._labelMarginTop;
        }
        set iconMarginLeft(value) {
            if (this._iconMarginLeft != value) {
                this._iconMarginLeft = value;
                this.invalidate();
            }
        }
        get iconMarginLeft() {
            return this._iconMarginLeft;
        }
        set iconMarginTop(value) {
            if (this._iconMarginTop != value) {
                this._iconMarginTop = value;
                this.invalidate();
            }
        }
        get iconMarginTop() {
            return this._iconMarginTop;
        }
        set toggleGroup(value) {
            if (StringUtil.isUsage(this._toggleGroup)) {
                EventManager.removeEventListener(Button.TOGGLE_PREFIX + this._toggleGroup, this.onEventToggle, this);
            }
            this._toggleGroup = value;
            if (StringUtil.isUsage(this._toggleGroup)) {
                EventManager.addEventListener(Button.TOGGLE_PREFIX + this._toggleGroup, this.onEventToggle, this);
            }
        }
        get toggleGroup() {
            return this._toggleGroup;
        }
        onEventToggle(event) {
            if (StringUtil.isUsage(this._toggleGroup) && event.getItem("group") == this._toggleGroup) {
                if (event.getItem("caller") != this) {
                    this._selected = false;
                    this._currentState = Button.STATE_UP;
                    this.invalidate();
                }
                else {
                    if (this.clickFun && this.clickFunObj) {
                        this.clickFun.call(this.clickFunObj, event);
                    }
                }
            }
        }
        setSize(w, h) {
            super.setSize(w, h);
        }
        onPlaySound() {
            if (StringUtil.isUsage(this._soundName)) {
                Laya.SoundManager.playSound(this._soundName);
            }
        }
        set sound(value) {
            this._soundName = value;
        }
        get sound() {
            return this._soundName;
        }
        set labelBold(value) {
            if (this._labelBold != value) {
                this._labelBold = value;
                this.invalidate();
            }
        }
        get labelBold() {
            return this._labelBold;
        }
        set labelItalic(value) {
            if (this._labelItalic != value) {
                this._labelItalic = value;
                this.invalidate();
            }
        }
        get labelItalic() {
            return this._labelItalic;
        }
        set labelLineSpacing(value) {
            if (this._labelLineSpacing != value) {
                this._labelLineSpacing = value;
                this.invalidate();
            }
        }
        get labelLineSpacing() {
            return this._labelLineSpacing;
        }
        set labelMultiline(value) {
            if (this._labelMultiline != value) {
                this._labelMultiline = value;
                this.invalidate();
            }
        }
        get labelMultiline() {
            return this._labelMultiline;
        }
        set labelStroke(value) {
            if (this._labelStroke != value) {
                this._labelStroke = value;
                this.invalidate();
            }
        }
        get labelStroke() {
            return this._labelStroke;
        }
        set labelStrokeColor(value) {
            if (this._labelStrokeColor != value) {
                this._labelStrokeColor = value;
                this.invalidate();
            }
        }
        get labelStrokeColor() {
            return this._labelStrokeColor;
        }
        set testPixelEnable(value) {
            this._testPixelEnable = value;
        }
        get testPixelEnable() {
            return this._testPixelEnable;
        }
        getPixel32(x, y) {
            var locolPoint = this.globalToLocal(new Laya.Point(x, y));
            var found;
            var datas = null;
            if (this._imgDisplay && this._imgDisplay.texture) {
                datas = this._imgDisplay.texture.getPixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }
            if (this._imgLabel && this._imgLabel.texture) {
                datas = this._imgLabel.texture.getPixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }
            if (this._imgIcon && this._imgIcon.texture) {
                datas = this._imgIcon.texture.getPixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }
            return null;
        }
        testPixel32(x, y) {
            var datas = this.getPixel32(x, y);
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    return true;
                }
            }
            return false;
        }
    }
    Button.TOGGLE_PREFIX = "ui#button#toggle_";
    Button.DEFAULT_TEXTURE = null;
    Button.STATE_UP = "up";
    Button.STATE_DOWN = "down";
    Button.STATE_OVER = "over";
    Button.STATE_DISABLE = "disable";

    class BaseScene extends BaseUIComponent {
        constructor() {
            super();
            this.isClear = false;
        }
        onEnable() {
            super.onEnable();
            this.initData();
            this.init();
        }
        onDisable() {
            super.onDisable();
            this.hide();
        }
        init() {
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
        }
        onEnable() {
            super.onEnable();
        }
        init() {
            let s = this;
            s.group_play = new BaseUIComponent;
            s.addChild(s.group_play);
            s.group_play.width = GameConfig.width;
            s.group_play.height = GameConfig.height;
            s.group_play.horizontalCenter = 0;
            s.group_play.verticalCenter = 0;
            let bg = new Laya.Sprite;
            bg.texture = Laya.loader.getRes("../laya/assets/img/bg.png");
            s.group_play.addChild(bg);
            var button = new Laya.Button();
            button.skin = "../laya/assets/img/A.png";
            button.stateNum = 1;
            button.left = 150;
            button.top = 100;
            button.clickHandler = Laya.Handler.create(this, this.onClickButton, [button], false);
            s.group_play.addChild(button);
            let sheep = new Skeleton;
            sheep.setDataByName("Sheep_Ani.sk", "../laya/assets/skeleton/");
            sheep.show(s.group_play, s.group_play.width / 2, s.group_play.height / 2);
            sheep.gotoAndPlay("goat_walk_anim", true);
            let myButton = new Button;
            myButton.name = "001";
            s.group_play.addChild(myButton);
            myButton.setStatus([Laya.loader.getRes("../laya/assets/img/A.png"), Laya.loader.getRes("../laya/assets/img/A点击.png")]);
            myButton.setClickFunction(() => {
                console.log("click button");
            }, s);
            myButton.x = 500;
            myButton.y = s.group_play.height - myButton.height - 100;
            console.log(Global.getQualifiedClassName(myButton));
            console.log(Global.getQualifiedClassName(myButton));
            console.log("---------------");
            console.log(Global.getQualifiedClassName(button));
            console.log(Global.getQualifiedClassName(Button));
            console.log(Global.getQualifiedClassName(Laya.Button));
            console.log(Button.prototype.constructor);
            console.log(Laya.Button.prototype.constructor);
        }
        onClickButton(e) {
            console.log(e);
        }
    }

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
            Laya.loader.load(["../laya/assets/img/bg.png", "../laya/assets/img/A.png", "../laya/assets/img/A点击.png", "../laya/assets/skeleton/Sheep_Ani.sk"], Laya.Handler.create(this, () => {
                SceneManager.instance.showScene(new MainScene);
            }));
        }
    }
    new Main();

}());
