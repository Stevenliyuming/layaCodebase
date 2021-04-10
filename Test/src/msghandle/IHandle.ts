import MyEvent from "../event/MyEvent";

/**
 * 为一些UI的消息接收定制接口,方便在已经展示的时候,通过packet和event的事件进行驱动刷新显示
 */
export interface IHandle {
    receivePacket(packet: any): void;
    receiveEvent(event: MyEvent): void;
}