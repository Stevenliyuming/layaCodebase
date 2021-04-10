import { Sprite, TextField, Rectangle } from "./Layout"
import { UIColor } from "./UIColor"

/**皮肤 
 * 默认参数x轴,y轴,w宽,h高,r半径,c颜色,ew圆角宽,eh圆角高
*/
export class UISkin {
	/**随机色的矩形与圆 */
	public static get randomRect(): Sprite { return UISkin.getRect(60, 60, UIColor.random) };
	public static get randomCircle(): Sprite { return UISkin.getCircle(50, UIColor.random) };
	// /**默认点 */
	public static get pointNormal(): Sprite { return UISkin.getCircle(6, UIColor.black) };
	public static get pointDown(): Sprite { return UISkin.getCircle(6, UIColor.gray) };
	/**默认按钮 */
	public static get buttonNormal(): Sprite { return UISkin.getRect(60, 60, UIColor.skinNormal) };
	public static get buttonDown(): Sprite { return UISkin.getRect(60, 60, UIColor.skinDown) };
	/**默认单选框 */
	public static get radioOff(): Sprite { return UISkin.getRadioCircle(UIColor.white, UIColor.white) };
	public static get radioOn(): Sprite { return UISkin.getRadioCircle(UIColor.white, UIColor.black, 1) };
	/**默认复选框 */
	public static get checkBoxOff(): Sprite { return UISkin.getCheckBoxRect(UIColor.white, UIColor.white) };
	public static get checkBoxOn(): Sprite { return UISkin.getCheckBoxRect(UIColor.white, UIColor.black, 1) };
	public static get checkBoxDisable(): Sprite { return UISkin.getCheckBoxRect(UIColor.gray, UIColor.white) };
	/**默认开关 */
	public static get switchOff(): Sprite { return UISkin.getSwitch(UIColor.skinNormal, UIColor.white) };
	public static get switchOn(): Sprite { return UISkin.getSwitch(UIColor.skinNormal, UIColor.white, 1) };
	/**默认进度条 */
	public static get progressBackground(): Sprite { return UISkin.getRect(300, 20, UIColor.skinNormal); }
	public static get progressSkin(): Sprite { return UISkin.getRect(300, 20, UIColor.skinDown); }
	/**默认滑动器 */
	public static get sliderBackground(): Sprite { return UISkin.getRect(300, 10, UIColor.skinNormal); }
	public static get sliderSkin(): Sprite { return UISkin.getRect(300, 10, UIColor.skinDown); }
	public static get sliderBar(): Sprite { return UISkin.getCircle(15, UIColor.white); }
	/**默认滚动条 */
	public static get scrollBarV(): Sprite { return UISkin.getRoundRect(10, 60, UIColor.skinNormal); }
	public static get scrollBarH(): Sprite { return UISkin.getRoundRect(60, 10, UIColor.skinNormal); }
	/**上下页切换组件 */
	public static get pnBarPrevNormal(): Sprite { return UISkin.getPolygon(3, 20, UIColor.skinNormal, 180); }
	public static get pnBarPrevDown(): Sprite { return UISkin.getPolygon(3, 20, UIColor.skinDown, 180); }
	public static get pnBarNextNormal(): Sprite { return UISkin.getPolygon(3, 20, UIColor.skinNormal); }
	public static get pnBarNextDown(): Sprite { return UISkin.getPolygon(3, 20, UIColor.skinDown); }

	/**得到矩形框*/
	public static getLineRect(w: number, h: number, c: number | string = 0, s: number = 1, x: number = 0, y: number = 0): Sprite {
		var sp: Sprite = new Sprite();
		sp.autoSize = true;
		var c1 = UIColor.convertColor(c);
		sp.graphics.drawLines(x, y, [x+w, y, x+w, y+h, x, y+h, x, y], c1, 3);
		sp.graphics.drawRect(x, y, w, h, c1);
		return sp;
	}

	/**得到圆形框*/
	public static getLineCircle(r: number, c: number | string = 0, s: number = 1, x: number = 0, y: number = 0): Sprite {
		var sp: Sprite = new Sprite();
		sp.autoSize = true;
		var c1 = UIColor.convertColor(c);
		sp.graphics.drawCircle(x, y, r, c1);
		return sp;
	}

