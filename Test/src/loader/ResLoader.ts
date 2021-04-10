import { Base64Util } from "../util/Base64Util";
import { ByteArray, Endian } from "../util/ByteArray";
import { HttpLoader } from "./HttpLoader";
import { Loader } from "./Loader";

export namespace ResourceItem {
	/**
	 * EXML file.
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language en_US
	 */
	export const TYPE_EXML: string = "exml";
	/**
	 * XML 文件。
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_XML: string = "xml";
	/**
	 * Picture file.
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language en_US
	 */
	/**
	 * 图片文件。
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_IMAGE: string = "image";
	/**
	 * Binary file.
	 * @version Egret 5.2
	 * @platform Web
	 * @language en_US
	 */
	/**
	 * 二进制文件。
	 * @version Egret 5.2
	 * @platform Web
	 * @language zh_CN
	 */
	export const TYPE_BIN: string = "bin";
	/**
	 * Text file.
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language en_US
	 */
	/**
	 * 文本文件。
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_TEXT: string = "text";
	/**
	 * JSON file.
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language en_US
	 */
	/**
	 * JSON 文件。
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_JSON: string = "json";
	/**
	 * SpriteSheet file.
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language en_US
	 */
	/**
	 * SpriteSheet 文件。
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_SHEET: string = "sheet";
	/**
	 * BitmapTextSpriteSheet file.
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language en_US
	 */
	/**
	 * BitmapTextSpriteSheet 文件。
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_FONT: string = "font";
	/**
	 * Sound file.
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language en_US
	 */
	/**
	 * 声音文件。
	 * @version Egret 5.2
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_SOUND: string = "sound";
	/**
	 * TTF file.
	 * @version Egret 5.3
	 * @platform Web,Native
	 * @language en_US
	 */
	/**
	 * TTF字体文件。
	 * @version Egret 5.3
	 * @platform Web,Native
	 * @language zh_CN
	 */
	export const TYPE_TTF: string = "ttf";

	/**
	 * 动画图集文件
	 */
	export const TYPE_ATLAS: string = "atlas";

	/**
	 * 打包资源文件
	 */
	export const TYPE_PKG: string = "pkg";

	/**资源对象，包含资源以及资源的引用计数，引用计数为0时，资源会被回收*/
	export class ResObject {
		constructor() {
			this._count = 0;
			this.res = null;
			this.inPool = false;
		}
		type: string;
		/**引用计数，当引用计数为0时，资源会被释放,如非必要，勿修改此值*/
		private _count;
		/**资源，如Texture、Sound、json对象、string字符串，直接调取并不增加应用计数count，不需调用relRes释放，如需增加计数，请调用getRes，释放请调用relRes*/
		res: any;
		/**资源加载的路径*/
		pathKey: string;
		/**附属资源*/
		param: any;
		/**原始数据 */
		buffer: any;
		inPool: boolean;
		/**获取资源时，请尽量使用getRes，以便引用计数*/
		getRes() {
			let s = this;
			s._count += 1;
			return s.res;
		}
		/**资源释放时，请把引用设置为null，避免重复释放*/
		relRes() {
			let s = this;
			s._count -= 1;
			if (s._count <= 0) {
				console.log("重复释放资源：" + s.pathKey);
			}
		}
		clear(gc?: boolean) {
			let s = this;
			if (s.type == ResourceItem.TYPE_IMAGE) {
				(<Laya.Texture>s.res).destroy();
			} else if (s.type == ResourceItem.TYPE_SOUND) {
				(<Laya.Sound>s.res).dispose();
			}
			if (s.param && s.param.subRes) {
				let len = s.param.subRes.length;
				while (--len > -1) {
					s.param.subRes[len].clear();
				}
			}
			s.res = null;
			s.inPool = true;
			s._count = 0;
			s.param = null;
			s.pathKey = null;
		}
		/**引用数量*/
		get count() {
			return this._count;
		};
		private static _pool;
		/**
		 * 获得一个资源实例
		 */
		static getResObject(): ResObject {
			let obj: ResObject = new ResObject;
			return obj;
		}
	}

	/**资源加载信息 */
	export class LoadInfo {
		url: string = null;
		callBack: Function = null;
		funObj: any = null;
		responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text" = "";
		resTag: string = null;
		loader: HttpLoader = null;
		resGroup: ResGroup = null;
		buffer: any;
	}

