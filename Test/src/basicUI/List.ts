import MyEvent from "../event/MyEvent";
import { MessageControler } from "../msghandle/MessageControler";
import HeartBeat from "../util/HeartBeat";
import ObjectPool from "../util/ObjectPool";
import { BasicGroup } from "./BasicGroup";
import { BasicUIEvent } from "./BasicUIEvent";
import { DefaultRenderer } from "./DefaultRenderer";
import { Group } from "./Group";
import { Point, Rectangle, Sprite, Event } from "./Layout";
import { Style } from "./Style";

export class List extends Group {
    private METHOD_DEF: Object = {};
    private _itemRenderer: any = DefaultRenderer;
    private _itemContainer: BasicGroup = null;
    private _gap: number = 2;
    private _direction: string = Style.VERTICAL;//朝向
    private _dataIndexBegin: number = 0;//显示数据起始索引
    private _dataIndexEnd: number = 0;//显示数据结束索引

    private _itemDatas: Array<any> = null;
    private _dataIndexToRender: any = null;
    private _autoSize: boolean = false;
    private _marginTop: number = 4;
    private _marginBottom: number = 4;
    private _marginLeft: number = 4;
    private _marginRight: number = 4;
    private _line: number = 1;//设置排数
    private _lineGap: number = 0;//设置排间距

    private _effect: string = null;//效果选择
    private _isDragBegin: boolean = false;//点击开始
    private _isMoveBegin: boolean = false;//滑动开始
    private _moveCount: number = 0;//移动的通知次数
    private _dragBeginPoint: Point = null;
    private _dragLastTime: number = 0;
    private bounceBack: boolean = false;//列表项回弹

    private _autoScrollGap: number = 0;//自动滚动的间距
    private _autoScrollStep: number = 0;
    private _lastTimeNum: number = 0;//

    private _selected: any = null;//选择的对象
    private _fixed: boolean = false;//在元素不够的时候,禁止继续滚动

    private _data_end_func_call: any = null;//数据已经结束的call
    private _data_end_func_this: any = null;//数据已经结束的func的this


    public constructor() {
        super();
    }

    /**
     * 加入到显示列表时调用
     * 子类可覆写该方法,添加UI逻辑
     */
    public createChildren(): void {
        super.createChildren();
        //this.setSize(100, 300);
        this._itemContainer = new BasicGroup();
        // this._itemContainer.setSize(this.width, this.height);
        this.addChild(this._itemContainer);
        this._itemContainer.scrollRect = new Rectangle(0, 0, this.width, this.height);
        this.addEventListener(BasicUIEvent.TOUCH_BEGIN, this.onTouchBeginEvent, this);
        this.addEventListener(BasicUIEvent.TOUCH_MOVE, this.onTouchMoveEvent, this);
        this.addEventListener(BasicUIEvent.TOUCH_END, this.onTouchEndEvent, this);
        this.addEventListener(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchReleaseOutsideEvent, this)
        this._dragBeginPoint = new Point;
        this.touchNonePixel = true;
    }

    /**
     * 添加事件的处理
     * 注意:必须调用MessageControler.addEvent()注册事件名称,否者不会转发到这里
     * 如果没有对应的的类型在此出现,则该Handle对Event事件到此为止,不再派发,防止造成事件死循环
     * @param type MyEvent事件的类型
     * @param func  对应的call back function,不包含onEvent前缀
     */
    public addHandleEvent(eventType: string, funcName: string): void {
        //console.log("ReceiveGroup this=" + egret.getQualifiedClassName(this) + ", addHandleEvent=" + type + ", funcName=" + funcName);
        MessageControler.addEvent(eventType);
        this.METHOD_DEF[eventType] = funcName;
    }

    /**
     * 收到界面弱事件通知
     * @param event
     */
    public receiveEvent(event: MyEvent): void {
        var sp: Sprite = null;
        for (var i: number = 0; i < this._itemContainer.numChildren; i++) {
            sp = <Sprite>this._itemContainer.getChildAt(i);
            if (sp["refresh"]) {
                sp["refresh"]();
            }
        }
    }

