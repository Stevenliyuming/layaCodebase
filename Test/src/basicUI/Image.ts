import { BasicGroup } from "./BasicGroup";
import { Point, Rectangle, Sprite, Texture } from "./Layout";
import { Style } from "./Style";

export class Image extends BasicGroup {
    private _bitmap: Sprite = null;
    private _texture: Texture = null;
    //private _scale9GridRect: Rectangle = null;//九宫拉伸的尺寸
    private scale9RectData: number[] = [];
    private _fillMode: string = Style.SCALE;//scale, repeat, clip
    private _smoothing: boolean = false;
    private explicitWidth: number = NaN;
    private explicitHeight: number = NaN;

    public constructor() {
        super();
        this._bitmap = new Sprite;
        //this._bitmap.fillMode = Style.SCALE;
        this.addChild(this._bitmap);
    }

    /**
     * 加入到显示列表时调用
     * 子类可覆写该方法,添加UI逻辑
     */
    public createChildren(): void {
        super.createChildren();
        //this.touchEnabled = true;
    }

    /**
     * 设置填充模式
     */
    public get fillMode(): string {
        return this._fillMode;
    }
    public set fillMode(value: string) {
        if (this._fillMode != value) {
            this._fillMode = value;
            this.invalidate();
        }
    }

    /**
     * 设置贴图.
     */
    public get texture(): Texture {
        return this._texture;
    }
    public set texture(value: Texture) {
        let s = this;
        if (s._texture != value) {
            s._texture = value;
            //立即执行绘制，相应数据（width、height等）在外部才有效
            s.draw();
            //s.invalidate();
            s.onInvalidatePosition();
        }
    }

    /**
     * 九宫格
     * scale9Rectangle : [左边距,右边距,上边距,下边距]
     * 
     */
    public scale9Grid(data: number[] = []) {
        let s = this;
        if (data.length == 4) {
            this.scale9RectData = data.concat();
        } else {
            this.scale9RectData.length = 0;
        }
        this.invalidate();
    }
    // private scale9Rect() {
    //     let rect = new Rectangle();
    //     rect.x = 1;
    //     rect.y = 1;
    //     rect.width = 1;
    //     rect.height = 1;
    //     return rect;
    // }

    /**
     * 图片平滑设置，优化图片拉伸.
     * @param value
     *
     */
    public set smoothing(value: boolean) {
        if (this._smoothing != value) {
            this._smoothing = value;
            this.invalidate();
        }
    }
    public get smoothing(): boolean {
        return this._smoothing;
    }

    /**
     * 覆写width方法,在width改变的时候,做位置变化的计算
     * @param w
     */
    public set width(w: number) {
        if (w < 0 || w == this.explicitWidth) {
            return;
        }
        this.explicitWidth = w;
        super.set_width(w);
        this.onInvalidatePosition();
        this.invalidate();
    }
    public get width(): number {
        return this.get_width();
    }

    /**
     * 覆写height方法,在height改变的时候,做位置变化的计算
     * @param h
     */
    public set height(h: number) {
        if (h < 0 || h == this.explicitHeight) {
            return;
        }
        this.explicitHeight = h;
        super.set_height(h);
        this.onInvalidatePosition();
        this.invalidate();
    }
    public get height(): number {
        return this.get_height();
    }

    public draw(): void {
        let s = this;
        if (!s._bitmap || !s._texture) return;
        if (s._bitmap.texture != s._texture) {
            if (s.scale9RectData.length == 4) {
                s._bitmap.texture = null;
                s._bitmap.graphics.draw9Grid(s._texture, 0, 0, s._texture.sourceWidth, s._texture.sourceHeight, s.scale9RectData);
            } else {
                s._bitmap.texture = s._texture;
                //s._bitmap.graphics.drawImage(s._texture, 0, 0, s._texture.sourceWidth, s._texture.sourceHeight);
            }
            //s._bitmap.texture = s._texture;
            if (isNaN(s.explicitWidth)) {
                s.width = s._texture.sourceWidth;
            }
            if (isNaN(s.explicitHeight)) {
                s.height = s._texture.sourceHeight;
            }
        }

        // if (s.scale9RectData.length == 4) {
        //     if (s._scale9GridRect == null) s._scale9GridRect = s.scale9Rect();
        //     s._scale9GridRect.x = s.scale9RectData[0];
        //     s._scale9GridRect.y = s.scale9RectData[2];
        //     s._scale9GridRect.width = s._bitmap.texture.sourceWidth - (s.scale9RectData[0] + s.scale9RectData[1]);
        //     s._scale9GridRect.height = s._bitmap.texture.sourceHeight - (s.scale9RectData[2] + s.scale9RectData[3]);
        //     s._bitmap.scale9Grid = s._scale9GridRect;
        //     s._bitmap.scaleX = 1;
        //     s._bitmap.scaleY = 1;
        // } else {
        //     s._bitmap.scale9Grid = null;
        // }

        //s._bitmap.fillMode = s._fillMode;
        if (s._fillMode != Style.SCALE) {
            s._bitmap.width = s.width;
            s._bitmap.height = s.height;
        } else {
            s._bitmap.scaleX = s.width / s._texture.sourceWidth;
            s._bitmap.scaleY = s.height / s._texture.sourceHeight;
        }
    }

    public getBitmap(): Sprite {
        return this._bitmap;
    }

    /**
     * 获取xy位置的像素值,xy是舞台值
     * @param x
     * @param y
     */
    public getPixel32(x: number, y: number): Uint8Array {
        let s = this;
        if (s._bitmap && s._texture) {
            var locolPoint: Point = s.globalToLocal(new Point(x, y), false);
            return s._bitmap.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
        }
        return null;
    }

    // /**
    //  * 检测xy位置的像素值是否透明,xy是舞台值
    //  * @param x 舞台值
    //  * @param y 舞台值
    //  * @return true:有像素值, false:无像素值
    //  */
    // public testPixel32(x: number, y: number): boolean {
    //     let s = this;
    //     var datas: Uint8Array = s.getPixel32(x, y);
    //     for (var i: number = 0; i < datas.length; i++) {
    //         if (datas[i] > 0) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
}