	export class ResGroup {
		groupName: string = null
		resNum: number = 0;
		status: number = 0;//0 未加载完成 1 加载完成
		loadInfoArray: LoadInfo[] = [];
		callBack: Function = null;
		funObj: any = null;
	}

	export class WarpMode {
		public static Clamp: number = 1;
		public static Repeat: number = 0;
	}

}

export class ResLoader extends Loader {
	protected resDict: any = {};
	protected loadPool: ResourceItem.LoadInfo[] = [];
	protected waitPool: ResourceItem.LoadInfo[] = [];
	protected _maxLoadNum: number = 5;
	protected resGroupPool: any = {};
	protected static loadHashCode: number = 1;
	protected static inst: ResLoader;
	public constructor() {
		super();
	}

	public static getInstance(): ResLoader {
		if (!ResLoader.inst) ResLoader.inst = new ResLoader;
		return ResLoader.inst;
	}

	/**加载资源 
	 * url 资源路径
	 * callBack 加载结束回调
	 * funObj 回调函数指向
	 * resTag 资源标签 传入此标签调用方可以确认是哪个资源加载成功
	*/
	public loadRes(url: string, callBack: Function = null, funObj: any = null, responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text" = "", resTag: string = null) {
		let s = this;
		ResLoader.loadHashCode += 1;
		let loadInfo: ResourceItem.LoadInfo = s.checkLoadInfo(url);
		//检测是否已经在加载队列中
		if (!loadInfo) {
			//检测加载队列是否已满
			if (s.loadPool.length < s._maxLoadNum) {
				loadInfo = s.resLoad(url, null, callBack, funObj, "get", responseType, false, null);
				s.loadPool.push(loadInfo);
			} else {
				s.waitPool.push(loadInfo);
			}
		}
	}

	protected checkLoadInfo(url: string): ResourceItem.LoadInfo {
		let s = this;
		if (s.loadPool.length > 0) {
			for (let i = 0; i < s.loadPool.length; ++i) {
				let item = s.loadPool[i];
				if (item.url === url) {
					return item;
				}
			}
		}

		if (s.waitPool.length > 0) {
			for (let i = 0; i < s.waitPool.length; ++i) {
				let item = s.waitPool[i];
				if (item.url === url) {
					return item;
				}
			}
		}

		return null;
	}

	/**设置最大加载请求数 */
	public set maxLoadNum(value) {
		this.maxLoadNum = value;
	}

	/**获取最大加载请求数 */
	public get maxLoadNum() {
		return this.maxLoadNum;
	}

	/**加载资源 */
	public resLoad(url: string, data: any = null, callBack: Function, funObj: any, method: string = "GET", responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text" = null, withCredentials: boolean = false, headerObj: any = null) {
		let s = this;
		let loadInfo = new ResourceItem.LoadInfo;
		loadInfo.url = url;
		loadInfo.callBack = callBack;
		loadInfo.funObj = funObj;
		loadInfo.responseType = responseType;
		//loadInfo.resTag = resTag;
		super.load(url, data, loadInfo, method, responseType, withCredentials);
		return loadInfo;
	}

	/**加载资源 */
	public resGroupLoad(urlGroup: string[] = [], groupName: string, data: any = null, callBack: Function, funObj: any, method: string = "GET", responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text" = "", withCredentials: boolean = false, headerObj: any = null) {
		let s = this;
		if (s.resGroupPool[groupName]) {
			console.log(groupName + ":资源组已经在加载队列中");
			return;
		}
		let resGroup = new ResourceItem.ResGroup;
		resGroup.groupName = groupName;
		resGroup.callBack = callBack;
		resGroup.funObj = funObj;
		s.resGroupPool[groupName] = resGroup;
		for (let i = 0; i < urlGroup.length; ++i) {
			if (urlGroup[i] == "") continue;
			let resType = s.typeSelector(urlGroup[i]);
			let respType = responseType;
			if (resType == ResourceItem.TYPE_IMAGE || resType == ResourceItem.TYPE_SOUND || resType == ResourceItem.TYPE_BIN) {
				respType = "arraybuffer";
			}
			let loadInfo = new ResourceItem.LoadInfo;
			loadInfo.url = urlGroup[i];
			loadInfo.callBack = callBack;
			loadInfo.funObj = funObj;
			loadInfo.responseType = respType;
			//loadInfo.resTag = resTag;
			//组资源加载
			loadInfo.resGroup = resGroup;
			resGroup.loadInfoArray.push(loadInfo);
			resGroup.resNum += 1;
			super.load(urlGroup[i], data, loadInfo, method, respType, withCredentials);
		}
	}