    /**
     * 点击开始
     * @param event
     */
    public onTouchBeginEvent(event: Event): void {
        if (!this._itemDatas || this._itemDatas.length == 0) return;
        this._isDragBegin = true;
        this._isMoveBegin = false;
        this._lastTimeNum = 0;
        this._moveCount = 0;
        this._dragBeginPoint.x = event.stageX;
        this._dragBeginPoint.y = event.stageY;
        this._dragLastTime = Date.now();// egret.getTimer();
        HeartBeat.removeListener(this, this.onAutoScroll);
        //console.log("this._isDragBegin=" + this._isDragBegin + ", x=" + this._dragBeginPoint.x + ", y=" + this._dragBeginPoint.y)
    }

    /**
     * 点击移动
     * @param event
     */
    public onTouchMoveEvent(event: Event): void {
        //if (!this._isDragBegin || !this._itemDatas || this._itemDatas.length == 0) return;
        if (!this._isDragBegin || !this._itemDatas || this._itemDatas.length == 0 || this.bounceBack) return;
        //console.log("onTouchMoveEvent x=" + event.stageX + ", y=" + event.stageY)
        if (this._isDragBegin) {
            this._isMoveBegin = true;
            this._moveCount++;
            this.moveItemUIPosition(event.stageX - this._dragBeginPoint.x, event.stageY - this._dragBeginPoint.y);
        }
        if (this._direction == Style.VERTICAL) {//yv值
            this._autoScrollGap = event.stageY - this._dragBeginPoint.y;
            if (event.stageY <= this.getGlobalXY().y || event.stageY >= this.getGlobalXY().y + this.height) {//超出范围
                this.onTouchEndEvent(event);
                return;
            }
        } else {
            this._autoScrollGap = event.stageX - this._dragBeginPoint.x;
            if (event.stageX <= this.getGlobalXY().x || event.stageX >= this.getGlobalXY().x + this.width) {//超出范围
                this.onTouchEndEvent(event);
                return;
            }
        }
        // this._lastTimeNum = Date.now() - this._dragLastTime;
        this._dragBeginPoint.x = event.stageX;
        this._dragBeginPoint.y = event.stageY;
        //this._dragLastTime = Date.now();
    }

    public onTouchReleaseOutsideEvent(event: Event): void {
        //this._isDragBegin = false;
        //this._isMoveBegin = false;
        //if (!this._fixed)this.checkUIFreeback();
        this.onTouchEndEvent(event);
        //console.log("onTouchReleaseOutsideEvent");
    }

    /**
     * 点击结束
     * @param event
     */
    public onTouchEndEvent(event: Event): void {
        let s = this;
        if (!this._isDragBegin || !this._itemDatas || this._itemDatas.length == 0 || this.bounceBack) return;
        console.log("onTouchEndEvent this._dataIndexBegin=" + s._dataIndexBegin + ", this._dataIndexEnd=" + s._dataIndexEnd);
        //单击处理
        if (s._isDragBegin && (!s._isMoveBegin || (s._moveCount < 4 && Math.abs(event.stageX - s._dragBeginPoint.x) < 5 && Math.abs(event.stageY - s._dragBeginPoint.y) < 5))) {
            //console.log("onTouchEndEvent tap!!");
            var sp: Sprite = null;
            var spPoint: Point = s._itemContainer.globalToLocal(new Point(event.stageX, event.stageY), false);
            for (var i: number = 0; i < s._itemContainer.numChildren; i++) {
                sp = <Sprite>s._itemContainer.getChildAt(i);
                //spPoint = sp.localToGlobal(0, 0);
                //if (spPoint.x < event.stageX && spPoint.y < event.stageY && (spPoint.x + sp.width) > event.stageX && (spPoint.y + sp.height) > event.stageY) 
                //if(sp.hitTestPoint(event.stageX, event.stageY))
                if (sp.x < spPoint.x && sp.y < spPoint.y && (sp.x + sp.width) > spPoint.x && (sp.y + sp.height) > spPoint.y) {
                    try {
                        s.selected = sp["_data"];
                        console.log(sp["dataIndex"]);
                        //console.log("list.selected=" + JSON.stringify(sp["_data"]));
                        break;
                    } catch (e) {

                    }
                }
            }
            s._isDragBegin = false;
            s._isMoveBegin = false;
            return;
        }
        s._isDragBegin = false;
        s._isMoveBegin = false;
        s._lastTimeNum = Date.now() - s._dragLastTime;
        //console.log("000timer=" + this._lastTimeNum + ", gap.value=" + this._autoScrollGap);
        //Debug.log = "timer=" + this._lastTimeNum;
        if (s._lastTimeNum < 400 && ((s._dataIndexBegin > 0 && s._autoScrollGap > 0) || (s._itemDatas && s._dataIndexEnd < s._itemDatas.length - 1 && s._autoScrollGap < 0))) {
            //console.log("111timer=" + timer);
            //时间越短,倍数越大
            //Debug.log = "_autoScrollGap=" + this._autoScrollGap + ", caculte=" + (this._autoScrollGap / this._lastTimeNum);
            s._autoScrollGap = (s._autoScrollGap / s._lastTimeNum) * 50;
            //启用加速滑动的方式
            HeartBeat.addListener(s, s.onAutoScroll);
            return;
        }
        //this.checkUIFreeback();
        s.checkBounceBack();
    }

