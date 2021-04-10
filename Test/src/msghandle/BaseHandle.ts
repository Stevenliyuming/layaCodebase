import MyEvent from "../event/MyEvent";
import { IHandle } from "./IHandle";

/**
 * UI数据集中处理
 */
export class BaseHandle implements IHandle {
    public METHOD_DEF: Object = {};//消息和方法的映射关系表
    public EVENT_DEF: Array<string> = [];
    public constructor() {
        this.initWeakListener();
    }

    /**
     * 初始化弱监听
     * 子类可以覆写这个,添加数据
     */
    public initWeakListener(): void {
    }

    /**
     * 添加事件的处理，注意,functName的名称,前缀onEvent不包含
     * 如果没有对应的类型在此出现,则该Handle对Event事件到此为止,不再派发,防止造成事件死循环
     * @param type MyEvent事件的类型
     */
    public addHandleEvent(type: string, funcName: string): void {
        if (this.EVENT_DEF.indexOf(type) < 0) {
            this.EVENT_DEF.push(type);
            this.METHOD_DEF[type] = funcName;
        }
    }

    /**
     * 添加协议处理的Handle,注意,functName的名称,前缀onPacket不包含
     * @param msgId packet协议号
     * @param funcName  对应的callback function,不包含onPacket前缀
     */
    public addHandlePacket(msgId: number, funcName: string): void {
        this.METHOD_DEF["" + msgId] = funcName;
        //console.log("BaseHandle ADD METHOD_DEF=" + msgId + ", funcName=" + funcName);
    }

    /**
     * 接收到服务器的控制信号
     * call function的时候,会自动前缀onPacket
     * @param packet
     */
    public receivePacket(packet: any): void {
        //console.log("BaseHandle onPacketData=" + egret.getQualifiedClassName(this) + ", has=" + this.METHOD_DEF.hasOwnProperty("" + packet.header.messageId));
        if (this.METHOD_DEF.hasOwnProperty("" + packet.header.messageId)) this["onPacket" + this.METHOD_DEF["" + packet.header.messageId]].call(this, packet);
    }

    /**
     * 事件派发
     * call function的时候,会自动前缀onEvent
     * @param event
     */
    public receiveEvent(event: MyEvent): void {
        if (this.EVENT_DEF.indexOf(event.type) >= 0) {
            if (this.METHOD_DEF.hasOwnProperty(event.type)) this["onEvent" + this.METHOD_DEF[event.type]].call(this, event);
        }
    }
}