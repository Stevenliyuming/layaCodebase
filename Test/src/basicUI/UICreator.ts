import { Button } from "./Button";
import { CheckBox } from "./CheckBox";
import { DefaultRenderer } from "./DefaultRenderer";
import { ImageNumber } from "./ImageNumber";
import { Label } from "./Label";
import { DisplayObjectContainer, Point, Sprite, Texture } from "./Layout";
import { List } from "./List";
import { Progress } from "./Progress";
import { RadioButton } from "./RadioButton";
import { Slider } from "./Slider";
import { Style } from "./Style";
import { TabBar } from "./TabBar";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";
import { Image } from "./Image";

export class UICreator {
    public constructor() {
    }

    /**
     * 创建图片显示对象
     * scale9Rect 图片的九宫格数据[左边距,右边距,上边距,下边距]
     */
    public static createImage(texture: Texture, pr: DisplayObjectContainer=null, px: number = 0, py: number = 0, scale9Rect: number[] = []): Image {
        let img = new Image;
        if (pr) {
            pr.addChild(img);
            img.x = px;
            img.y = py;
        }
        img.texture = texture;
        //img.scale9Grid(scale9Rect);
        return img;
    }

    /**
     * 创建位图数字
     * imageAlias 数字散图名称前缀
     * sheetAlias 数字图集名称
     */
    public static createImageNumber(pr: DisplayObjectContainer, px: number, py: number, imageAlias: string, sheetAlias: string = "", verticalAlign: string = "top", horizontalAlign: string = "left", defaultText: string = null): ImageNumber {
        let imageNumber = new ImageNumber;
        imageNumber.init(imageAlias, sheetAlias, verticalAlign, horizontalAlign);
        imageNumber.text = defaultText;
        if (pr) {
            imageNumber.show(pr, px, py);
        }
        return imageNumber;
    }

    /**
     * 创建普通按钮
     * skins设置按钮可用状态皮肤
     * <p>[STATE_UP, STATE_DOWN, STATE_OVER, STATE_DISABLE]</p>
     */
    public static createButton(skins: Texture[], pr:DisplayObjectContainer=null, px:number=0, py:number=0, clickFun: Function = null, funObj: any = null, clickSound: string = null): Button {
        let button = new Button;
        button.setSkins(skins);
        button.setClick(clickFun, funObj);
        button.sound = clickSound;
        if(pr) {
            pr.addChild(button);
            button.x = px;
            button.y = py;
        }
        return button;
    }

    /**
     * 创建复选框
     * skins设置按钮可用状态皮肤
     * <p>[STATE_NORMAL, STATE_CHECK, STATE_DISABLE]</p>
     */
    public static createCheckBox(skins: Texture[], label: string, clickFun: Function = null, funObj: any = null, clickSound: string = null): Button {
        let box = new CheckBox;
        box.setSkins(skins);
        box.setClick(clickFun, funObj);
        box.label = label;
        box.sound = clickSound;
        return box;
    }

    /**
     * 创建单选按钮
     * skins设置按钮可用状态皮肤
     * <p>[STATE_NORMAL, STATE_CHECK]</p>
     */
    public static createRadioButton(skins: Texture[], groupName: string, label: string, clickFun: Function = null, funObj: any = null, clickSound: string = null): Button {
        let radio = new RadioButton;
        radio.setSkins(skins);
        radio.setClick(clickFun, funObj);
        radio.groupName = groupName;
        radio.label = label;
        radio.sound = clickSound;
        return radio;
    }

    /**
     * 创建标签页
     * skins设置按钮可用状态皮肤
     * <p>[STATE_NORMAL, STATE_CHECK]</p>
     */
    public static createTabBar(skins: Texture[], groupName: string, label: string = null, clickFun: Function = null, funObj: any = null, clickSound: string = null): Button {
        let tabBar = new TabBar;
        tabBar.setSkins(skins);
        tabBar.setClick(clickFun, funObj);
        tabBar.label = label;
        tabBar.sound = clickSound;
        return tabBar;
    }

    /**
     * 创建文本标签
     */
    public static createLabel(pr: DisplayObjectContainer, px: number, py: number, fonsize: number = 26, text: string = ""): Label {
        let label: Label = new Label;
        if (pr) {
            pr.addChild(label);
            label.x = px;
            label.y = py;
        }
        label.fontSize = fonsize;
        label.text = text;
        label.showBg = false;
        label.autoSize = true;
        return label;
    }

    /**
     * 创建文本显示区域
     */
    public static createTextArea(pr: DisplayObjectContainer, px: number, py: number, width: number, height: number, text: string = ""): TextArea {
        let textArea = new TextArea;
        if (pr) {
            pr.addChild(textArea);
            textArea.x = 200;
            textArea.y = 100;
        }
        textArea.width = 300;
        textArea.height = 300;
        textArea.showBg = true;
        textArea.text = text;
        return textArea;
    }