	protected loadFinishCall(target: HttpLoader) {
		let s = this;
		let loadInfo = target.loadInfo;
		let resPath = loadInfo.url;
		// console.log(resPath);
		let type = s.typeSelector(resPath);
		let decodeFun: Function = s.decodeFunction(type);
		if (decodeFun) {
			decodeFun.call(s, loadInfo);
		} else {
			console.log("无法解析资源类型：" + resPath);
		}
	}

	/**解析打包资源 */
	private decodePackageRes(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let resGroup = new ResourceItem.ResGroup;
		resGroup.groupName = loadInfo.url;
		resGroup.callBack = loadInfo.callBack;
		resGroup.funObj = loadInfo.funObj;
		s.resGroupPool[resGroup.groupName] = resGroup;

		let res: ArrayBuffer = loadInfo.loader.response;
		let resBuffer: ByteArray = new ByteArray(res);
		resBuffer.position = 0;
		resBuffer.endian = Endian.LITTLE_ENDIAN;
		//打包的文件个数
		let fileNum = resBuffer.readUnsignedShort();
		resGroup.resNum = fileNum;
		for (let i = 0; i < fileNum; ++i) {
			resBuffer.endian = Endian.LITTLE_ENDIAN;
			//文件路径长度
			let pathLength: number = resBuffer.readUnsignedShort();
			//文件内容长度
			let fileLength: number = resBuffer.readUnsignedInt();

			//读取文件路径
			resBuffer.endian = Endian.BIG_ENDIAN;
			let fileLocalPath: string = resBuffer.readUTFBytes(pathLength);
			fileLocalPath = fileLocalPath.split("\\").join("/");
			console.log(fileLocalPath);

			//读取文件内容
			let fileByteArray: ByteArray = new ByteArray;
			resBuffer.readBytes(fileByteArray, 0, fileLength);

			//单个文件信息
			let loadInfo2 = new ResourceItem.LoadInfo;
			loadInfo2.url = fileLocalPath;
			loadInfo2.callBack = loadInfo.callBack;
			loadInfo2.funObj = loadInfo.funObj;
			loadInfo2.resGroup = resGroup;
			loadInfo2.loader = new HttpLoader;
			//文件类型
			let respType;
			let resType = s.typeSelector(fileLocalPath);
			if (resType == ResourceItem.TYPE_IMAGE || resType == ResourceItem.TYPE_SOUND || resType == ResourceItem.TYPE_BIN) {
				respType = "arraybuffer";
				loadInfo2.buffer = fileByteArray.buffer;
			} else {
				loadInfo2.buffer = fileByteArray.readUTFBytes(fileLength);
			}
			loadInfo2.responseType = respType;

			//在资源组中添加单个资源
			resGroup.loadInfoArray.push(loadInfo2);
			// resGroup.resNum += 1;

			let decodeFun: Function = s.decodeFunction(resType);
			if (decodeFun) {
				decodeFun.call(s, loadInfo2);
			} else {
				console.log("无法解析资源类型：" + fileLocalPath);
			}
		}

		// let resGroup = new ResourceItem.ResGroup;
		// resGroup.groupName = loadInfo.url;
		// resGroup.callBack = loadInfo.callBack;
		// resGroup.funObj = loadInfo.funObj;
		// s.resGroupPool[resGroup.groupName] = resGroup;

		// let res: ArrayBuffer = loadInfo.loader.response;
		// let resBuffer: Laya.Byte = new Laya.Byte(res);
		// resBuffer.pos = 0;
		// resBuffer.endian = Laya.Byte.LITTLE_ENDIAN;
		// //打包的文件个数
		// let fileNum = resBuffer.readUint16();// .readUnsignedShort();
		// resGroup.resNum = fileNum;
		// for (let i = 0; i < fileNum; ++i) {
		// 	resBuffer.endian = Laya.Byte.LITTLE_ENDIAN;
		// 	//文件路径长度
		// 	let pathLength: number = resBuffer.readUint16();//readUnsignedShort();
		// 	//文件内容长度
		// 	let fileLength: number = resBuffer.readUint32();//readUnsignedInt();

		// 	//读取文件路径
		// 	resBuffer.endian = Laya.Byte.BIG_ENDIAN;
		// 	let fileLocalPath: string = resBuffer.readUTFBytes(pathLength);
		// 	console.log(fileLocalPath);

		// 	//读取文件内容
		// 	let fileByteArray: Laya.Byte = new Laya.Byte(resBuffer.readUint8Array(resBuffer.pos, fileLength));
		// 	//resBuffer.readBytes(fileByteArray, 0, fileLength);

		// 	//单个文件信息
		// 	let loadInfo2 = new ResourceItem.LoadInfo;
		// 	loadInfo2.url = fileLocalPath;
		// 	loadInfo2.callBack = loadInfo.callBack;
		// 	loadInfo2.funObj = loadInfo.funObj;
		// 	loadInfo2.resGroup = resGroup;
		// 	loadInfo2.loader = new HttpLoader;
		// 	//文件类型
		// 	let respType;
		// 	let resType = s.typeSelector(fileLocalPath);
		// 	if (resType == ResourceItem.TYPE_IMAGE || resType == ResourceItem.TYPE_SOUND || resType == ResourceItem.TYPE_BIN) {
		// 		respType = "arraybuffer";
		// 		loadInfo2.buffer = fileByteArray.buffer;
		// 	} else {
		// 		loadInfo2.buffer = fileByteArray.readUTFBytes(fileLength);
		// 	}
		// 	loadInfo2.responseType = respType;

		// 	//在资源组中添加单个资源
		// 	resGroup.loadInfoArray.push(loadInfo2);
		// 	// resGroup.resNum += 1;

		// 	let decodeFun: Function = s.decodeFunction(resType);
		// 	if (decodeFun) {
		// 		decodeFun.call(s, loadInfo2);
		// 	} else {
		// 		console.log("无法解析资源类型：" + fileLocalPath);
		// 	}
		// }
	}

