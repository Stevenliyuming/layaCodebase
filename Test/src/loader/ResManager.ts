module codeBase {
    /**
     * 对config文件下载进行统一调度,加强RES下载的及时性,确保成功
     */
    export class ResManager {
        /**
         *  要下载的group列表
         */
        private static _res_group_arr: Array<string> = [];
        /**
         * 已添加下载的group列表
         */
        private static _res_group_loading_arr: Array<string> = [];
        /**
         * group完成的监听列表,key->[{func, thisObj}]
         */
        private static _res_group_listener: any = {};
        /**
         * group的监听key列表
         */
        private static _res_group_listener_name: Array<string> = [];
        /**
         * group complete的通知是否已经添加
         */
        private static _res_group_listener_add: boolean = false;
        private static _res_hb_rate: number = 30;
        private static config_load_listener: {
            configUrl: string,
            root: string,
            complete: Function,
            thisObj: any,
            loadError: Function,
            thisObj2: any
        }[] = [];

        /**
         * 下载config文件
         * @param url config文件路径
         * @param func group下载完成的通知
         * @param funcThis
         * @param groupNames
         */
        public static loadConfig(url: string, root: string = "resource/", complete: Function = null, thisObject: any = null, loadError: Function = null, thisObject2: any = null): void {
            ResManager.config_load_listener.push({ configUrl: url, root: root, complete: complete, thisObj: thisObject, loadError: loadError, thisObj2: thisObject2 });
            RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, ResManager.onConfigComplete, ResManager);
            RES.addEventListener(RES.ResourceEvent.CONFIG_LOAD_ERROR, ResManager.onConfigLoadError, ResManager);
            RES.loadConfig(url, root);
        }

        /**
         * 资源配置加载完成
         */
        private static onConfigComplete(event: egret.Event) {
            if (ResManager.config_load_listener.length > 0) {
                for (let i = 0; i < ResManager.config_load_listener.length; ++i) {
                    if (ResManager.config_load_listener[i].complete) {
                        ResManager.config_load_listener[i].complete.call(ResManager.config_load_listener[i].thisObj, ResManager.config_load_listener[i].configUrl);
                    }
                }
                ResManager.config_load_listener.length = 0;
            }
            ResManager.onCheckLoadGroup();
        }

        /**
         * 资源配置加载错误
         */
        private static onConfigLoadError(event: egret.Event) {
            if (ResManager.config_load_listener.length > 0) {
                for (let i = 0; i < ResManager.config_load_listener.length; ++i) {
                    if (ResManager.config_load_listener[i].loadError) {
                        ResManager.config_load_listener[i].loadError.call(ResManager.config_load_listener[i].thisObj2, ResManager.config_load_listener[i].configUrl);
                    }
                }
                ResManager.config_load_listener.length = 0;
            }
            console.log("CONFIG_LOAD_ERROR");
        }

        /**
         * 对group组进行检测加载
         * @param groupNames
         */
        public static loadGroups(groupNames: Array<string>, listener: any = null, thisObject: any = null, loadingNow: boolean = false): void {
            if (groupNames == null || groupNames.length == 0) return;
            for (var i: number = 0; i < groupNames.length; i++) {
                ResManager.loadGroup(groupNames[i], listener, thisObject, loadingNow);
            }
        }
        /**
         * 对单个group进行检测加载
         * @param groupName
         */
        public static loadGroup(groupName: string, listener: any = null, thisObject: any = null, loadingNow: boolean = false): void {
            if (!StringUtil.isUsage(groupName)) return;
            //Debug.log = "@RES_M group add 000 name=" + groupName;
            ResManager.addGroupCompleteListener(groupName, listener, thisObject, loadingNow);
        }

        /**
         * 添加group完成的监听
         * @param listener
         * @param thisObject
         */
        public static addGroupCompleteListener(groupName: string, listener: any, thisObject: any, loadingNow: boolean = false): void {
            if (!StringUtil.isUsage(groupName)) return;
            if (ResManager._res_group_arr.indexOf(groupName) < 0) {
                if (loadingNow) {
                    ResManager._res_group_arr.unshift(groupName);
                } else {
                    ResManager._res_group_arr.push(groupName);
                }
                ResManager.checkAddGroupCompleteListener();
                HeartBeat.addListener(ResManager, ResManager.onCheckLoadGroup, ResManager._res_hb_rate);
            }
            var funcArr: Array<any> = [];
            if (ResManager._res_group_listener_name.indexOf(groupName) >= 0) {
                funcArr = ResManager._res_group_listener[groupName];
            } else {
                ResManager._res_group_listener_name.push(groupName);
                ResManager._res_group_listener[groupName] = funcArr;
            }

            if (listener != null || thisObject != null) {
                for (var i: number = 0; i < funcArr.length; i++) {
                    if (funcArr[i].func == listener && funcArr[i].thisObj == thisObject) {//已经添加过监听
                        return;
                    }
                }
                funcArr.push({ func: listener, thisObj: thisObject });
            }
        }

        //检测是否添加过RES的Group完成通知
        private static checkAddGroupCompleteListener(): void {
            //Debug.log = "@RES_M group add 000 GroupCompleteListener";
            if (!ResManager._res_group_listener_add) {
                //Debug.log = "@RES_M group add 111 GroupCompleteListener";
                ResManager._res_group_listener_add = true;
                RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, ResManager.onLoadGroupComplete, ResManager);
                RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, ResManager.onLoadGroupError, ResManager);
            }
        }

        /**
         * RES的group下载完成
         * @param event
         */
        private static onLoadGroupComplete(event: RES.ResourceEvent): void {
            var groupName: string = null;
            var index: number;
            //Debug.log = "@RES_M group complete 000";
            //var resItems: Array<RES.ResourceItem> = null;
            for (var i: number = ResManager._res_group_arr.length - 1; i >= 0; i--) {
                //console.log("@Main onConfigComplete resItems" + JSON.stringify(resItems));
                groupName = ResManager._res_group_arr[i];
                if (!StringUtil.isUsage(groupName)) {
                    ResManager._res_group_arr.splice(i, 1);
                    continue;
                }
                if (RES.isGroupLoaded(groupName)) {
                    index = ResManager._res_group_loading_arr.indexOf(groupName);
                    if (index >= 0) {
                        ResManager._res_group_loading_arr.splice(index, 1);
                    }
                    //Debug.log = "@RES_M group complete 111 name=" + groupName;
                    ResManager._res_group_arr.splice(ResManager._res_group_arr.indexOf(groupName), 1);
                    //监听触发
                    if (ResManager._res_group_listener[groupName]) {
                        //Debug.log = "@RES_M group complete 222 name=" + groupName;
                        var funcArr: Array<any> = ResManager._res_group_listener[groupName];
                        for (var i: number = 0; i < funcArr.length; i++) {
                            if (funcArr[i] && funcArr[i].func) funcArr[i].func.call(funcArr[i].thisObj, event);
                        }
                        ResManager.removeGroupCompleteListener(groupName);
                    }
                }
            }

            if (ResManager._res_group_arr.length == 0) {
                //Debug.log = "@RES_M group complete 333 remove listener";
                HeartBeat.removeListener(ResManager, ResManager.onCheckLoadGroup);
                if (ResManager._res_group_listener_add) {
                    ResManager._res_group_listener_add = false;
                    RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, ResManager.onLoadGroupComplete, ResManager);
                    RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, ResManager.onLoadGroupError, ResManager);
                }
            }
            //Debug.log = "@RES_M group complete 444 group.length=" + ResManager._res_group_arr.length + ", v=" + ResManager._res_group_arr;
        }

        /**
         * load group错误
         * @param event
         */
        private static onLoadGroupError(event: RES.ResourceEvent): void {
            if (event && StringUtil.isUsage(event.groupName)) {
                let index = ResManager._res_group_loading_arr.indexOf(event.groupName);
                if (index >= 0) ResManager._res_group_loading_arr.splice(index, 1);

                // index = ResManager._res_group_arr.indexOf(event.groupName);
                // if (index >= 0) ResManager._res_group_arr.splice(index, 1);
                //console.log("onLoadGroupError=" + event.groupName);
            }
        }

        /**
         * 检测group是否可以开始下载
         */
        private static onCheckLoadGroup(): void {
            //Debug.log = "@RES_M group 000 checkload onCheckLoadGroup=" + ResManager._res_group_arr;
            var groupName: string = null;
            for (var i: number = 0; i < ResManager._res_group_arr.length; i++) {
                //console.log("@Main onConfigComplete resItems" + JSON.stringify(resItems));
                groupName = ResManager._res_group_arr[i];
                if (!StringUtil.isUsage(groupName)) {
                    ResManager._res_group_arr.splice(i, 1);
                    continue;
                }

                //添加到加载队列
                if (ResManager._res_group_loading_arr.indexOf(groupName) < 0) {
                    ResManager._res_group_loading_arr.push(groupName);
                    //Debug.log = "@RES_M group checkload 111 name=" + groupName;
                    RES.loadGroup(groupName);
                }
            }
        }

        /**
         * 移除group完成的监听
         * @param listener
         * @param thisObject
         */
        public static removeGroupCompleteListener(groupName: string): void {
            //Debug.log = "@RES_M group removel 000 name=" + groupName;
            var index = ResManager._res_group_listener_name.indexOf(groupName);
            if (index >= 0) {
                //Debug.log = "@RES_M group removel 111 name=" + groupName;
                delete ResManager._res_group_listener[groupName];
                ResManager._res_group_listener_name.splice(index, 1);
                if (ResManager._res_group_listener_name.length == 0) {
                    //Debug.log = "@RES_M group removel 222 name=" + groupName;
                    RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, ResManager.onLoadGroupComplete, ResManager);
                    RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, ResManager.onLoadGroupError, ResManager);
                    ResManager._res_group_listener_add = false;
                }
            }
        }
    }
}