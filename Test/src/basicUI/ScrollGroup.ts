import HeartBeat from "../util/HeartBeat";
import ObjectPool from "../util/ObjectPool";
import { BasicGroup } from "./BasicGroup";
import { Texture, Rectangle, Event } from "./Layout";
import { Style } from "./Style";
import { Image } from "./Image";

    /**
     * 卷轴容器
     */
     export class ScrollGroup extends BasicGroup {
        public static SCROLL_UP: string = "up";
        public static SCROLL_DOWN: string = "down";
        public static SCROLL_LEFT: string = "left";
        public static SCROLL_RIGHT: string = "right";

        public static STATE_START: string = "start";
        public static STATE_STOP: string = "stop";

        private _moveFunc: any = null;
        private _moveFuncThis: any = null;

        private _scrollItemArr: Array<ScrollItemGroup> = [];
        /**
         * 是否将子代剪切到视区的边界,
         * 默认为true,剪切.
         */
        private _clip: boolean = true;
        /**
         * 运行状态
         * @type {boolean}
         * @private
         */
        private _running: boolean = false;
        //自动播放
        private _autoplay: boolean = false;

        public constructor() {
            super();
        }

		/**
		 * 加入到显示列表时调用
		 * 子类可覆写该方法,添加UI逻辑
		 */
        public createChildren(): void {
            super.createChildren();
        }

        /**
         * 设置卷轴数据
         * @param textures
         * @param speed
         */
        public setScrollData(textures: Array<Texture>, speed: number = 3, direction: string = ScrollGroup.SCROLL_DOWN, gap: number = 0): void {
            var item: ScrollItemGroup = ObjectPool.getByClass(ScrollItemGroup);
            this.addChild(item);
            this._scrollItemArr.push(item);
            item.width = this.width;
            item.height = this.height;
            item.setScrollData(textures, speed, direction, gap);
            this.invalidate();
        }

        /**
         * 删除滚动数据
         * @param index
         */
        public delScrollData(index: number = -1): void {
            var item: ScrollItemGroup = null;
            if (index <= -1) {//全部删除
                while (this._scrollItemArr.length > 0) {
                    item = this._scrollItemArr.pop();
                    if (item) item.removeFromParent();
                }
            } else if (index < this._scrollItemArr.length) {
                item = this._scrollItemArr[index];
                if (item) {
                    item.removeFromParent();
                    this._scrollItemArr.splice(index, 1);
                }
            }
        }

        /**
         * 开始卷轴
         */
        public play(index: number = -1): void {
            this._running = true;
            this.setItemState(ScrollGroup.STATE_START, index);
            //初始数据
            HeartBeat.addListener(this, this.onHeartBeat);
        }

        /**
         * 停止卷轴
         */
        public stop(index: number = -1): void {
            this.setItemState(ScrollGroup.STATE_STOP, index);
            if (!this._running) HeartBeat.removeListener(this, this.onHeartBeat);
        }

        /**
         * 暂停卷轴
         */
        public pause(index: number = -1): void {
            this.setItemState(ScrollGroup.STATE_STOP, index);
            if (!this._running) HeartBeat.removeListener(this, this.onHeartBeat);
        }

        /**
         * 重新卷轴卷轴
         */
        public restart(index: number = -1): void {
            this.setItemState(ScrollGroup.STATE_START, index);
            HeartBeat.addListener(this, this.onHeartBeat);
        }

        /**
         * 设置速度
         */
        public setSpeed(speed: number, index: number = -1): void {
            if (index <= -1) {
                for (var i: number = 0; i < this._scrollItemArr.length; i++) {
                    this._scrollItemArr[i].speed = speed;
                }
            } else {
                if (index >= 0 && index <= this._scrollItemArr.length - 1) {
                    this._scrollItemArr[index].speed = speed;
                }
            }
        }

        /**
         * 设置方向
         */
        public setDirection(direction: string, index: number = -1): void {
            if (index <= -1) {
                for (var i: number = 0; i < this._scrollItemArr.length; i++) {
                    this._scrollItemArr[i].direction = direction;
                }
            } else {
                if (index >= 0 && index <= this._scrollItemArr.length - 1) {
                    this._scrollItemArr[index].direction = direction;
                }
            }
        }

        /**
         * 设置滚动item的state
         * @param state
         */
        private setItemState(state: string, index: number = -1): void {
            if (index <= -1) {
                for (var i: number = 0; i < this._scrollItemArr.length; i++) {
                    this._scrollItemArr[i]._state = state;
                }
            } else if (index >= 0 && index <= this._scrollItemArr.length - 1) {
                this._scrollItemArr[index]._state = state;
            }
            if (state == ScrollGroup.STATE_START) {
                this._running = true;
            } else {
                this._running = false;
                for (var i: number = 0; i < this._scrollItemArr.length; i++) {
                    if (this._scrollItemArr[i]._state == ScrollGroup.STATE_START) {
                        this._running = true;
                        break;
                    }
                }
            }
        }


        /**
         * 呼吸计数
         */
        private onHeartBeat(): void {
            for (var i: number = 0; i < this._scrollItemArr.length; i++) {
                this._scrollItemArr[i].onHeartBeat();
            }
            if (this._moveFunc) {
                this._moveFunc.call(this._moveFuncThis);
            }
        }

        /**
         * 重绘
         */
        public draw(): void {
            if (this.width == 0 || this.height == 0) return;
            if (this._clip) {//剪裁
                if (this.scrollRect == null) {
                    this.scrollRect = new Rectangle(0, 0, this.width, this.height);
                } else {
                    this.scrollRect.width = this.width;
                    this.scrollRect.height = this.height;
                }
            } else {
                this.scrollRect = null;
            }

            if (this.width != Style.BASEGROUP_WIDTH || this.height != Style.BASEGROUP_HEIGHT) {
                for (var i: number = 0; i < this._scrollItemArr.length; i++) {
                    if (this._scrollItemArr[i].width == Style.BASEGROUP_WIDTH || this._scrollItemArr[i].width == 0) {
                        this._scrollItemArr[i].width = this.width;
                    }
                    if (this._scrollItemArr[i].height == Style.BASEGROUP_HEIGHT || this._scrollItemArr[i].height == 0) {
                        this._scrollItemArr[i].height = this.height;
                    }
                    this._scrollItemArr[i]._initData = false;
                }
            }
        }

        /**
         * 设置剪裁
         * @param value
         */
        public set clip(value: boolean) {
            if (value != this._clip) {
                this._clip = value;
                this.invalidate();
            }
        }
        public get clip(): boolean {
            return this._clip;
        }

        /**
         * 移动回call的方法
         * @param value
         */
        public setMoveCallbackFunc(func: any, thisObj: any): void {
            this._moveFunc = func;
            this._moveFuncThis = thisObj;
        }

        /**
         * 自动播放
         * @param value
         */
        public set autoplay(value: boolean) {
            if (this._autoplay != value) {
                this._autoplay = value;
            }
        }
        public get autoplay(): boolean {
            return this._autoplay;
        }
    }

    /**
     * 滚动项类
     */
    class ScrollItemGroup extends BasicGroup {
        public speed: number = 0;//帧速度
        public gap: number = 0;//间隔
        public direction: string = ScrollGroup.SCROLL_DOWN;//卷轴的方向
        private _textures: Array<Texture> = null;//卷轴的背景材料

        private _scrollTextureIndex: number = 0;///卷轴的下标
        private _scrollBitmapArr: Array<Image> = null;//卷轴图像

        public _state: String = ScrollGroup.STATE_STOP;
        public _initData: boolean = false;//初始化数据

        private _textureWidth: number = 0;//材质的宽度
        private _textureHeight: number = 0;//材质的高度
        private _totalBitmapLength: number = 0;
        private _limitDistance: number = 0;//最大宽度或高度
        /**
         * 是否将子代剪切到视区的边界,
         * 默认为true,剪切.
         */
        private _clip: boolean = true;

        public constructor() {
            super();
        }

        /**
         * 初始化主场景的组件
         * 这个方法在对象new的时候就调用,因为有些ui必须在加入stage之前就准备好
         * 子类覆写该方法,添加UI逻辑
         */
        public createChildren(): void {
            super.createChildren();
        }

        /**
         * 设置卷轴数据
         * @param textures
         * @param speed
         */
        private _textureIndex: number = 0;
        public setScrollData(textures: Array<Texture>, speed: number = 3, direction: string, gap = 0): void {
            this._initData = false;
            this.gap = gap;
            this.direction = direction;
            this._textureIndex = 0;
            this._textures = textures;
            this._textureWidth = this._textures[0].sourceWidth;
            this._textureHeight = this._textures[0].sourceHeight;
            this.speed = speed;
            var textureLength: number = this._textures.length;
            if (this._scrollBitmapArr && this._scrollBitmapArr.length > 0) {
                var image: Image = null;
                while (this._scrollBitmapArr.length > 0) {
                    image = this._scrollBitmapArr.pop();
                    if (image.parent) image.parent.removeChild(image);
                    ObjectPool.recycleClass(image, "scroll_group");
                }
            }
            this._scrollBitmapArr = [];
            this._totalBitmapLength = 0;
            this._limitDistance = 0;
            if (this.direction == ScrollGroup.SCROLL_DOWN || this.direction == ScrollGroup.SCROLL_UP) {
                while (this._limitDistance < this.height) {
                    if (this._textureIndex >= this._textures.length) {
                        this._textureIndex = 0;
                    }
                    this._limitDistance += this._textures[this._textureIndex].sourceHeight + this.gap;
                    this._textureIndex++;
                    this._totalBitmapLength++;
                }
            } else if (this.direction == ScrollGroup.SCROLL_LEFT || this.direction == ScrollGroup.SCROLL_RIGHT) {
                while (this._limitDistance < this.width) {
                    if (this._textureIndex >= this._textures.length) {
                        this._textureIndex = 0;
                    }
                    this._limitDistance += this._textures[this._textureIndex].sourceWidth + this.gap;
                    this._textureIndex++;
                    this._totalBitmapLength++;
                }
            }
            //console.log("totalNum = " + this._totalBitmapLength);
            for (var i: number = 0; i < this._totalBitmapLength; i++) {
                var bitmap: Image = ObjectPool.getByClass(Image, "scroll_group");
                this._scrollBitmapArr.push(bitmap);
            }
            for (var j: number = 0; j < this._scrollBitmapArr.length; j++) {
                this.addChild(this._scrollBitmapArr[j]);
                this.getTexture(this._scrollBitmapArr[j]);
                if (this._scrollBitmapArr[j]) {
                    this._scrollBitmapArr[j].width = this._scrollBitmapArr[j].texture.sourceWidth;
                    this._scrollBitmapArr[j].height = this._scrollBitmapArr[j].texture.sourceHeight;
                }
            }
            this.initScrollBitmapData();
        }

        /**
         * 初始化初始卷轴数据
         */
        private initScrollBitmapData(): void {
            if (this._initData) return;
            this._initData = true;
            if (this.direction == ScrollGroup.SCROLL_UP) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].x = 0;
                    if (i == 0) {
                        this._scrollBitmapArr[0].y = 0;
                    } else if (i > 0) {
                        this._scrollBitmapArr[i].y = this._scrollBitmapArr[i - 1].y + this._scrollBitmapArr[i - 1].texture.sourceHeight + this.gap;
                    }
                }
            } else if (this.direction == ScrollGroup.SCROLL_DOWN) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].x = 0;
                    if (i == 0) {
                        this._scrollBitmapArr[0].y = this.height - this._scrollBitmapArr[0].texture.sourceHeight;
                    } else if (i > 0) {
                        this._scrollBitmapArr[i].y = this._scrollBitmapArr[i - 1].y - this._scrollBitmapArr[i].texture.sourceHeight - this.gap;
                    }
                }
            } else if (this.direction == ScrollGroup.SCROLL_LEFT) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].y = 0;
                    if (i == 0) {
                        this._scrollBitmapArr[0].x = 0;
                    } else if (i > 0) {
                        this._scrollBitmapArr[i].x = this._scrollBitmapArr[i - 1].x + this._scrollBitmapArr[i - 1].texture.sourceWidth + this.gap;
                    }
                }
            } else if (this.direction == ScrollGroup.SCROLL_RIGHT) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].y = 0;
                    if (i == 0) {
                        this._scrollBitmapArr[0].x = this.width - this._scrollBitmapArr[0].texture.sourceWidth;
                    } else if (i > 0) {
                        this._scrollBitmapArr[i].x = this._scrollBitmapArr[i - 1].x - this._scrollBitmapArr[i].texture.sourceWidth - this.gap;
                    }
                }
            }
        }

        /**
         * 获取当前卷轴材质
         * @returns {Texture}
         */
        private getTexture(img: Image): Texture {
            var texture: Texture = this._textures[this._scrollTextureIndex];
            this._scrollTextureIndex++;
            if (this._scrollTextureIndex >= this._textures.length) {
                this._scrollTextureIndex = 0;
            }
            img.scaleX = 1;
            img.scaleY = 1;
            img.alpha = 1;
            img.rotation = 0
            img.texture = texture;
            img.width = texture.sourceWidth;
            img.height = texture.sourceHeight;
            return texture;
        }

        /**
         * 呼吸计数
         */
        public onHeartBeat(): void {
            if (this._state == ScrollGroup.STATE_STOP) return;
            if (!this._initData) this.initScrollBitmapData();
            if (this.direction == ScrollGroup.SCROLL_UP) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].y -= this.speed;
                }
                //补充显示项
                if (this._scrollBitmapArr[this._scrollBitmapArr.length - 1].y <= (this.height - this._scrollBitmapArr[this._scrollBitmapArr.length - 1].texture.sourceHeight - this.speed)) {
                    var image: Image = ObjectPool.getByClass(Image, "scroll_group");
                    this.addChild(image);
                    this.getTexture(image);
                    image.x = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].x;
                    image.y = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].y + this._scrollBitmapArr[this._scrollBitmapArr.length - 1].texture.sourceHeight + this.gap;
                    this._scrollBitmapArr.push(image);
                }

                if (this._scrollBitmapArr[0].y + this._scrollBitmapArr[0].texture.sourceHeight <= 0) {//已经移出界
                    var image: Image = this._scrollBitmapArr.splice(0, 1)[0];
                    if (image.parent) image.parent.removeChild(image);
                    ObjectPool.recycleClass(image, "scroll_group");
                }
            } else if (this.direction == ScrollGroup.SCROLL_DOWN) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].y += this.speed;
                }
                if (this._scrollBitmapArr[this._scrollBitmapArr.length - 1].y >= -this.speed) {
                    var image: Image = ObjectPool.getByClass(Image, "scroll_group");
                    this.addChild(image);
                    this.getTexture(image);
                    image.x = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].x;
                    image.y = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].y - image.texture.sourceHeight - this.gap;
                    this._scrollBitmapArr.push(image);
                }
                if (this._scrollBitmapArr[0].y >= this.height) {//已经移出界
                    var image: Image = this._scrollBitmapArr.splice(0, 1)[0];
                    if (image.parent) image.parent.removeChild(image);
                    ObjectPool.recycleClass(image, "scroll_group");
                }
            } else if (this.direction == ScrollGroup.SCROLL_LEFT) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].x -= this.speed;
                }
                if (this._scrollBitmapArr[this._scrollBitmapArr.length - 1].x <= (this.width - this._scrollBitmapArr[this._scrollBitmapArr.length - 1].texture.sourceWidth - this.speed)) {
                    var image: Image = ObjectPool.getByClass(Image, "scroll_group");
                    this.addChild(image);
                    this.getTexture(image);
                    image.y = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].y;
                    image.x = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].x + this._scrollBitmapArr[this._scrollBitmapArr.length - 1].texture.sourceWidth + this.gap;
                    this._scrollBitmapArr.push(image);
                }

                if (this._scrollBitmapArr[0].x + this._scrollBitmapArr[0].texture.sourceWidth <= 0) {//已经移出界
                    var image: Image = this._scrollBitmapArr.splice(0, 1)[0];
                    if (image.parent) image.parent.removeChild(image);
                    ObjectPool.recycleClass(image, "scroll_group");
                }
            } else if (this.direction == ScrollGroup.SCROLL_RIGHT) {
                for (var i: number = 0; i < this._scrollBitmapArr.length; i++) {
                    this._scrollBitmapArr[i].x += this.speed;
                }
                if (this._scrollBitmapArr[this._scrollBitmapArr.length - 1].x >= - this.speed) {
                    var image: Image = ObjectPool.getByClass(Image, "scroll_group");
                    this.addChild(image);
                    this.getTexture(image);
                    image.y = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].y;
                    image.x = this._scrollBitmapArr[this._scrollBitmapArr.length - 1].x - image.texture.sourceWidth - this.gap;
                    this._scrollBitmapArr.push(image);
                }
                if (this._scrollBitmapArr[0].x >= this.width) {//已经移出界
                    var image: Image = this._scrollBitmapArr.splice(0, 1)[0];
                    if (image.parent) image.parent.removeChild(image);
                    ObjectPool.recycleClass(image, "scroll_group");
                }
            }
        }

        /**
         * 重绘
         */
        public draw(): void {
            if (this.width == 0 || this.height == 0) return;
            if (this._clip) {//剪裁
                if (this.scrollRect == null) {
                    this.scrollRect = new Rectangle(0, 0, this.width, this.height);
                } else {
                    this.scrollRect.width = this.width;
                    this.scrollRect.height = this.height;
                }
            } else {
                this.scrollRect = null;
            }
        }
        /**
         * 设置剪裁
         * @param value
         */
        public set clip(value: boolean) {
            if (value != this._clip) {
                this._clip = value;
                this.invalidate();
            }
        }
        public get clip(): boolean {
            return this._clip;
        }
    }