	/**
	 * 解析图片
	 */
	protected decodeIMAGE(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let data: ArrayBuffer = loadInfo.loader.response || loadInfo.buffer;
		s._loadHtmlImage("arraybuffer", data, s, (img) => {
			let tex = new Laya.Texture2D(img.width, img.height, 1, false, false);
			tex.wrapModeU = ResourceItem.WarpMode.Clamp;
			tex.wrapModeV = ResourceItem.WarpMode.Clamp;
			tex.loadImageSource(img, true);
			tex._setCreateURL(img.src);

			var res = new Laya.Texture(tex);
			res.url = loadInfo.url;
			let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
			obj.pathKey = loadInfo.url;
			obj.type = ResourceItem.TYPE_IMAGE;
			obj.res = res;
			obj.buffer = data;
			s.setRes(obj.pathKey, obj, loadInfo);
		});
		// let bitmapData: Laya.BitmapData = egret.BitmapData.create("arraybuffer", data, (bmp) => {
		// 	let res = new Laya.Texture;
		// 	res._setBitmapData(bmp);
		// 	let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
		// 	obj.pathKey = loadInfo.url;
		// 	obj.type = ResourceItem.TYPE_IMAGE;
		// 	obj.res = res;
		// 	obj.buffer = data;
		// 	s.setRes(obj.pathKey, obj, loadInfo);
		// });
	}