    private onAutoScroll(): void {
        let s = this;
        if (s._direction == Style.VERTICAL) {//yv值
            s.moveItemUIPosition(0, s._autoScrollGap);
        } else {
            s.moveItemUIPosition(s._autoScrollGap, 0);
        }
        s._autoScrollGap -= s._autoScrollGap / 10;
        if (Math.abs(s._autoScrollGap) < 0.5 || s._dataIndexBegin == 0 || s._dataIndexEnd == s._itemDatas.length - 1) {
            HeartBeat.removeListener(s, s.onAutoScroll);
            //this.checkUIFreeback();
            s.checkBounceBack();
        }
    }

    /**
     * 检测是否需要回弹
     */
    private checkBounceBack() {
        // if(this._dataIndexBegin == 0 && this._dataIndexEnd != this._itemDatas.length - 1) return;
        if (this._itemContainer.numChildren > 0 && this._itemDatas && this._itemDatas.length > 0 && (this._dataIndexBegin == 0 || this._dataIndexEnd >= this._itemDatas.length - 1)) {
            var pos: number = 0;
            if (this._dataIndexBegin == 0) {
                //console.log("list.freeback.11111");
                if (this._direction == Style.VERTICAL) {//yv值
                    pos = (<Sprite>this._itemContainer.getChildAt(0)).y;
                } else {
                    pos = (<Sprite>this._itemContainer.getChildAt(0)).x;
                }
                if (pos < 0 && this._dataIndexEnd != (this._itemDatas.length - 1)) {
                    return;
                }
            } else if (this._dataIndexEnd == this._itemDatas.length - 1) {
                //console.log("list.freeback.4444");
                let child = <Sprite>this._itemContainer.getChildAt(this._itemContainer.numChildren - 1);
                if (this._direction == Style.VERTICAL) {//yv值
                    pos = child.y + child.height - this._itemContainer.height;
                } else {
                    pos = child.x + child.width - this._itemContainer.width;
                }
                //console.log("list.freeback.5555=" + pos);
                if (pos > 0 && this._dataIndexBegin != 0) {
                    return;
                }
            }

            if (pos != 0) {
                //设置列表回弹状态
                this.bounceBack = true;
                this._autoScrollStep = Number((-pos / 5).toFixed(2));
                this._autoScrollGap = Number(Math.abs(pos).toFixed(2));
                // console.log(this._autoScrollStep);
                //console.log(this._autoScrollGap);
                HeartBeat.addListener(this, this.doBounceBack);
            }
        }
    }

