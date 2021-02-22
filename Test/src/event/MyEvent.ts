import EventManager from "./EventManager";

export default class MyEvent {
    public callStack: string = null;
    public type: string = null;
    public datas: Object = {};

    /**
     * <p>事件基类构造函数,包含一个参数</p>
     * @param type 事件类型
     */
    public constructor(typeValue: string) {
        this.type = typeValue;
    }

    /**
     *  <p>添加单个对象到结果集中</p>
     *  @param value 要添加的对象
     */

    public addItem(property: string, value: any): void {
        this.datas[property] = value;
    }

    /**
     * 获取property对应的内容
     * @param property
     * @returns {null}
     */
    public getItem(property: string): any {
        if (this.datas.hasOwnProperty(property)) {
            return this.datas[property];
        }
        return null;
    }

    /**
     * 查询是否携带了proprty名称的数据
     * @param property
     * @returns {boolean}
     */
    public hasItem(property: string): any {
        return this.datas.hasOwnProperty(property);
    }

    /**
     * 回收对象到对象池中
     */
    public destory(): void {
        this.callStack = null;
        for (var item in this.datas) {
            delete this.datas[item];
        }
    }

    /**
     * 删除property名称的数据
     * @param proprty
     */
    public removeItem(property: string): boolean {
        if (this.datas.hasOwnProperty(property)) {
            delete this.datas[property];
            return true;
        }
        return false;
    }

    /**
     * 派发event对象
     */
    public send(): void {
        EventManager.dispatchEvent(this);
    }

    /**
     * 从对象池中获取一个type类型的event对象
     * @param type
     * @returns {MyEvent}
     */
    public static getEvent(type: string): MyEvent {
        return EventManager.getEvent(type);
    }

    /**
     * 快捷发送一个type类型的event事件
     * @param type
     */
    public static sendEvent(type: string, param: any = null): void {
        EventManager.dispatch(type, param);
    }
}