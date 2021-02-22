/**
 * 动画帧数据
 */
export class FrameData {
	public framekey: string = "";
	public frameNames: string[] = [];
	public frameTextures: Laya.Texture[] = [];

	public constructor(key: string, spriteNames: string[]) {
		let s = this;
		s.framekey = key;
		s.frameNames = s.frameNames.concat(spriteNames);
		s.init();
	}

	private init() {
		let s = this;
		let num = s.frameNames.length;
		for (let i = 0; i < num; ++i) {
			s.frameTextures[i] = Laya.Loader.getRes(s.frameNames[i]);
		}
	}

	private setFrameData(key: string, spriteNames: string[]) {
		let s = this;
		s.framekey = key;
		s.frameNames = s.frameNames.concat(spriteNames);
	}
}

/**
 * 动画事件相关数据
 */
export class AnimationEvenData {
	public updateFun: Function;
	public funObj: any;
	public completeFun: Function;
	public completeFunObj: any;
	public frameListenerArr: any = {};
	// public frameListener:Function[] = [];
	// public frameListenerObj:any[] = [];
	// public frameIndex:number[] = [];
}

/**
 * 帧动画
 */
export default class ImageAnimation extends Laya.Sprite {
	public imageSource: Laya.Sprite;
	private currentFrameIndex: number = 0;
	private deltaTime: number = 0;
	private frameDeltaTime: number = 0;

	public FPS: number = 5;
	public frameDataArr: Array<FrameData> = new Array<FrameData>();
	public isPlaying: boolean = false;
	public fowardPlay: boolean = true;
	public autoPlay: boolean = false;
	public Loop: number = 1;
	public loopCounter: number = 0;

	private static mLastTime: number = 0;
	private static mCurrentTime: number = 0;
	private static mGapTime: number = 0;

	//当前动画数据
	private currentAnimationData: FrameData = null;
	private FrameCount: number = 0;
	private defaultAnimationKey: string = "";
	private animationEvenData: AnimationEvenData;

	private ax: number = 0.5;
	private ay: number = 0.5;
	private color: number = -1;

	private static _init: boolean = false;
	private static animationDataArr: AnimationEvenData[] = [];
	private static _stage: Laya.Stage;

	/**
	 * key 动画名称;
	 * frameName 帧图片命名规则，例如pic1.png是第一帧，则frameName为pic;
	 * frameNum 帧数;
	 * sheetName 动画帧所在的图集名称;
	 * frameStartIndex 从第几帧开始播放
	 */
	public constructor(key: string, frameName: string, frameNum: number, sheetName: string, frameStartIndex: number = 0) {
		super();
		let s = this;
		//添加默认动画数据
		s.AddAnimation(key, frameName, frameNum, sheetName, frameStartIndex);
		//默认帧动画key
		s.defaultAnimationKey = key;
		s.currentAnimationData = s.frameDataArr[0];
		s.initImage();
		s.AddToStage();
	}

	private AddToStage() {
		let s = this;
		if (!ImageAnimation._init) {
			ImageAnimation._init = true;
			ImageAnimation.mLastTime = Laya.Browser.now();
			ImageAnimation._stage = s.stage;
			ImageAnimation._stage.on(Laya.Event.FRAME, s, ImageAnimation.frameUpdate);
		}
		//s.removeEventListener(egret.Event.ADDED_TO_STAGE, s.AddToStage, s);
		//s.addEventListener(egret.Event.REMOVED_FROM_STAGE, s.removeFromStage, s);
		//动画数据
		s.animationEvenData = new AnimationEvenData;
		s.animationEvenData.updateFun = s.animationUpdate;
		s.animationEvenData.funObj = s;
		ImageAnimation.animationDataArr.push(s.animationEvenData);
	}

	private removeFromStage(e: Laya.Event) {
		let s = this;
		let index = ImageAnimation.animationDataArr.indexOf(s.animationEvenData);
		if (index >= 0) {
			ImageAnimation.animationDataArr.splice(index, 1);
		}
		//s.removeEventListener(egret.Event.REMOVED_FROM_STAGE, s.removeFromStage, s);
	}

	private Init() {
		let s = this;
		s.deltaTime = 0;
		s.currentFrameIndex = 0;
		s.isPlaying = true;
		//每帧动画的时间间隔
		s.frameDeltaTime = 1 / s.FPS;
		if (!s.fowardPlay) {
			s.currentFrameIndex = s.FrameCount - 1;
		}
		s.imageSource.texture = s.currentAnimationData.frameTextures[s.currentFrameIndex];
		s.initImage();
	}

