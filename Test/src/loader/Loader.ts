import { HttpLoader } from "./HttpLoader";
import { ResourceItem } from "./ResLoader";

export class Loader extends Laya.EventDispatcher  {
	protected static instance: Loader;
	// public loadInfo:ResourceItem.LoadInfo;
	// protected requestList:HttpLoader[] = [];
	// protected waitList:HttpLoader[] = [];
	// protected maxRequest:number = 5;
	protected constructor() {
		super();
	}

	public static getInstance() {
		if (!Loader.instance) Loader.instance = new Loader;
		return Loader.instance;
	}

	public load(url: string, data: any = null, loadInfo: ResourceItem.LoadInfo, method: string = "GET", responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text" = null, withCredentials: boolean = false, headerObj: any = null): HttpLoader {
		let s = this;
		let obj = headerObj ? headerObj : {};
		let params = data ? s.formatParams(data) : null;
		let _url = url;
		if (method.toLowerCase() === "get") {
			if (params) {
				if (url.lastIndexOf("?") != (url.length - 1)) _url += "?";
				_url += params;
				params = null;
			}
		} else {
			obj["Content-type"] = "application/x-www-form-urlencoded";
		}
		let httpLoader = new HttpLoader;
		httpLoader.setCallBackFun(s.loadFinishCall, s);
		loadInfo.loader = httpLoader;
		httpLoader.loadInfo = loadInfo;
		httpLoader.open(_url, method);
		httpLoader.withCredentials = withCredentials;
		httpLoader.responseType = responseType;
		httpLoader.headerObj = obj;
		httpLoader.send(params);
		return httpLoader;
	}

	/**
	 * 格式化参数
	 */
	protected formatParams(params) {
		if (!params) return null;
		return Object
			.keys(params)
			.map(function (key) {
				return key + "=" + params[key]
			})
			.join("&")
	}

	/**
	 * 每个请求完成(包括异常)的回调，
	 * target参数 返回请求本身
	 */
	protected loadFinishCall(target: HttpLoader) {
		let s = this;
		if (target.loadInfo && target.loadInfo.callBack) {
			target.loadInfo.callBack.call(target.loadInfo.funObj, target.loadInfo);
		}
		// if(target.extraData && target.extraData.callFun) {
		// 	target.extraData.callFun.call(target.extraData.funObj, target);
		// }
		//console.log(target.response);
	}
}