	/**得到渐变矩形 a为角度偏移率0,0.5,1,2分别为四个正方向*/
	public static getMatrixRect(w: number, h: number, c1: number | string = 0, c2: number | string = 0, a: number = 0): Sprite {
		var node = new Sprite();
		// var matrix = new Laya.Matrix();
		// matrix.createGradientBox(w, h, Math.PI * a, 0, 0);
		// node.graphics.beginGradientFill(egret.GradientType.LINEAR, [c1, c2], [1, 1], [0, 255], matrix);
		// node.graphics.drawRect(0, 0, w, h);
		// node.graphics.endFill();
		return node;
	}

	/**得到矩形*/
	public static getRect(w: number, h: number, c: number | string = 0, x: number = 0, y: number = 0): Sprite {
		var s: Sprite = new Sprite()
		//s.autoSize = true;
		s.width = w;
		s.height = h;
		var c1 = UIColor.convertColor(c);
		s.graphics.drawRect(x, y, w, h, c1);
		return s;
	}

	/**得到矩形中间带一个X*/
	public static getRectAndX(w: number, h: number, c: number | string = 0, x: number = 0, y: number = 0): Sprite {
		var s: Sprite = this.getRect(w, h, c, x, y)
		s.autoSize = true;
		s.addChild(this.getX(w, h, c, 1, x, y));
		return s;
	}

	/**得到一个X*/
	public static getX(w: number, h: number, c: number | string = 0, s: number = 1, x: number = 0, y: number = 0): Sprite {
		var container: Sprite = new Sprite;
		container.autoSize = true;
		var l1: Sprite = new Sprite;
		l1.autoSize = true;
		var c1 = UIColor.convertColor(c);
		l1.graphics.drawLine(0, 0, w, h, c1, s);
		l1.graphics.drawLine(w, 0, 0, h, c1, s);
		container.addChild(l1);
		return container;
	}

	/**得到圆角矩形*/
	public static getRoundRect(w: number, h: number, c: number | string = 0, ew: number = 5, eh: number = 5, x: number = 0, y: number = 0): Sprite {
		var sp: Sprite = new Sprite()
		sp.graphics.drawPath(x, y, [
			["moveTo", ew, 0], 
			["lineTo", w-ew, 0], 
			["arcTo", w, 0, w, ew, eh], 
			["lineTo", w, h-eh], 
			["arcTo", w, h, w-ew, h, ew], 
			["lineTo", ew, h], 
			["arcTo", 0, h, 0, h-eh, eh], 
			["lineTo", 0, eh], 
			["arcTo", 0, 0, eh, 0, ew], 
			["closePath"]], {fillStyle: "#ffffff"});
		return sp;
	}

	/**得到圆形*/
	public static getCircle(r: number, c: number | string = 0, x: number = 0, y: number = 0): Sprite {
		var s: Sprite = new Sprite();
		s.autoSize = true;
		var c1 = UIColor.convertColor(c);
		s.graphics.drawCircle(x, y, r, c1);
		return s;
	}

	/**得到多边形,side边数,rotation角度*/
	public static getPolygon(side: number = 3, r: number = 10, c: number | string = 0, rotation: number = 0): Sprite {
		var s: Sprite = new Sprite;
		s.autoSize = true;
		s.rotation = rotation;
		var c1 = UIColor.convertColor(c);
		var oldX:number = 0;
		var oldY:number = 0;
		for (var i: number = 0; i <= side; i++) {
			var lineX: number = Math.cos((i * (360 / side) * Math.PI / 180)) * r;
			var lineY: number = Math.sin((i * (360 / side) * Math.PI / 180)) * r;
			// if (i == 0) s.graphics.moveTo(lineX, lineY);
			// else s.graphics.drawLine(lineX, lineY);
			s.graphics.drawLine(oldX, oldY, lineX, lineY, c1);
			oldX = lineX;
			oldY = lineY;
		}
		return s;
	}

	/**得到圆角矩形与三角形合体rc是正方形颜色,pc是三角形颜色*/
	public static getArrowRoundRect(w: number, h: number, rc: number | string, pc: number | string = 0, rotation: number = 0): Sprite {
		var s: Sprite = new Sprite;
		s.autoSize = true;
		s.addChild(this.getRoundRect(w, h, rc));
		var p: Sprite = this.getPolygon(3, w / 3, pc, 30 + rotation);
		p.autoSize = true;
		p.x = s.width >> 1; p.y = s.height >> 1;
		s.addChild(p);
		return s;
	}

	/**得到滚动条的bar*/
	public static getScrollLineBar(w: number, h: number, c: number | string): Sprite {
		var s: Sprite = new Sprite;
		s.autoSize = true;
		var _h: number = h / 3;
		for (var i: number = 0; i < 3; i++) {
			var r: Sprite = this.getRect(w, 1, c, 0, i * _h);
			r.autoSize = true;
			s.addChild(r);
		}
		return s;
	}