	private initImage() {
		let s = this;
		if (!s.imageSource) {
			s.imageSource = new Laya.Sprite;
			s.addChild(s.imageSource);
			s.setSprite(0);
		}
		s.imageSource.pivotX = s.imageSource.width * s.ax;
		s.imageSource.pivotY = s.imageSource.height * s.ay;
		s.width = s.imageSource.width;
		s.height = s.imageSource.height;
	}

	private animationUpdate(gapTime: number) {
		let s = this;
		if (!s.isPlaying || !s.currentAnimationData || 0 == s.FrameCount) {
			return;
		}
		if (gapTime > 1) {
			gapTime = 0;
		}
		s.deltaTime += gapTime;
		if (s.deltaTime > s.frameDeltaTime) {
			s.deltaTime -= s.frameDeltaTime;
			s.frameListenerCall(s.currentFrameIndex);
			if (s.fowardPlay) {
				s.currentFrameIndex++;
			}
			else {
				s.currentFrameIndex--;
			}

			if (s.currentFrameIndex >= s.FrameCount) {
				s.Loop -= 1;
				if (s.Loop == 0) {
					s.isPlaying = false;
					s.completeListenerCall();
					return;
				} else {
					s.currentFrameIndex = 0;
				}
			}
			else if (s.currentFrameIndex < 0) {
				s.Loop -= 1;
				if (s.Loop == 0) {
					s.isPlaying = false;
					s.completeListenerCall();
					return;
				} else {
					s.currentFrameIndex = s.FrameCount - 1;
				}
			}

			s.setSprite(s.currentFrameIndex);
		}
	}

	private static frameUpdate(e: Laya.Event) {
		ImageAnimation.mCurrentTime = Laya.Browser.now();
		ImageAnimation.mGapTime = (ImageAnimation.mCurrentTime - ImageAnimation.mLastTime) / 1000;
		ImageAnimation.mLastTime = ImageAnimation.mCurrentTime;

		let num = ImageAnimation.animationDataArr.length;
		for (let i = 0; i < num; ++i) {
			ImageAnimation.animationDataArr[i].updateFun.call(ImageAnimation.animationDataArr[i].funObj, ImageAnimation.mGapTime);
		}
	}

	//添加动画数据接口
	public AddAnimation(key: string, frameName: string, frameNum: number, sheetName: string, frameStartIndex: number = 0): ImageAnimation {
		if (frameNum <= 0) {
			alert("动画帧数不能小于0");
			return;
		}
		if (key == "") {
			alert("动画键值不能为空");
			return;
		}
		let s = this;
		let isHaveKey = false;
		for (let i = 0; i < s.frameDataArr.length; ++i) {
			if (s.frameDataArr[i].framekey === key) {
				isHaveKey = true;
				break;
			}
		}

		//避免有相同key的动画
		if (!isHaveKey) {
			let frameNames: string[] = [];
			for (let i = 0; i < frameNum; ++i) {
				frameNames[i] = sheetName + "." + frameName + `${frameStartIndex + i}`;
			}
			let frameData = new FrameData(key, frameNames);
			s.frameDataArr.push(frameData);
		}
		return s;
	}

	public show(pr: Laya.Sprite, px: number, py: number) {
		let s = this;
		pr.addChild(s);
		s.x = px;
		s.y = py;
	}

	//播放指定key对应的动画
	public play(key: string, loop: number = 1, foward: boolean = true) {
		let s = this;
		//if(s.currentAnimationData.framekey == key) return;
		s.currentAnimationData = null;
		s.FrameCount = 0;
		s.Loop = loop;
		s.fowardPlay = foward;
		for (let i = 0; i < s.frameDataArr.length; ++i) {
			if (s.frameDataArr[i].framekey === key) {
				s.currentAnimationData = s.frameDataArr[i];
				s.FrameCount = s.currentAnimationData.frameNames.length;
				break;
			}
		}

		if (s.FrameCount == 0) {
			alert("不存在key对应的动画");
		}
		else {
			s.Init();
		}
	}

	public stop(isClear: boolean = false) {
		let s = this;
		if (s.currentAnimationData) {
			s.isPlaying = false;
			s.setSprite(0);
			// if (this.color >= 0) {
			// 	this.color = -1;
			// 	GameConfig.Inst.clearColor(this.ImageSource);
			// }

			if (isClear) {
				s.clear();
			}
		}
	}

	//设置动画帧率
	public setFPS(fps: number) {
		this.FPS = fps;
		//每帧动画的时间间隔时间
		this.frameDeltaTime = 1 / this.FPS;
	}