    /**
     * 创建文本输入框
     */
    public static createTextInput(pr: DisplayObjectContainer, px: number, py: number, width: number, height: number): TextInput {
        let textInput = new TextInput;
        if (pr) {
            pr.addChild(textInput);
            textInput.x = px;
            textInput.y = py;
        }
        textInput.showBg = true;
        textInput.width = width;
        textInput.height = height
        return textInput;
        // let textInput = new TextInput;
        // textInput.width = 300;
        // textInput.height = 100;
        // s.group_play.addChild(textInput);
        // textInput.x = 100;
        // textInput.y = 100;
        // textInput.showBg = true;
        // textInput.paddingLeft = 10;
        // textInput.paddingTop = 10;
        // textInput.paddingRight = 10;
        // textInput.paddingBottom = 20;
    }

    /**
     * 创建列表显示容器
     * itemRenderer 显示项对应的类
     * gap 显示项垂直方向间距
     * line 列表显示项的列数
     * lineGap 显示项列间距
     */
    public static createList(pr: DisplayObjectContainer, px: number, py: number, width: number, height: number, itemRenderer: DefaultRenderer, listData: any[], gap: number = 10, line: number = 1, lineGap: number = 10, layout: string = Style.VERTICAL): List {
        let list = new List;
        if (pr) {
            pr.addChild(list);
            list.x = px;
            list.y = py;
        }
        list.width = width;
        list.height = height
        list.itemRenderer = itemRenderer;
        list.gap = gap;
        list.line = line;
        list.lineGap = lineGap;
        list.data = listData;
        return list;
        // let listItemDataArr:any[] = [
        // 	{
        // 		res: "A_png"
        // 	},
        // 	{
        // 		res: "A点击_png"
        // 	}
        // ];
        // let listGroup = new List;
        // s.group_play.addChild(listGroup);
        // listGroup.x = 800;
        // listGroup.y = 0;
        // listGroup.width = 700;
        // listGroup.height = 600;
        // listGroup.itemRenderer = ListItemRenderer;
        // listGroup.gap = 100;
        // listGroup.line = 2;
        // listGroup.lineGap = 20;
        // //listGroup.layout = Style.HORIZONTAL;
        // listGroup.data = listItemDataArr;
        // listGroup.addEventListener(List.ITEM_SELECTED, (ev:egret.Event)=>{
        // 	console.log(ev.data);
        // }, s);
    }

    /**
     * 根据name关键字创建一个Bitmap对象
     */
    // public static createBitmap(name: string): Bitmap {
    //     let result = new Bitmap();
    //     let texture: Texture = Laya.loader.getRes(name);//RES.getRes(name);
    //     result.texture = texture;
    //     return result;
    // }

    /**
     * 创建Spine动画
     */
    public static createSpineAnimation(skeletonName: string, _path: string = null) {
        // let json = Laya.loader.getRes(skeletonName + "_json");//RES.getRes(skeletonName + "_json");
        // let atlas = Laya.loader.getRes(skeletonName + "_atlas");//RES.getRes(skeletonName + "_atlas");
        // let imgs = {
        //     [skeletonName + '.png']: Laya.loader.getRes(skeletonName + "_png")//RES.getRes(skeletonName + "_png")
        // }
        // for (var i = 2; i < 5; i++) {
        //     let img = Laya.loader.getRes(skeletonName + i + "_png");//RES.getRes(skeletonName + i + "_png")
        //     if (img != null) {
        //         imgs[skeletonName + i + '.png'] = img
        //     }
        //     else {
        //         break;
        //     }
        // }

        // let texAtlas = spine.createTextureAtlas(atlas, imgs);
        // let skelData = spine.createSkeletonData(json, texAtlas);
        // return new spine.SkeletonAnimation(skelData);
    }

    /**
     * 创建进度条
     * pr:添加到的容器
     * px:x坐标
     * py:y坐标
     * bg:进度条背景
     * skin:进度条进度
     */
    public createProgress(bg: Sprite = null, skin: Sprite = null, pr: DisplayObjectContainer = null, px: number = 0, py: number = 0, ) {
        let progress = new Progress();
        progress.setSkin(bg, skin);
        if (pr) {
            pr.addChild(progress);
            progress.x = px;
            progress.y = py;
        }
        return progress;
    }

    /**
     * 创建滑动条
     * pr:添加到的容器
     * px:x坐标
     * py:y坐标
     * bg:进度条背景
     * skin:进度条进度
     */
    public createSlider(bg: Sprite = null, skin: Sprite = null, bar: Sprite = null, pr: DisplayObjectContainer = null, px: number = 0, py: number = 0, ) {
        let slider = new Slider();
        slider.setSkin(bg, skin, bar);
        if (pr) {
            pr.addChild(slider);
            slider.x = px;
            slider.y = py;
        }
        return slider;
    }

    /**
     * 获取xy位置的像素值,xy是舞台值
     * @param x
     * @param y
     */
    public static getPixel32(target: Sprite, x: number, y: number): Uint8Array {
        if (target && target.texture) {
            var locolPoint: Point = target.globalToLocal(new Point(x, y));
            return target.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
        }
        return null;
    }

    /**
     * 检测xy位置的像素值是否透明,xy是舞台值
     * @param x 舞台值
     * @param y 舞台值
     * @return true:有像素值, false:无像素值
     */
    public static testPixel32(target: Sprite, x: number, y: number): boolean {
        var datas: Uint8Array = this.getPixel32(target, x, y);
        for (var i: number = 0; i < datas.length; i++) {
            if (datas[i] > 0) {
                return true;
            }
        }
        return false;
    }
}