	_loadHtmlImage(type: string, data: any, onLoadCaller: any, onLoad: Function, onErrorCaller: any = null, onError: Function = null) {
		var image;
		function clear() {
			var img = image;
			img.onload = null;
			img.onerror = null;
			//delete Loader._imgCache[url];
		}
		var onerror = function () {
			clear();
			onError.call(onErrorCaller);
		};
		var onload = function () {
			clear();
			onLoad.call(onLoadCaller, image);
		};
		var base64 = "";
		if (type === "arraybuffer") {
			base64 = Base64Util.encode(data);
		}
		else {
			base64 = data;
		}
		var imageType = "image/png"; //default value
		if (base64.charAt(0) === '/') {
			imageType = "image/jpeg";
		}
		else if (base64.charAt(0) === 'R') {
			imageType = "image/gif";
		}
		else if (base64.charAt(0) === 'i') {
			imageType = "image/png";
		}
		image = new Image();
		image.src = "data:" + imageType + ";base64," + base64;
		image.crossOrigin = '*';
		// image = new Browser.window.Image();
		// image.crossOrigin = "";
		image.onload = onload;
		image.onerror = onerror;
		//image.src = url;
		//Loader._imgCache[url] = image;
	}

	/**
	 * 解析声音
	 */
	protected decodeSOUND(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let buff: ArrayBuffer = loadInfo.loader.response || loadInfo.buffer;
		s._loadSound(buff, loadInfo);

		// var sound: egret.Sound = new egret.Sound();
		// let _file = new File([buff], "");
		// let obj_url: string = window.URL.createObjectURL(_file);
		// sound.load(obj_url);
		// sound.once(egret.Event.COMPLETE, onAudioLoaded, s);
		// sound.once(egret.IOErrorEvent.IO_ERROR, onAudioLoaded, s);

		/**WebAudioSound解析方式 */
		// let buffer:ArrayBuffer = target.response;
		// var audioDecode = egret["web"].WebAudioDecode;
		// audioDecode.decodeArr.push({
		// 	"buffer": buffer,
		// 	"success": onAudioLoaded,
		// 	"fail": onAudioError,
		// 	"self": sound,
		// 	//"url": self.url
		// });
		// audioDecode.decodeAudios();

		// function onAudioLoaded() {
		// 	let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
		// 	obj.pathKey = loadInfo.url;
		// 	obj.type = ResourceItem.TYPE_SOUND;
		// 	obj.res = sound;
		// 	obj.buffer = buff;
		// 	s.setRes(obj.pathKey, obj, loadInfo);
		// }
		// function onAudioError() {
		// 	sound.dispatchEventWith(egret.IOErrorEvent.IO_ERROR);
		// 	console.log("声音解析失败：" + loadInfo.url);
		// 	URL.revokeObjectURL(obj_url);
		// 	obj_url = null;
		// }
	}

	_loadSound(buff:ArrayBuffer, loadInfo: ResourceItem.LoadInfo) {
		let _file = new File([buff], "");
		let obj_url: string = window.URL.createObjectURL(_file);
		var sound = (new Laya.SoundManager["_soundClass"]);
		var _this = this;
		sound.on(Laya.Event.COMPLETE, this, soundOnload);
		sound.on(Laya.Event.ERROR, this, soundOnErr);
		sound.load(obj_url);
		function soundOnload() {
			clear();
			let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
			obj.pathKey = loadInfo.url;
			obj.type = ResourceItem.TYPE_SOUND;
			obj.res = sound;
			obj.buffer = buff;
			_this.setRes(obj.pathKey, obj, loadInfo);
		}
		function soundOnErr() {
			clear();
			sound.dispose();
			_this.event(Laya.Event.ERROR, "Load sound failed");
		}
		function clear() {
			sound.offAll();
		}
	}

	/**
   * desc: base64对象转blob文件对象
   * @param base64  ：数据的base64对象
   * @param fileType  ：文件类型 mp3等;
   * @returns {Blob}：Blob文件对象
   */
	protected base64ToBlob(base64, fileType) {
		let typeHeader = 'data:application/' + fileType + ';base64,'; // 定义base64 头部文件类型
		let audioSrc = typeHeader + base64; // 拼接最终的base64
		let arr = audioSrc.split(',');
		let array = arr[0].match(/:(.*?);/);
		let mime = (array && array.length > 1 ? array[1] : fileType) || fileType;
		// 去掉url的头，并转化为byte
		let bytes = window.atob(arr[1]);
		// 处理异常,将ascii码小于0的转换为大于0
		let ab = new ArrayBuffer(bytes.length);
		// 生成视图（直接针对内存）：8位无符号整数，长度1个字节
		let ia = new Uint8Array(ab);
		for (let i = 0; i < bytes.length; i++) {
			ia[i] = bytes.charCodeAt(i);
		}
		return new Blob([ab], {
			type: mime
		});
	}