	private setSprite(spriteIndex: number) {
		let s = this;
		s.imageSource.texture = s.currentAnimationData.frameTextures[spriteIndex];
		// if (this.color >= 0) {
		// 	GameConfig.Inst.setImageColor(s.ImageSource, this.color);
		// }
	}

	public clear() {
		let s = this;
		let index = ImageAnimation.animationDataArr.indexOf(s.animationEvenData);
		if (index != -1) {
			ImageAnimation.animationDataArr.splice(index, 1);
		}
		// s.removeCompleteListener();
		// s.removeFrameListener();
	}

	public static dispose() {
		let s = this;
		if (ImageAnimation._init) {
			ImageAnimation._init = false;
			ImageAnimation._stage.off(Laya.Event.FRAME, s, ImageAnimation.frameUpdate);
		}
		ImageAnimation.animationDataArr.length = 0;
	}

	public setAnchorPoint(ax: number, ay: number) {
		let s = this;
		s.ax = ax;
		s.ay = ay;
		let posX = s.imageSource.x;
		let posY = s.imageSource.y;
		s.imageSource.pivotX = s.imageSource.width * s.ax;
		s.imageSource.pivotY = s.imageSource.height * s.ay;
		s.imageSource.x = posX;
		s.imageSource.y = posY;
	}

	public setColor(_color: number) {
		this.color = _color;
	}

	/**
	 * 执行帧监听
	 */
	private frameListenerCall(frameIndex: number) {
		let s = this;
		let frameListenerObj = s.animationEvenData.frameListenerArr[s.currentAnimationData.framekey];
		if (frameListenerObj) {
			let num = frameListenerObj.frameIndex.length;
			let i: number;
			for (i = 0; i < num; ++i) {
				if (frameListenerObj.frameIndex[i] == frameIndex) {
					break;
				}
			}
			//执行帧监听
			if (i == num) {
				frameListenerObj.frameListener[i].call(frameListenerObj.frameListenerObj[i], s);
			}
		}
	}

	/**
	 * 执行动画完成监听
	 */
	private completeListenerCall() {
		let s = this;
		if (s.animationEvenData.completeFun && s.animationEvenData.completeFunObj) {
			let fun = s.animationEvenData.completeFun;
			let funObj = s.animationEvenData.completeFunObj;
			s.animationEvenData.completeFun = null;
			s.animationEvenData.completeFunObj = null;
			fun.call(funObj, s);
		}
	}

	/**
	 * 添加动画完成监听
	 */
	public addCompleteListener(fun: Function, thisObj: any) {
		let s = this;
		s.animationEvenData.completeFun = fun;
		s.animationEvenData.completeFunObj = thisObj;
	}
	/**
	 * 移除完成监听
	 */
	public removeCompleteListener() {
		let s = this;
		s.animationEvenData.completeFun = null;
		s.animationEvenData.completeFunObj = null;
	}

	/**
	 * 添加帧监听
	 * fun:帧回调函数
	 * thisObj:回调函数指向
	 * frameIndex:回调帧
	 * animationKey:回调帧所处的帧动画
	 */
	public addFrameListener(fun: Function, thisObj: any, frameIndex: number, animationKey: string) {
		let s = this;
		let frameListenerObj = s.animationEvenData.frameListenerArr[animationKey];
		if (!frameListenerObj) {
			frameListenerObj = {
				frameListener: [],
				frameListenerObj: [],
				frameIndex: []
			};
			s.animationEvenData.frameListenerArr[animationKey] = frameListenerObj;
		}

		let num = frameListenerObj.frameIndex.length;
		let i: number;
		for (i = 0; i < num; ++i) {
			if (frameListenerObj.frameIndex[i] == frameIndex) {
				break;
			}
		}
		//添加新的帧监听
		if (i == num) {
			frameListenerObj.frameListener.push(fun);
			frameListenerObj.frameListenerObj.push(thisObj);
			frameListenerObj.frameIndex.push(frameIndex);
		}
	}
	/**
	 * 移除帧监听
	 */
	public removeFrameListener(frameIndex: number, animationKey: string) {
		let s = this;
		let frameListenerObj = s.animationEvenData.frameListenerArr[animationKey];
		if (frameListenerObj) {
			let num = frameListenerObj.frameIndex.length;
			let i: number;
			for (i = 0; i < num; ++i) {
				if (frameListenerObj.frameIndex[i] == frameIndex) {
					break;
				}
			}
			//添加新的帧监听
			if (i == num) {
				frameListenerObj.frameListener.splice(i, 1);
				frameListenerObj.frameListenerObj.splice(i, 1);
				frameListenerObj.frameIndex.splice(i, 1);
			}
		}
	}
}