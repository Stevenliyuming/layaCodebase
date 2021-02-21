import GameConfig from "./GameConfig";
import BaseScene from "./view/BaseScene";

export class MainScene extends BaseScene {
    constructor() {
        super();
        this.init();
    }

    private init() {
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
        

        var button:Laya.Button = new Laya.Button();//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
        button.skin = "../laya/assets/img/A.png";
        button.stateNum = 1;
        button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
        button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
        button.clickHandler = Laya.Handler.create(this, this.onClickButton, [button], false);//设置 button 的点击事件处理器。
        playGroup.addChild(button);//将此 button 对象添加到显示列表。
    }

    private onClickButton(e:any) {
		console.log(e);
	}
}