import StringUtil from "../util/StringUtil";
import { BasicGroup } from "./BasicGroup";
import { BasicUIEvent } from "./BasicUIEvent";
import { Label } from "./Label";
import { Point, Texture } from "./Layout";
import { Style } from "./Style";
import { Image } from "./Image";
    /**
     * 按钮
     */
     export class Button extends BasicGroup {
        public static DEFAULT_TEXTURE: Texture = null;//默认材质
        private _verticalSplit: boolean = true;//默认材质采用竖直切割的方式产生不同状态下的texture

        public static STATUS_UP: string = "status_up";
        public static STATUS_DOWN: string = "status_down";
        public static STATUS_OVER: string = "status_over";
        public static STATUS_DISABLE: string = "status_disable";
        public static STATUS_NORMAL: string = "status_normal";
        public static STATUS_CHECKED: string = "status_checked";

        protected _text: string = "";
        protected _label: Label = null;//文本
        protected _texture: Texture = null;//按钮贴图
        protected _imgDisplay: Image = null;//按钮位图
        private _textureLabel: Texture = null;//文字图片
        public _imgLabel: Image = null;//显示文字图片的image
        private _textureIcon: Texture = null;//图标
        public _imgIcon: Image = null;//显示图标用的image
        protected _initDisplayData: boolean = false;//是否初始化显示对象

        public _selected: boolean = false;//选择时为ture

        protected stateArray: Array<any> = [Button.STATUS_UP];//正常的按钮,只有三态,第四态是禁用态,其他的态可以自己加入
        protected _currentState: string = Button.STATUS_UP;//当前态
        public _textureDict: any = {};//各材质的映射,在给予img之前,保存在这个映射中

        //文字偏移设定
        protected _labelMarginLeft: number = NaN;
        protected _labelMarginTop: number = NaN;

        //icon偏移设定
        private _iconMarginLeft: number = NaN;
        private _iconMarginTop: number = NaN;

        private _autoSize: boolean = false;

        protected _labelColor: number = Style.BUTTON_TEXT;
        protected _labelBold: boolean = false;//label加粗
        protected _labelItalic: boolean = false;
        protected _labelLineSpacing: number = 0;//行间距
        protected _labelMultiline: boolean = false;//多行显示
        protected _labelStroke: number = 0;
        protected _labelStrokeColor: number = 0x003350;
        protected _fontSize: number = 30;
        protected _fontName: string = null;

        private _scale9GridEnable: boolean = false;
        private _scale9GridRect: number[] = [];//九宫拉伸的尺寸
        protected _fillMode: string = Style.SCALE;//scale, repeat, clip

        //声音播放
        private _soundName: string;

        //像素级检测
        protected _testPixelEnable: boolean = false;

        protected clickFun: Function;
        protected clickFunObj: any;

        public constructor() {
            super();
        }

        /**
         * 加入到显示列表时调用
         * 子类可覆写该方法,添加UI逻辑
         */
        public createChildren(): void {
            super.createChildren();
            let s = this;
            //s.touchEnabled = true;//事件接收
            //s.touchChildren = false;
            //按钮位图
            s._imgDisplay = new Image;
            s.addChild(s._imgDisplay);
            s._imgDisplay.width = s.width;
            s._imgDisplay.height = s.height;
            s._imgDisplay.fillMode = s._fillMode;
            //s._imgDisplay.touchEnabled = false;

            //文字显示
            s._label = new Label();
            s._label.autoSize = true;
            s._label.clip = false;
            s._label.hAlign = "center";
            s._label.vAlign = "middle";
            s._label.showBg = false;
            s.addChild(s._label);

            s.on(BasicUIEvent.TOUCH_BEGIN, s, s.onTouchEvent);
            //s.addEventListener(BasicUIEvent.TOUCH_MOVE, s.onTouchEvent, s);
            s.on(BasicUIEvent.TOUCH_END, s, s.onTouchEvent);
            s.on(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, s, s.onTouchReleaseOutside);
            //s.on(BasicUIEvent.TOUCH_CANCEL, s, s.onTouchReleaseOutside);
        }

        public onTouchEvent(event: Laya.Event): void {
            let s = this;
            if (!s.enabled) {
                event.stopPropagation();
                return;
            }
            // if (GlobalSetting.STATS_BTN) {
            //     //统计按钮点击
            //     var stateutils = egret.getDefinitionByName("StatsUtil")
            //     if (stateutils) stateutils["trackEvent"]("btn", "touch", s.name, 0);
            // }
            //console.log("Button onTouchEvent=" + event.type);
            if (event.currentTarget == s) {
                //像素检测
                if (s._testPixelEnable && !s.testPixel32(s.mouseX, s.mouseX)) {
                    event.stopPropagation();
                    return;
                }
                if (event.type == BasicUIEvent.TOUCH_BEGIN) {
                    s._currentState = Button.STATUS_DOWN;
                    s.onClick();
                    s.onPlaySound();
                } else if (event.type == BasicUIEvent.TOUCH_END) {
                    s._currentState = Button.STATUS_UP;
                } else if (event.type == BasicUIEvent.TOUCH_MOVE) {
                    s._currentState = Button.STATUS_OVER;
                }
                if (s.statesLength == 1 && s._currentState == Button.STATUS_DOWN) {
                    s.alpha = 0.8;
                } else {
                    s.alpha = 1;
                }
            }
            s.invalidate();
        }

        /**
         * 在外释放
         * @param event
         */
        protected onTouchReleaseOutside(event: TouchEvent): void {
            this._currentState = Button.STATUS_UP;
            this.invalidate();
        }

        /**
         * 设置点击按钮回调
         */
        public setClick(fun: Function, obj: any) {
            this.clickFun = fun;
            this.clickFunObj = obj;
        }

        protected onClick() {
            if (this.clickFun && this.clickFunObj) {
                this.clickFun.call(this.clickFunObj, this);
            }
        }

        public get currentState(): string {
            return this._currentState;
        }
        public set currentState(value: string) {
            if (this._currentState != value) {
                this._currentState = value;
                this.invalidate();
            }
        }

        public get texture(): Texture {
            return this._texture;
        }
        public set texture(value: Texture) {
            if (this._texture != value) {
                this._initDisplayData = false;
                this._texture = value;
                this.invalidate();
            }
        }

        public get fillMode(): string {
            return this._fillMode;
        }
        /**
         * 设置填充模式
         * scale|repeat
         */
        public set fillMode(value: string) {
            if (this._fillMode != value) {
                this._fillMode = value;
                this.invalidate();
            }
        }

        /**
         * 九宫设置的区域
         * @returns {Rectangle}
         */
        public scale9GridRect(): number[] {
            return this._scale9GridRect;
        }

        /**
         * 默认背景texture的九宫格拉伸设定
         * 只有showDefaultSkin并且设置了defaultSkinTexture,才有效
         * 默认绘制的背景是纯色的,所以不需要进行九宫拉伸设定
         * scale9Rectangle : [左边距,右边距,上边距,下边距]
         */
        public scale9Grid(scale9Rectangle: number[] = []) {
            if (scale9Rectangle.length == 4) {
                this._scale9GridRect.length = 0;
                this._scale9GridRect = scale9Rectangle.concat();
                // if (this._scale9GridRect == null) {
                //     this._scale9GridRect = new Rectangle;
                // }
                // let x = scale9Rectangle[0];
                // let y = scale9Rectangle[2];
                // let width = this.width - (scale9Rectangle[0] + scale9Rectangle[1]);
                // let height = this.height - (scale9Rectangle[2] + scale9Rectangle[3]);
                // this._scale9GridRect.x = x;
                // this._scale9GridRect.y = y;
                // this._scale9GridRect.width = width;
                // this._scale9GridRect.height = height;
            } else {
                this._scale9GridRect = null;
            }
            this.invalidate();
        }

        /**
         * 绘制
         */
        public draw(): void {
            //super.draw();
            //if (this._data)console.log("@@Button draw _text=" + this._text + ", selected=" + this.selected + ", data=" + this._data.id);
            //初始化显示对象和数据
            let s = this;
            if (!s._initDisplayData) {
                if (!s._texture) {
                    if (Button.DEFAULT_TEXTURE == null) {
                        s.initDefaultTexture();
                    }
                    s._texture = Button.DEFAULT_TEXTURE;
                }
                s.splitTextureSource();//切割成态数对应的材质
            }

            if (s._imgDisplay == null) return;
            //只设置了一个状态的时候，第二态用第一态的资源
            if (s.statesLength == 1 && s._currentState == Button.STATUS_DOWN) {
                s._imgDisplay.texture = s._textureDict[Button.STATUS_UP];
            } else {
                s._imgDisplay.texture = s._textureDict[s._currentState];
            }
            //按钮图片九宫拉伸设置
            if (s._scale9GridRect.length == 4) {
                s._imgDisplay.scale9Grid(s._scale9GridRect);
            } else {
                s._imgDisplay.scale9Grid();
            }
            s._imgDisplay.fillMode = s._fillMode;
            s._imgDisplay.width = s.width;
            s._imgDisplay.height = s.height;
            // s._imgDisplay.anchorOffsetX = s._imgDisplay.width / 2;
            // s._imgDisplay.anchorOffsetY = s._imgDisplay.height / 2;
            // s._imgDisplay.x = s.width / 2;
            // s._imgDisplay.y = s.height / 2;
            //console.log("Button.draw 1111 this.width=" + this.width + ", this.height=" + this.height);

            //文字图片显示
            if (s._textureLabel != null) {
                if (s._imgLabel == null) {
                    s._imgLabel = new Image;
                    //s._imgLabel.touchEnabled = false;
                    s.addChild(s._imgLabel);
                }
                s._imgLabel.texture = s._textureLabel;

                if (!isNaN(s._labelMarginLeft)) {
                    s._imgLabel.x = s._labelMarginLeft;
                } else {
                    s._imgLabel.x = (s.width - s._imgLabel.width) / 2;
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._imgLabel.y = s._labelMarginTop;
                } else {
                    s._imgLabel.y = (s.height - s._imgLabel.height) / 2;
                }
            }

            //图标显示
            if (s._textureIcon != null) {
                if (s._imgIcon == null) {
                    s._imgIcon = new Image;
                    //s._imgIcon.touchEnabled = false;
                    s.addChild(s._imgIcon);
                }
                s._imgIcon.texture = s._textureIcon;

                if (!isNaN(s._iconMarginLeft)) {
                    s._imgIcon.x = s._iconMarginLeft;
                } else {
                    s._imgIcon.x = (s.width - s._imgIcon.width) / 2;
                }
                if (!isNaN(s._iconMarginTop)) {
                    s._imgIcon.y = s._iconMarginTop;
                } else {
                    s._imgIcon.y = (s.height - s._imgIcon.height) / 2;
                }
            }

            //文字标签
            if (s._label) {
                if (!s._label.parent) s.addChild(s._label);
                s._label.text = s._text;
                s._label.fontSize = s._fontSize;
                s._label.fontName = s._fontName;
                s._label.bold = s._labelBold;
                s._label.italic = s._labelItalic;
                s._label.lineSpacing = s._labelLineSpacing;
                s._label.multiline = s._labelMultiline;
                s._label.stroke = s._labelStroke;
                s._label.strokeColor = s._labelStrokeColor;
                s._label.onInvalidate(null);//立即生效,这样下面的数据才有效

                if (!isNaN(s._labelMarginLeft)) {
                    s._label.x = s._labelMarginLeft;
                } else {
                    s._label.x = (s.width - s._label.width) / 2;
                    //console.log("Button.draw 222 this.width=" +this.width + ", this._label.width=" + this._label.width);
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._label.y = s._labelMarginTop;
                } else {
                    s._label.y = (s.height - s._label.height) / 2;
                }
            }
        }

        /**
         * 没有材质,绘制一个默认的材质背景
         */
        private initDefaultTexture(): void {
            if (Button.DEFAULT_TEXTURE == null) {
                this.setSize(Style.BUTTON_DEFAULT_WIDTH, Style.BUTTON_DEFAULT_HEIGHT);
                var shape: Laya.Sprite = new Laya.Sprite;
                shape.width = this.width;
                shape.height = this.height;
                //shape.graphics.beginFill(Style.BUTTON_FACE);
                shape.graphics.drawRect(0, 0, this.width, this.height, Style.BUTTON_FACE);
                //shape.graphics.endFill();
                //boder
                //shape.graphics.lineStyle(1, 0x000000);
                shape.graphics.drawRect(0, 0, this.width - 1, this.height - 1, 0x000000);

                // var renderTexture: Laya.RenderTexture = new Laya.RenderTexture(shape.width, shape.height);
                // renderTexture.generateMipmap (shape);
                var htmlC: Laya.HTMLCanvas = shape.drawToCanvas(shape.width, shape.height, 0, 0);
                //获取截屏区域的texture
                Button.DEFAULT_TEXTURE = new Laya.Texture(htmlC.getTexture());
            }
        }
        /**
         * 切割Texture材质集
         * @param value
         */
        private splitTextureSource(): void {
            if (this._texture) {
                //console.log("splitTextureSource texture.w=" + this._texture._sourceWidth + ", h=" + this._texture._sourceHeight + ", name=" + this.name)
                this._initDisplayData = true;
                var splitWidth: number = 0;
                var splitHeight: number = 0;
                var textureWidth: number = this._texture.sourceWidth;
                var textureHeight: number = this._texture.sourceHeight;
                if (this.stateArray.length == 1) {
                    splitWidth = textureWidth;
                    splitHeight = textureHeight;
                    this._textureDict[this.stateArray[0]] = this._texture;
                } else {
                    var i: number = 0;
                    var xOffset: number = 0;//this._texture._bitmapX;
                    var yOffset: number = 0;//this._texture._bitmapY;
                    if (this._verticalSplit) {
                        splitWidth = textureWidth;
                        splitHeight = textureHeight / this.statesLength;
                    } else {
                        splitWidth = textureWidth / this.statesLength;
                        splitHeight = textureHeight;
                    }
                    //var spriteSheet: Laya.SpriteSheet = new Laya.SpriteSheet(this._texture);
                    for (i = 0; i < this.stateArray.length; i++) {
                        if (this._verticalSplit) {
                            this._textureDict[this.stateArray[i]] = Laya.Texture.createFromTexture(this._texture, xOffset, yOffset + i * splitHeight, splitWidth, splitHeight); //spriteSheet.createTexture(this.name + Math.round(Math.random() * 999999) + "_" + this.stateArray[i], xOffset, yOffset + i * splitHeight, splitWidth, splitHeight);
                        } else {
                            this._textureDict[this.stateArray[i]] = Laya.Texture.createFromTexture(this._texture, xOffset + i * splitWidth, yOffset, splitWidth, splitHeight);//spriteSheet.createTexture(this.name + Math.round(Math.random() * 999999) + "_" + this.stateArray[i], xOffset + i * splitWidth, yOffset, splitWidth, splitHeight);
                        }
                    }
                }

                if (this._autoSize) {
                    this.width = splitWidth;
                    this.height = splitHeight;
                }
            }
        }

        /**
         * 设置按钮弹起态皮肤
         */
        public set upSkin(value: Texture) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_UP)) {
                s.stateArray.push(Button.STATUS_UP);
            }
            s._textureDict[Button.STATUS_UP] = value;
            s.invalidate();
        }
        public get upSkin(): Texture {
            return this._textureDict[Button.STATUS_UP];
        }

        /**
         * 设置按钮悬停态皮肤
         */
        public set overSkin(value: Texture) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_OVER)) {
                s.stateArray.push(Button.STATUS_OVER);
            }
            s._textureDict[Button.STATUS_OVER] = value;
            s.invalidate();
        }
        public get overSkin(): Texture {
            return this._textureDict[Button.STATUS_OVER];
        }

        /**
         * 设置按钮按下态皮肤
         */
        public set downSkin(value: Texture) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_DOWN)) {
                s.stateArray.push(Button.STATUS_DOWN);
            }
            s._textureDict[Button.STATUS_DOWN] = value;
            s.invalidate();
        }
        public get downSkin(): Texture {
            return this._textureDict[Button.STATUS_DOWN];
        }

        /**
         * 设置按钮禁用态皮肤
         */
        public set disableSkin(value: Texture) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_DISABLE)) {
                s.stateArray.push(Button.STATUS_DISABLE);
            }
            s._textureDict[Button.STATUS_DISABLE] = value;
            s.invalidate();
        }
        public get disableSkin(): Texture {
            return this._textureDict[Button.STATUS_DISABLE];
        }

        /**
         * @param state
         * @return false,不存在;true,存在
         */
        private isStateExist(state: string): boolean {
            if (this.stateArray.indexOf(state) != -1) {
                return true;
            }
            return false;
        }

        /**
         * 设置按钮文本
         */
        public set label(value: string) {
            let s = this;
            s._text = value;
            if (s._label) {
                s._label.text = s._text;
            }
            s.invalidate();
        }
        public get label(): string {
            return this._text;
        }

        // public set selected(value: boolean) {
        //     this._selected = value;
        //     this._currentState = (this._selected ? Button.STATE_DOWN : Button.STATE_UP);
        //     //if (this._data)console.log("button data=" + this._data.id + ", selected=" + this._selected);
        //     if (this._selected && StringUtil.isUsage(this._toggleGroup)) {
        //         var myevent: MyEvent = MyEvent.getEvent(Button.TOGGLE_PREFIX + this._toggleGroup);
        //         myevent.addItem("caller", this);
        //         myevent.addItem("groupName", this._toggleGroup);
        //         myevent.send();
        //     }
        //     this.invalidate();
        // }
        // public get selected(): boolean {
        //     return this._selected;
        // }

        /**
         * 设置按钮可用状态皮肤
         * <p>[STATE_UP, STATE_DOWN, STATE_OVER, STATE_DISABLE]</p>
         */
        public setSkins(statusSkin: Texture[] = []) {
            let statusNum = statusSkin.length == 0 ? 1 : statusSkin.length;
            switch (statusNum) {
                case 1:
                    this.stateArray = [Button.STATUS_UP];//设置只有一个状态的时候，第二态用第一态的资源
                    break;
                case 2:
                    this.stateArray = [Button.STATUS_UP, Button.STATUS_DOWN];
                    break;
                case 3:
                    this.stateArray = [Button.STATUS_UP, Button.STATUS_DOWN, Button.STATUS_OVER];
                    break;
                case 4:
                    this.stateArray = [Button.STATUS_UP, Button.STATUS_DOWN, Button.STATUS_OVER, Button.STATUS_DISABLE];
                    break;
            }

            //初始化按钮状态皮肤
            this._initDisplayData = false;
            if (statusSkin.length > 0) {
                this._initDisplayData = true;
                for (let i = 0; i < this.stateArray.length; ++i) {
                    if (statusSkin[i]) {
                        this._textureDict[this.stateArray[i]] = statusSkin[i];
                    } else {
                        this._initDisplayData = false;
                        console.warn("指定的状态数和状态图片数不一致");
                        break;
                    }
                }
            }
            if (this._initDisplayData) this.setSize(statusSkin[0].sourceWidth, statusSkin[0].sourceHeight);
            this.invalidate();
        }
        public get statesLength(): number {
            return this.stateArray.length;
        }

        /**
         * 设置图片标签贴图
         */
        public set imgLabel(value: Texture) {
            if (this._textureLabel != value) {
                this._textureLabel = value;
                this.invalidate();
            }
        }
        public get imgLabel(): Texture {
            return this._textureLabel;
        }

        /**
         * 设置图标贴图
         */
        public set imgIcon(value: Texture) {
            if (this._textureIcon != value) {
                this._textureIcon = value;
                this.invalidate();
            }
        }
        public get imgIcon(): Texture {
            return this._textureIcon;
        }

        /**
         * 设置文字文本的颜色
         */
        public set labelColor(value: number) {
            if (this._labelColor != value) {
                this._labelColor = value;
                if (this._label) this._label.color = value;
                this.invalidate();
            }
        }
        public get labelColor(): number {
            return this._labelColor;
        }

        /**
         * 设置文本字体 
         * @param value
         * 
         */
        public set fontName(value: string) {
            if (this._fontName != value) {
                this._fontName = value;
                this.invalidate();
            }
        }
        public get fontName(): string {
            return this._fontName;
        }

        /**
         * 设置文本字体大小 
         * @param value
         * 
         */
        public set fontSize(value: number) {
            if (this._fontSize != value) {
                this._fontSize = value;
                this.invalidate();
            }
        }
        public get fontSize(): number {
            return this._fontSize;
        }

        /**
        * 设置label显示左边距
        */
        public set labelMarginLeft(value: number) {
            if (this._labelMarginLeft != value) {
                this._labelMarginLeft = value;
                this.invalidate();
            }
        }
        public get labelMarginLeft(): number {
            return this._labelMarginLeft;
        }

        /**
        * 设置label显示顶部边距
        */
        public set labelMarginTop(value: number) {
            if (this._labelMarginTop != value) {
                this._labelMarginTop = value;
                this.invalidate();
            }
        }
        public get labelMarginTop(): number {
            return this._labelMarginTop;
        }

        /**
        * 设置icon显示左边距
        */
        public set iconMarginLeft(value: number) {
            if (this._iconMarginLeft != value) {
                this._iconMarginLeft = value;
                this.invalidate();
            }
        }
        public get iconMarginLeft(): number {
            return this._iconMarginLeft;
        }

        /**
        * 设置icon显示顶部边距
        */
        public set iconMarginTop(value: number) {
            if (this._iconMarginTop != value) {
                this._iconMarginTop = value;
                this.invalidate();
            }
        }
        public get iconMarginTop(): number {
            return this._iconMarginTop;
        }

        /**
         * 设置按钮是否按照材质的宽高设置大小
         * true:按照切割后的材质大小来设置按钮的宽和高
         * false:根据按钮本身的宽和高设置材质的宽高
         * @param value
         */
        // public set autoSize(value: boolean) {
        //     if (this._autoSize != value) {
        //         this._autoSize = value;
        //         this.invalidate();
        //     }
        // }
        // public get autoSize(): boolean {
        //     return this._autoSize;
        // }

        public setSize(w: number, h: number): void {
            super.setSize(w, h);
            //this.autoSize = false;
        }

        /**
         * 初始化声音对象,并播放声音
         */
        protected onPlaySound(): void {
            if (StringUtil.isUsage(this._soundName)) {
                Laya.SoundManager.playSound(this._soundName);
            }
        }

        /**
         * 设置播放的声音名称
         * @param value
         */
        public set sound(value: string) {
            this._soundName = value;
        }
        public get sound(): string {
            return this._soundName;
        }

        public set drawDelay(delay: boolean) {
            if (this._label) this._label.drawDelay = delay;
        }

        /**
         * label 加粗
         * @param value
         */
        public set labelBold(value: boolean) {
            if (this._labelBold != value) {
                this._labelBold = value;
                this.invalidate();
            }
        }
        public get labelBold(): boolean {
            return this._labelBold;
        }

        /**
         * label 斜体
         * @param value
         */
        public set labelItalic(value: boolean) {
            if (this._labelItalic != value) {
                this._labelItalic = value;
                this.invalidate();
            }
        }
        public get labelItalic(): boolean {
            return this._labelItalic;
        }

        /**
         * label 行间距
         * @param value
         */
        public set labelLineSpacing(value: number) {
            if (this._labelLineSpacing != value) {
                this._labelLineSpacing = value;
                this.invalidate();
            }
        }
        public get labelLineSpacing(): number {
            return this._labelLineSpacing;
        }

        /**
         * label 多行显示
         * @param value
         */
        public set labelMultiline(value: boolean) {
            if (this._labelMultiline != value) {
                this._labelMultiline = value;
                this.invalidate();
            }
        }
        public get labelMultiline(): boolean {
            return this._labelMultiline;
        }

        /**
         * label 描边厚度
         * @param value
         */
        public set labelStroke(value: number) {
            if (this._labelStroke != value) {
                this._labelStroke = value;
                this.invalidate();
            }
        }
        public get labelStroke(): number {
            return this._labelStroke;
        }

        /**
         * label 描边颜色
         * @param value
         */
        public set labelStrokeColor(value: number) {
            if (this._labelStrokeColor != value) {
                this._labelStrokeColor = value;
                this.invalidate();
            }
        }
        public get labelStrokeColor(): number {
            return this._labelStrokeColor;
        }

        /**
         * 像素级检测
         * @param value
         */
        public set testPixelEnable(value: boolean) {
            this._testPixelEnable = value;
        }
        public get testPixelEnable(): boolean {
            return this._testPixelEnable;
        }

        /**
         * 获取xy位置的像素值,xy是舞台值
         * @param x 舞台坐标
         * @param y 舞台坐标
         */
        public getPixel32(x: number, y: number): Uint8Array {
            let s = this;
            //底图
            var locolPoint: Point = this.globalToLocal(new Laya.Point(x, y));
            var found: boolean
            var datas: Uint8Array = null;
            if (s._imgDisplay && s._imgDisplay.texture) {
                datas = s._imgDisplay.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i: number = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }

            //label
            if (s._imgLabel && s._imgLabel.texture) {
                datas = s._imgLabel.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i: number = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }

            //icon
            if (s._imgIcon && s._imgIcon.texture) {
                datas = s._imgIcon.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i: number = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }

            return null;
        }
        /**
         * 检测xy位置的像素值是否透明,xy是舞台值
         * @param x 舞台值
         * @param y 舞台值
         * @return true:有像素值, false:无像素值
         */
        // public testPixel32(x: number, y: number): boolean {
        //     var datas: Array<number> = this.getPixel32(x, y);
        //     for (var i: number = 0; i < datas.length; i++) {
        //         if (datas[i] > 0) {
        //             return true;
        //         }
        //     }
        //     return false;
        // }
    }