	/**得到圆角矩形-加*/
	public static getAddRoundRect(w: number, h: number, c: number | string): Sprite {
		var s: Sprite = new Sprite;
		s.autoSize = true;
		s.addChild(this.getRoundRect(w, h, c));
		var r1: Sprite = this.getRect(w / 2, 2, 0, w / 4, h / 2 - 1);
		var r2: Sprite = this.getRect(2, h / 2, 0, w / 2 - 1, h / 4);
		r1.autoSize = true;
		r2.autoSize = true;
		s.addChild(r1);
		s.addChild(r2);
		return s;
	}

	/**得到圆角矩形-减*/
	public static getRemoveRoundRect(w: number, h: number, c: number | string): Sprite {
		var s: Sprite = new Sprite;
		s.autoSize = true;
		s.addChild(this.getRoundRect(w, h, c));
		var r: Sprite = this.getRect(w / 2, 2, 0, w / 4, h / 2 - 1);
		r.autoSize = true;
		s.addChild(r);
		return s;
	}

	/**得到带文字的圆角方形*/
	public static getRoundRectText(w: number, h: number, c: number | string, str: string = "click"): Sprite {
		var s: Sprite = new Sprite;
		s.autoSize = true;
		s.addChild(this.getRoundRect(w, h, c));
		var text: TextField = new TextField;
		text.name = "text";
		text.text = str;
		text.x = (s.width - text.width) >> 1;
		text.y = (s.height - text.height) >> 1;
		s.addChild(text);
		return s;
	}

	/**得到矩形-switchButton bc背景颜色，gc钩选的颜色,type为0是没有钩 为1是有钩*/
	public static getSwitch(bc: number | string = 0XFFFFFF, gc: number | string = 0, type: number = 0): Sprite {
		var node: Sprite = UISkin.getRoundRect(80, 50, bc, 60, 60);
		node.autoSize = true;
		node.addChild(UISkin.getCircle(22, gc, type == 0 ? 25 : 55, 25));
		return node;
	}

	/**得到矩形-复选框 bc背景颜色，gc钩的颜色,type为0是没有钩为1是有钩*/
	public static getCheckBoxRect(bc: number | string = 0XFFFFFF, gc: number | string = 0, type: number = 0): Sprite {
		var s: Sprite = this.getRect(40, 40, bc);
		if (type == 1) {
			var r: Sprite = new Sprite;
			//r.autoSize = true;
			var c1 = UIColor.convertColor(gc);
			r.graphics.drawPoly(0, 20, [20, 36, 44, 8, 36, 0, 20, 18, 12, 8, 0, 20], c1, 1);
			//r.graphics.drawPoly(0, 23, [18, 40, 40, 8, 35, 5, 22, 25, 8, 13, 0, 23], c1, 1);
			//r.graphics.moveTo(0, 20);
			//r.graphics.lineTo(20, 36); r.graphics.lineTo(44, 8); r.graphics.lineTo(36, 0); r.graphics.lineTo(20, 18);
			//r.graphics.lineTo(12, 8); r.graphics.lineTo(0, 20);
			s.addChild(r);
			r.y = -20;
		}
		return s;
	}

	/**得到矩形-单选框 bc背景颜色，gc钩的颜色,type为0是没有圆为1是有圆*/
	public static getRadioCircle(bc: number | string = 0XFFFFFF, gc: number | string = 0, type: number = 0): Sprite {
		var s: Sprite = this.getCircle(16, bc, 16, 16);
		if (type == 1) {
			var r: Sprite = this.getCircle(8, gc, 16, 16)
			s.addChild(r);
		}
		return s;
	}

	/**得到矩形-网格
	 * rect.x是x轴数量
	 * rect.y是y轴数量
	 * rect.width是网格宽
	 * rect.height是网格高
	 * lc网格线颜色
	 * */
	public static getGridding(rect: Rectangle, c: number | string = 0): Sprite {
		var s: Sprite = new Sprite;
		s.autoSize = true
		var c1 = UIColor.convertColor(c);
		var disx: number = rect.width / rect.x;
		var disy: number = rect.height / rect.y;
		for (var i: number = 0; i < rect.x; i++) {
			s.graphics.drawLine(0, i * disy, rect.width, i * disy, c1, 0.1);
		}
		for (i = 0; i < rect.y; i++) {
			s.graphics.drawLine(i * disx, 0, i * disx, rect.height, c1, 0.1);
		}
		return s;
	}
}