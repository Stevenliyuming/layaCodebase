import { ResLoader } from './loader/ResLoader';
import { UICreator } from './basicUI/UICreator';
import { BasicGroup } from './basicUI/BasicGroup';
import Skeleton from "./animation/Skeleton";
import GameConfig from "./GameConfig";
import BaseScene from "./view/BaseScene";
import { Button } from './basicUI/Button';
import { Group } from './basicUI/Group';
import { Label } from './basicUI/Label';
import { Image } from "./basicUI/Image";
import { TextArea } from './basicUI/TextArea';
import { TextInput } from './basicUI/TextInput';
import { Texture, Event } from './basicUI/Layout';
import { List } from './basicUI/List';
import { ListItemRenderer } from './ListItemRenderer';
import { ListGroup } from './basicUI/ListGroup';
import { Style } from './basicUI/Style';
import { BasicUIEvent } from './basicUI/BasicUIEvent';
import { CheckBox } from './basicUI/CheckBox';
import { RadioButton } from './basicUI/RadioButton';
import { TabBar } from './basicUI/TabBar';
import Global from './util/Global';

export default class MainScene extends BaseScene {
    private group_play: Group;

    constructor() {
        super();
    }

    public onEnable() {
        super.onEnable();
    }

    public init() {
        let s = this;

        let bg = new Image;
        bg.texture = Laya.loader.getRes("../laya/assets/img/bg.png");
        s.addChild(bg);
        bg.left = bg.right = bg.top = bg.bottom = 0;

        s.group_play = new Group;
        s.addChild(s.group_play);
        s.group_play.width = GameConfig.width;
        s.group_play.height = GameConfig.height;
        s.group_play.horizontalCenter = 0;
        s.group_play.verticalCenter = 0;
        s.group_play.clip = false;

        // var button: Laya.Button = new Laya.Button();//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
        // button.skin = "../laya/assets/img/A.png";
        // button.stateNum = 1;
        // button.left = 150;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
        // button.top = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
        // button.clickHandler = Laya.Handler.create(this, this.onClickButton, [button], false);//设置 button 的点击事件处理器。
        // s.group_play.addChild(button);//将此 button 对象添加到显示列表。

        // let sheep: Skeleton = new Skeleton;
        // sheep.setDataByName("Sheep_Ani.sk", "../laya/assets/skeleton/");
        // sheep.show(s.group_play, s.group_play.width / 2, s.group_play.height / 2);
        // sheep.gotoAndPlay("goat_walk_anim", true);

        // let myButton = new Button;
        // myButton.name = "001";
        // s.group_play.addChild(myButton);
        // myButton.setStatus([Laya.loader.getRes("../laya/assets/img/A.png"), Laya.loader.getRes("../laya/assets/img/A点击.png")]);
        // myButton.setClickFunction(() => {
        //     console.log("click button");
        // }, s);

        let buttonSkins: Texture[] = [Laya.loader.getRes("../laya/assets/img/A.png"), Laya.loader.getRes("../laya/assets/img/A点击.png")];

        UICreator.createImage(buttonSkins[0], s.group_play, 200, 300);
        UICreator.createImage(buttonSkins[1], s.group_play, 200, 800);

        // let myButton = UICreator.createButton(buttonSkins);
        // s.group_play.addChild(myButton);
        // myButton.x = 500;
        // myButton.y = s.group_play.height - myButton.height - 100;
        // myButton.setClick(() => {
        //     console.log("click button");
        // }, s);

        // let group = new Group;
        // group.width = 300;
        // group.height = 200;
        // group.x = 600;
        // group.y = 600;
        // s.group_play.addChild(group);
        // group.showBg = true;
        // group.border = true;

        // let label: Label = new Label;
        // //label.setSize(800, 50);
        // label.text = "这是一个具有布局约束的文本";
        // s.group_play.addChild(label);
        // label.left = 50;
        // label.top = 500;
        // label.showBg = true;
        // console.log("label.width:" + label.width + "  label.height:" + label.height);
        // // label.autoSize = false;
        // // label.paddingLeft = 20;
        // // label.paddingRight = 20;
        // Laya.timer.once(100, s, () => {
        //     label.text = "一个具有布局约束的文本00000000000";
        // });

        // let hand = new Image;
        // hand.texture = Laya.loader.getRes("../laya/assets/img/hand.png");//RES.getRes("comRes_1_json.hand");
        // s.group_play.addChild(hand);
        // hand.left = 0;
        // hand.top = 100;
        // console.log("hand.width:" + hand.width + "  hand.height:" + hand.height);

        // let textInput = new TextInput;
        // textInput.width = 100;
        // textInput.height = 60;
        // s.group_play.addChild(textInput);
        // textInput.x = 1000;
        // textInput.y = 650;
        // textInput.showBg = true;
        // textInput.paddingLeft = 10;
        // textInput.paddingTop = 5;
        // textInput.paddingRight = 10;
        // textInput.paddingBottom = 5;
        // textInput.vAlign = "middle";

        // let textArea = new TextArea;
        // textArea.width = 300;
        // textArea.height = 300;
        // s.group_play.addChild(textArea);
        // textArea.x = 50;
        // textArea.y = 100;
        // textArea.showBg = true;
        // textArea.text = "1月1日";

        let listItemDataArr: any[] = [
            {
                res: "../laya/assets/img/A.png"
            },
            {
                res: "../laya/assets/img/A点击.png"
            },
            {
                res: "../laya/assets/img/A.png"
            },
            {
                res: "../laya/assets/img/A点击.png"
            },
            {
                res: "../laya/assets/img/A.png"
            },
            {
                res: "../laya/assets/img/A点击.png"
            },
            {
                res: "../laya/assets/img/A.png"
            },
            {
                res: "../laya/assets/img/A点击.png"
            },
            {
                res: "../laya/assets/img/A.png"
            },
            {
                res: "../laya/assets/img/A点击.png"
            },
            {
                res: "../laya/assets/img/A.png"
            },
            {
                res: "../laya/assets/img/A点击.png"
            },
        ];

        let listGroup = new List;
        s.group_play.addChild(listGroup);
        listGroup.x = 1300;
        listGroup.y = 0;
        listGroup.width = 700;
        listGroup.height = 600;
        listGroup.itemRenderer = ListItemRenderer;
        listGroup.gap = 100;
        listGroup.line = 2;
        listGroup.lineGap = 20;
        //listGroup.layout = Style.HORIZONTAL;
        listGroup.data = listItemDataArr;
        listGroup.addEventListener(BasicUIEvent.ITEM_SELECTED, (ev: any) => {
            console.log(ev);
        }, s);

        let listGroup2 = new ListGroup(350, 600, Style.VERTICAL, 20);
        listGroup2.renderList(ListItemRenderer, listItemDataArr, true);
        s.group_play.addChild(listGroup2);
        listGroup2.x = 600;
        listGroup2.y = 0;
        listGroup2.setMouseWheelEnable(true);
        let VBar = UICreator.createImage(Laya.loader.getRes("../laya/assets/img/slider_bar_v.png"));
        let hBar = UICreator.createImage(Laya.loader.getRes("../laya/assets/img/slider_bar_h.png"));
        listGroup2.scrollBar.setSliderBarSkins(VBar, hBar);
        listGroup2.addEventListener(BasicUIEvent.ITEM_SELECTED, (data: any) => {
            console.log(data);
        }, s);

        let scaleImage = UICreator.createImage(Laya.loader.getRes("../laya/assets/img/slider_bar_v.png"), s.group_play, 300, 300, [2, 2, 20, 20]);
        scaleImage.scale(2, 3);

        let res = ResLoader.getInstance().getRes("playSound", "resource/assets/comRes_1.png");
        UICreator.createImage(res.res, s.group_play, 100, 100);

        // s.group_play.addChild(VBar);
        // VBar.x = 50;
        // VBar.y = 600;

        // let checkBox = new CheckBox();
        // s.group_play.addChild(checkBox);
        // checkBox.label = "这是一个复选框"
        // checkBox.x = 300;
        // checkBox.y = 600;
        // checkBox.addEventListener(BasicUIEvent.CHANGE, (e: any) => {
        //     console.log(e);
        // }, s);

        // for (let i = 0; i < 3; ++i) {
        //     let radiobtn1 = new RadioButton();
        //     s.group_play.addChild(radiobtn1);
        //     radiobtn1.label = "单选按钮 " + `${i + 1}`
        //     radiobtn1.x = 300;
        //     radiobtn1.y = 800 + 60 * i;
        //     radiobtn1.groupName = "abc";
        //     radiobtn1.addEventListener(BasicUIEvent.CHANGE, (e: any) => {
        //         console.log(e);
        //     }, s);

        //     let tab1 = new TabBar();
        //     s.group_play.addChild(tab1);
        //     tab1.label = "标签页 " + `${i + 1}`
        //     tab1.x = 600;
        //     tab1.y = 800 + 60 * i;
        //     tab1.groupName = "biaoqian";
        //     tab1.addEventListener(BasicUIEvent.CHANGE, (e: any) => {
        //         console.log(e);
        //     }, s);
        // }

        // console.log(Global.getQualifiedClassName(myButton));
        // console.log(Global.getQualifiedClassName(myButton));
        // console.log("---------------");
        // console.log(Global.getQualifiedClassName(button));

        // console.log(Global.getQualifiedClassName(Button));
        // console.log(Global.getQualifiedClassName(Laya.Button));

        //let obj = 1;console.log(Global.is(obj, "Number"));
    }

    private onClickButton(e: any) {
        console.log(e);
    }
}