    private doBounceBack() {
        if (this._autoScrollGap < Math.abs(this._autoScrollStep)) {
            this._autoScrollStep = this._autoScrollStep > 0 ? this._autoScrollGap : -this._autoScrollGap;
        }
        if (this._direction == Style.VERTICAL) {//yv值
            this.moveItemUIPosition(0, this._autoScrollStep);
        } else {
            this.moveItemUIPosition(this._autoScrollStep, 0);
        }
        this._autoScrollGap -= Math.abs(this._autoScrollStep);
        if (this._autoScrollGap <= 0) {
            //console.log(this._autoScrollGap);
            //console.log(this._autoScrollStep);
            if (this.bounceBack) this.bounceBack = false;
            this._autoScrollStep = 0;
            this._autoScrollGap = 0;
            HeartBeat.removeListener(this, this.doBounceBack);
        }
    }

    /**
     * 移出render显示
     * @param render
     */
    private removeRender(render: Sprite): void {
        if (!render) return;
        for (var key in this._dataIndexToRender) {
            if (this._dataIndexToRender[key] === render) {
                delete this._dataIndexToRender[key];
                break;
            }
        }
        try {
            //render["destroy"]();
            render["data"] = null;
            render["list"] = null;
        } catch (e) {
        }
        if (render && render.parent) render.parent.removeChild(render);
        ObjectPool.recycleClass(render, "list_" + this.name);
    }

    /**
     * 对整体render进行位移,并补足空出的位置
     * @param xv
     * @param yv
     */
    private moveItemUIPosition(xv: number, yv: number): void {
        //console.log("moveItemUIPosition this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd + ", x=" + xv + ", y=" + yv)
        var itemRenderer: Sprite = null;
        var addNum: number = 0;
        for (var i: number = this._itemContainer.numChildren - 1; i >= 0; i--) {
            itemRenderer = <Sprite>this._itemContainer.getChildAt(i);
            if (this._direction == Style.VERTICAL) {//yv值
                if (!this._fixed) itemRenderer.y += yv;
                //补充一个
                //console.log("this._dataIndexEnd=" + this._dataIndexEnd + ":this._itemDatas.length - 1=" + (this._itemDatas.length - 1));
                if (yv < 0) {//^向上
                    if (this._dataIndexEnd < this._itemDatas.length - 1) {
                        let child = <Sprite>this._itemContainer.getChildAt(this._itemContainer.numChildren - 1);
                        if (child.y + child.height + this._gap < this._itemContainer.height) {
                            addNum = this.addUIItem(this._dataIndexEnd + 1, false);
                            this._dataIndexEnd += addNum;
                            //console.log("moveItemUIPosition 00000 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd)
                        }

                        if ((itemRenderer.y + itemRenderer.height) < 0) {
                            this.removeRender(itemRenderer);
                            //console.log("remove 000 index.value=" + this._dataIndexBegin);
                            this._dataIndexBegin++;
                            //console.log("moveItemUIPosition 11111 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd);
                        }
                    }
                } else {//v向下
                    if (this._dataIndexBegin > 0) {
                        let child = <Sprite>this._itemContainer.getChildAt(0);
                        if (child.y - this._gap > 0) {
                            addNum = this.addUIItem(this._dataIndexBegin - this._line, true);
                            this._dataIndexBegin -= addNum;
                            //console.log("moveItemUIPosition 22222 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd)
                        }

                        if (itemRenderer.y > this._itemContainer.height) {
                            this.removeRender(itemRenderer);
                            //console.log("remove 111 index.value=" + this._dataIndexEnd);
                            this._dataIndexEnd--;
                            //console.log("moveItemUIPosition 33333 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd)
                        }
                    }
                }
            } else {//xv值
                if (!this._fixed) itemRenderer.x += xv;
                //补充一个
                if (xv < 0) {//^向左
                    if (this._dataIndexEnd < this._itemDatas.length - 1) {
                        let child = <Sprite>this._itemContainer.getChildAt(this._itemContainer.numChildren - 1);
                        if (child.x + itemRenderer.width + this._gap < this._itemContainer.width) {
                            addNum = this.addUIItem(this._dataIndexEnd + 1, false);
                            this._dataIndexEnd += addNum;
                            //console.log("moveItemUIPosition 4444 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd)
                        }

                        if ((itemRenderer.x + itemRenderer.width) < 0) {
                            this.removeRender(<Sprite>this._itemContainer.getChildAt(i));
                            this._dataIndexBegin++;
                            //console.log("moveItemUIPosition 5555 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd)
                        }
                    }

                } else {//v向右
                    if (this._dataIndexBegin > 0) {
                        let child = <Sprite>this._itemContainer.getChildAt(0);
                        if (child.x - this._gap > 0) {
                            addNum = this.addUIItem(this._dataIndexBegin - this.line, true);
                            this._dataIndexBegin -= addNum;
                            //console.log("moveItemUIPosition 6666 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd)
                        }

                        if (itemRenderer.x > this._itemContainer.width) {
                            this.removeRender(<Sprite>this._itemContainer.getChildAt(i));
                            this._dataIndexEnd--;
                            //console.log("moveItemUIPosition 7777 this._dataIndexBegin=" + this._dataIndexBegin + ", this._dataIndexEnd=" + this._dataIndexEnd)
                        }
                    }
                }
            }
        }
    }