	/**
	 * 解析xml
	 */
	protected decodeXML(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let data: string = loadInfo.loader.response || loadInfo.buffer;
		let res = data;//egret.XML.parse(data);
		let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
		obj.pathKey = loadInfo.url;
		obj.type = ResourceItem.TYPE_XML;
		obj.res = res;
		obj.buffer = data;
		s.setRes(obj.pathKey, obj, loadInfo);
	}

	/**
	 * 解析json
	 */
	protected decodeJSON(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let data: string = loadInfo.loader.response || loadInfo.buffer;
		let res = JSON.parse(data);
		let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
		obj.pathKey = loadInfo.url;
		obj.type = ResourceItem.TYPE_JSON;
		obj.res = res;
		obj.buffer = data;
		s.setRes(obj.pathKey, obj, loadInfo);
	}

	/**
	 * 解析txt
	 */
	protected decodeTEXT(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let data: string = loadInfo.loader.response || loadInfo.buffer;
		//let res = JSON.parse(data);
		let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
		obj.pathKey = loadInfo.url;
		obj.type = ResourceItem.TYPE_TEXT;
		obj.res = data;
		obj.buffer = data;
		s.setRes(obj.pathKey, obj, loadInfo);
	}

	/**解析字体 */
	protected decodeFONT() {
		let s = this;

	}

	/**解析字节数据 */
	protected decodeBIN(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let res: ArrayBuffer = loadInfo.loader.response || loadInfo.buffer;
		let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
		obj.pathKey = loadInfo.url;
		obj.type = ResourceItem.TYPE_BIN;
		obj.res = res;
		obj.buffer = res;
		s.setRes(obj.pathKey, obj, loadInfo);
	}

	/**解析atlas图集数据 */
	protected decodeATLAS(loadInfo: ResourceItem.LoadInfo) {
		let s = this;
		let res: string = loadInfo.loader.response || loadInfo.buffer;
		let obj: ResourceItem.ResObject = ResourceItem.ResObject.getResObject();
		obj.pathKey = loadInfo.url;
		obj.type = ResourceItem.TYPE_ATLAS;
		obj.res = res;
		obj.buffer = res;
		s.setRes(obj.pathKey, obj, loadInfo);
	}

	/**解析帧动画 */
	protected decodeMovieClip(text: string) {
		let s = this;
		let mcData = JSON.parse(text);
		// let imagePath = mcData.file;
		// var mcTexture: Laya.Texture = s.getTexture(imagePath);
		// var mcDataFactory = new egret.MovieClipDataFactory(mcData, mcTexture);
	}

	/**设置加载资源 */
	protected setRes(url: string, res: any, loadInfo: ResourceItem.LoadInfo = null) {
		let s = this;
		if (s.resDict[url]) {
			(<ResourceItem.ResObject>s.resDict[url]).clear();
		}
		s.resDict[url] = res;

		/**资源加载完成回调 */
		if (loadInfo) {
			console.log("单个资源加载完成:" + loadInfo.url);
			if (loadInfo.resGroup) {
				loadInfo.resGroup.resNum -= 1;
				if (loadInfo.resGroup.resNum <= 0) {//组资源加载完毕
					console.log("组资源加载完成:" + loadInfo.resGroup.groupName);
					loadInfo.resGroup.status = 1;
					if (loadInfo.resGroup.callBack) {
						loadInfo.resGroup.callBack.call(loadInfo.resGroup.funObj, loadInfo.resGroup);
					}
				}
			} else {
				if (loadInfo && loadInfo.callBack) {//单个资源加载完毕
					loadInfo.callBack.call(loadInfo.funObj, loadInfo);
				}
			}
		}
	}

