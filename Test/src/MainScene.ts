import Skeleton from "./animation/Skeleton";
import GameConfig from "./GameConfig";
import BaseUIComponent from "./ui/BaseUIComponent";
import { Button } from "./ui/Button";
import Global from "./util/Global";
import BaseScene from "./view/BaseScene";

export default class MainScene extends BaseScene {
    private group_play: BaseUIComponent;

    constructor() {
        super();
    }

    public onEnable() {
        super.onEnable();
    }

    public init() {
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

        var button: Laya.Button = new Laya.Button();//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
        button.skin = "../laya/assets/img/A.png";
        button.stateNum = 1;
        button.left = 150;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
        button.top = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
        button.clickHandler = Laya.Handler.create(this, this.onClickButton, [button], false);//设置 button 的点击事件处理器。
        s.group_play.addChild(button);//将此 button 对象添加到显示列表。

        let sheep: Skeleton = new Skeleton;
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
        console.log("---------------");
        console.log(Global.getQualifiedClassName(button));

        console.log(Global.getDefinitionByName("Button"));
    }

    private onClickButton(e: any) {
        console.log(e);
    }
}