    /**
     * 添加一个节点
     * @param dataIndex 数据的下标
     * @param topPlace true:添加在最前面,添加在最后面
     */
    private addUIItem(dataIndex: number, topPlace: boolean): number {
        let s = this;
        //console.log("addUIItem dataIndex=" + dataIndex + ", topPlace=" + topPlace + ", _dataIndexEnd=" + this._dataIndexEnd + ", _dataIndexBegin=" + this._dataIndexBegin);
        if (!s._itemDatas || dataIndex < 0 || dataIndex >= s._itemDatas.length) {
            return 0;
        }
        var indexAdd: number = 0;
        //console.log("addUIItem 000");
        //if (this._dataIndexToRender["" + dataIndex]) return indexAdd;
        //console.log("addUIItem 1111");
        var yPos: number = 0;
        var xPos: number = 0;
        while (indexAdd < s._line) {
            if (!s._itemDatas || dataIndex < 0 || dataIndex >= s._itemDatas.length) break;
            var displayItemUI: DefaultRenderer = ObjectPool.getByClass(s._itemRenderer, "list_" + s.name);
            //初始化显示项
            try {
                displayItemUI.data = s._itemDatas[dataIndex];//给显示项绑定数据
                displayItemUI.dataIndex = dataIndex;//数据项下标
                displayItemUI.list = s;//给显示项绑定所属列表
                displayItemUI.validateNow();
            } catch (e) {
            }

            if (s._autoSize) {
                if (s._direction == Style.VERTICAL) {
                    displayItemUI.width = (s._itemContainer.width - (s._line - 1) * s._gap) / s._line;
                } else {
                    displayItemUI.height = (s._itemContainer.height - (s._line - 1) * s._gap) / s._line;
                }
            }

            if (s._direction == Style.VERTICAL) {
                xPos = (displayItemUI.width + s._lineGap) * indexAdd;
                let child:Sprite;
                if (s._itemContainer.numChildren > 0 && indexAdd == 0) {
                    if (topPlace) {
                        child = <Sprite>s._itemContainer.getChildAt(0);
                        yPos = child.y;
                        yPos -= (s._gap + displayItemUI.height);
                        //console.log("000=" + yPos + ", indexAdd=" + indexAdd);
                    } else {
                        child = <Sprite>s._itemContainer.getChildAt(s._itemContainer.numChildren - 1);
                        yPos = child.y;
                        yPos += (s._gap + child.height) * (indexAdd + 1);
                        //console.log("111=" + yPos + ", indexAdd=" + indexAdd);
                    }
                }
                if (yPos > s._itemContainer.height || yPos < -displayItemUI.height) {
                    s.removeRender(displayItemUI);
                    return indexAdd;
                }
                displayItemUI.x = xPos;
                displayItemUI.y = yPos;
            } else {
                yPos = (displayItemUI.height + s._lineGap) * indexAdd;
                //console.log("yPos=" + yPos + ", indexAdd=" + indexAdd);
                let child:Sprite;
                if (s._itemContainer.numChildren > 0 && indexAdd == 0) {
                    if (topPlace) {
                        child = <Sprite>s._itemContainer.getChildAt(0);
                        xPos = child.x;
                        xPos = xPos - (s._gap + displayItemUI.width);
                        //console.log("000=" + xPos + ", indexAdd=" + indexAdd);
                    } else {
                        child = <Sprite>s._itemContainer.getChildAt(s._itemContainer.numChildren - 1);
                        xPos = child.x;
                        xPos += (s._gap + child.width) * (indexAdd + 1);
                        //console.log("111=" + xPos + ", indexAdd=" + indexAdd);
                    }
                }
                if (xPos > s._itemContainer.width || xPos < - displayItemUI.width) {
                    s.removeRender(displayItemUI);
                    return indexAdd;
                }
                displayItemUI.x = xPos;
                displayItemUI.y = yPos;
            }

            //往容器中添加显示项
            if (topPlace) {
                s._itemContainer.addChildAt(displayItemUI, 0);
            } else {
                s._itemContainer.addChild(displayItemUI);
            }

            s._dataIndexToRender["" + dataIndex] = displayItemUI;
            indexAdd++;
            //console.log("addUIItem indexAdd=" + indexAdd + ", dataIndex=" + dataIndex + ", x=" + xPos + ", y=" + yPos + ", _dataIndexEnd=" + this._dataIndexEnd + ", _dataIndexBegin=" + this._dataIndexBegin);
            dataIndex++;
        }

        //已经到底,没有数据了
        if (dataIndex >= s._itemDatas.length && indexAdd > 0) {
            //console.log("list.data.end.call");
            if (s._data_end_func_call) s._data_end_func_call.call(s._data_end_func_this);
        }
        return indexAdd;
    }