	/**
	 * 获取资源
	 */
	public getRes(key: string, aliasKey: string = null): any {
		var s = this;
		if (aliasKey === void 0) { aliasKey = null; }
		var res;
		if (aliasKey == null)
			res = s.resDict[key];
		else {
			var arr = void 0;
			key = aliasKey + "$" + key;
			res = s.resDict[key];
			if (res == null) {
				//var spriteSheet = void 0;
				var textureRes = void 0;
				/**图集资源 */
				textureRes = s.resDict[aliasKey];
				if (textureRes) {
					/**图集中的散图资源 */
					if (textureRes.param == null) {
						/**图集对应的json配置文件资源对象,需跟图集在同一个目录下 */
						var jsonRes = s.getRes(aliasKey.replace(".png", ".json"));
						if (jsonRes) {
							textureRes.param = { sheet: textureRes.res, json: jsonRes, subRes: [] };
							//spriteSheet = textureRes.param.sheet;
							/**json文件对象 */
							var data = jsonRes.res;
							var frames_1 = data.frames;
							// spriteSheet["$resourceInfo"] = r;
							for (var subkey in frames_1) {
								var config = frames_1[subkey];
								var texture = Laya.Texture.create(textureRes.res, config.x, config.y, config.w, config.h, config.offX, config.offY, config.sourceW, config.sourceH);//spriteSheet.createTexture(subkey, config.x, config.y, config.w, config.h, config.offX, config.offY, config.sourceW, config.sourceH);
								// if (config["scale9grid"]) {
								// 	var str = config["scale9grid"];
								// 	var list = str.split(",");
								// 	texture["scale9Grid"] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
								// }
								/**散图贴图 */
								var newRes = ResourceItem.ResObject.getResObject();
								newRes.res = texture;
								newRes.pathKey = aliasKey + "$" + subkey;
								newRes.type = ResourceItem.TYPE_IMAGE;
								textureRes.param.subRes.push(newRes);
								s.setRes(newRes.pathKey, newRes);
							}
						}
					}
				}
			}
			res = s.resDict[key];
		}
		return res;
	}

	/**
	 * 获取文本数据
	 */
	public getResData(key: string, alias: string = null) {
		let s = this;
	}

	public getResGroup(key: string): ResourceItem.ResObject[] {
		let s = this;
		let resGroup: ResourceItem.ResObject[] = [];
		if (key == null) {
			console.log("key为空");
			return resGroup;
		};
		let ind;
		for (let key2 in s.resDict) {
			ind = key2.indexOf(key);
			if (ind > -1) {
				resGroup.push(s.resDict[key2]);
			}
		}
		return resGroup;
	}

	protected getTexture(imageName: string) {
		let s = this;
		let tex: Laya.Texture = s.getRes(imageName).res;
		return tex;
	}

	protected typeSelector(path: string): string {
		const ext = path.substr(path.lastIndexOf(".") + 1);
		let type: string;
		switch (ext) {
			case ResourceItem.TYPE_XML:
			case ResourceItem.TYPE_JSON:
			case ResourceItem.TYPE_SHEET:
				type = ext;
				break;
			case "png":
			case "jpg":
			case "gif":
			case "jpeg":
			case "bmp":
				type = ResourceItem.TYPE_IMAGE;
				break;
			case "fnt":
				type = ResourceItem.TYPE_FONT;
				break;
			case "txt":
				type = ResourceItem.TYPE_TEXT;
				break;
			case "mp3":
			case "ogg":
			case "mpeg":
			case "wav":
			case "m4a":
			case "mp4":
			case "aiff":
			case "wma":
			case "mid":
				type = ResourceItem.TYPE_SOUND;
				break;
			case "mergeJson":
			case "zip":
			case "pvr":
				type = ext;
				break;
			case "ttf":
				type = ResourceItem.TYPE_TTF;
				break;
			case "atlas":
				type = ResourceItem.TYPE_ATLAS;
				break;
			case "pkg":
				type = ResourceItem.TYPE_PKG;
				break;
			default:
				type = ResourceItem.TYPE_BIN;
				break;
		}
		return type;
	}

	protected decodeFunction(type: string) {
		let s = this;
		let processorMap = {
			"image": s.decodeIMAGE,
			"json": s.decodeJSON,
			"text": s.decodeTEXT,
			"xml": s.decodeXML,
			//"sheet": s.decodeSHEET,
			"font": s.decodeJSON,
			"bin": s.decodeBIN,
			// "commonjs": processor_1.CommonJSProcessor,
			"sound": s.decodeSOUND,
			"movieclip": s.decodeMovieClip,
			"atlas": s.decodeATLAS,
			"pkg": s.decodePackageRes
		};
		return processorMap[type];
	}
}

