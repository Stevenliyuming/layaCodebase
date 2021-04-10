import MyEvent from "../event/MyEvent";
import { IHandle } from "./IHandle";

export class MessageControler {
    private static handles: Array<IHandle> = [];
    private static eventHandles: Array<string> = [];

    /**
     * 添加数据处理的Handle
     * 逻辑处理模块,需要添加Handle,以便方便的在view刷新前,优先得到数据,预先处理数据
     * @param handle
     */
    public static addHandle(handle: IHandle): void {
        if (handle != null && MessageControler.handles.indexOf(handle) < 0) MessageControler.handles.push(handle);
    }

    /**
     * 添加弱事件处理
     * 只有注册的事件,当前的view才能收到
     * @param eventName
     */
    public static addEvent(eventName: string): void {
        if (MessageControler.eventHandles.indexOf(eventName) < 0) MessageControler.eventHandles.push(eventName);
    }

    /**
     * 协议事件派发
     * @param pkt
     */
    public static receivePacket(pkt: any): void {
        //console.log("MessageHandle onPacketData=" + egret.getQualifiedClassName(pkt));
        //优先处理数据的handle
        var i: number = 0;
        for (i = 0; i < MessageControler.handles.length; i++) {
            MessageControler.handles[i].receivePacket(pkt);
        }
        //界面刷新
        //ViewManager.receivePacket(pkt);
    }

    /**
     * MyEvent事件派发
     * @param event
     */
    public static receiveEvent(event: MyEvent): void {
        //console.log("MessageControl onEventData=" + event.type)
        if (MessageControler.eventHandles.indexOf(event.type) >= 0) {
            var i: number = 0;
            for (i = 0; i < MessageControler.handles.length; i++) {
                MessageControler.handles[i].receiveEvent(event);
            }
        }
        //界面刷新
        //ViewManager.receiveEvent(event);
    }
}