    private initList() {
        if (this._data && this._data instanceof Array && this._data.length > 0 && !this._itemDatas) {
            this._itemDatas = null;
            this._dataIndexToRender = {};
            this.setItemContainerSize();
            //清空显示
            var displayItemUI: Sprite = null;
            while (this._itemContainer.numChildren > 0) {
                displayItemUI = <Sprite>this._itemContainer.removeChildAt(0);
                if (displayItemUI instanceof this._itemRenderer) {
                    this.removeRender(displayItemUI);
                }
            }

            //进行首次填充
            this._itemDatas = <Array<any>>this._data;
            //console.log("set data.length=" + this._itemDatas.length + ", data=" + this._itemDatas);
            if (this._itemDatas.length == 0) return;
            this._dataIndexBegin = 0;
            var placeValue: number = 0;//占据的位置
            var addNum: number = this.addUIItem(this._dataIndexBegin, false);
            this._dataIndexEnd = addNum;
            while (addNum != 0 && this._dataIndexEnd < this._itemDatas.length) {
                addNum = this.addUIItem(this._dataIndexEnd, false);
                this._dataIndexEnd += addNum;
                //console.log("dataIndexEnd=" + this._dataIndexEnd + ", addNum=" + addNum);
            }
            this._dataIndexEnd--;//起始是从0开始,减去一个下标
            //console.log("setData dataIndexBegin=" + this._dataIndexBegin + ", dataIndexEnd=" + this._dataIndexEnd)
        }
    }

    public set data(value: any) {
        this._data = value;
    }

    /**
     * 追加滚动数据
     * @param value
     */
    public append(datas: Array<any>): void {
        if (datas) {
            this._itemDatas = this._itemDatas.concat(datas);
        }
    }

    /**
     * Draws the visual ui of the component.
     */
    public draw(): void {
        super.draw();
        if (this.width == 0 || this.height == 0) return;
        //this.setItemContainerSize();
        this.initList();
    }

    private setItemContainerSize(): void {
        this._itemContainer.width = this.width - this._marginLeft - this._marginRight;
        this._itemContainer.height = this.height - this._marginTop - this._marginBottom;
        this._itemContainer.x = this._marginLeft;
        this._itemContainer.y = this._marginTop;
        this._itemContainer.scrollRect.width = this._itemContainer.width;
        this._itemContainer.scrollRect.height = this._itemContainer.height;
    }

    public setHorizontalLayout() {
        this.layout = Style.HORIZONTAL;
    }

    public setVerticalLayout() {
        this.layout = Style.VERTICAL;
    }

    public set layout(direct: string) {
        this._direction = direct;
        this.invalidate();
    }
    /**
     * 设置列表布局：水平和竖直
     */
    public get layout(): string {
        return this._direction;
    }

    /**
     * 设置当前选择项
     */
    public set selected(item: any) {
        //console.log("selectedItem item=" + item)
        var sp: Sprite = null;
        this._selected = item;
        for (var i: number = 0; i < this._itemContainer.numChildren; i++) {
            sp = <Sprite>this._itemContainer.getChildAt(i);
            if (sp["selected"]) sp["selected"] = false;
            try {
                if (sp["_data"] == item) {
                    sp["selected"] = true;
                    this.dispatchEventWith(BasicUIEvent.ITEM_SELECTED, false, { item: sp }, false);
                }
            } catch (e) {
            }
        }
    }
    public get selected(): any {
        return this._selected;
    }

    /**
     * 获取选择对象的index
     * @returns {number}
     */
    public get selectedIndex(): number {
        if (this._selected) {
            return this._data.indexOf(this._selected)
        }
        return -1
    }

    public get itemRenderer(): any {
        return this._itemRenderer;
    }
    /**
     * 设置itemRenderer
     * @param value
     */
    public set itemRenderer(value: any) {
        if (this._itemRenderer != value) {
            this._itemRenderer = value;
            this.invalidate();
        }
    }

    // public get autoSize(): boolean {
    //     return this._autoSize;
    // }
    // /**
    //  * 设置自动大小
    //  * @param value
    //  */
    // public set autoSize(value: boolean) {
    //     if (this._autoSize != value) {
    //         this._autoSize = value;
    //         this.invalidate();
    //     }
    // }

    public get marginTop(): number {
        return this._marginTop;
    }
    /**
     * 设置顶边距
     * @param value
     */
    public set marginTop(value: number) {
        if (this._marginTop != value) {
            this._marginTop = value;
            this.invalidate();
        }
    }

    public get marginBottom(): number {
        return this._marginBottom;
    }
    /**
     * 设置底边距
     * @param value
     */
    public set marginBottom(value: number) {
        if (this._marginBottom != value) {
            this._marginBottom = value;
            this.invalidate();
        }
    }

    public get marginLeft(): number {
        return this._marginLeft;
    }
    /**
     * 设置左边距
     * @param value
     */
    public set marginLeft(value: number) {
        this._marginLeft = value;
        this.invalidate();
    }
    public get marginRight(): number {
        return this._marginRight;
    }

    /**
     * 设置右边距
     * @param value
     */
    public set marginRight(value: number) {
        if (this._marginRight = value) {
            this._marginRight = value;
            this.invalidate();
        }
    }

    public get gap(): number {
        return this._gap;
    }
    /**
     * 设置item render的间距
     */
    public set gap(value: number) {
        this._gap = value;
        this.invalidate();
    }

    public get line(): number {
        return this._line;
    }
    /**
     * 设置render的排数,默认是1
     */
    public set line(value: number) {
        this._line = value;
        if (this._line < 1) this._line = 1;
        this.invalidate();
    }

    public get lineGap(): number {
        return this._lineGap;
    }
    /**
     * 设置render的排间距,默认是0
     */
    public set lineGap(value: number) {
        this._lineGap = value;
        if (this._lineGap < 0) this._lineGap = 0;
        this.invalidate();
    }

    /**
     * 设置无滚动元素的时候,禁止背景滚动
     */
    public set fixed(value: boolean) {
        if (this._fixed != value) {
            this._fixed = value;
            this.invalidate();
        }
    }
    public get fixed(): boolean {
        return this._fixed;
    }

    /**
     * 设置滚动数据结束的通知
     * @param func
     * @param thisObj
     */
    public setDataEndCall(func: any, thisObj: any): void {
        this._data_end_func_call = func;
        this._data_end_func_this = thisObj;
    }
}