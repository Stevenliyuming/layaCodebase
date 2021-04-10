export default class Global {

    static FRAME_RATE: number = 30;

    static STATS_BTN: boolean = false;

    static getDefinitionByNameCache = {};

    static getQualifiedClassName(value) {
        var type = typeof value;
        if (!value || (type != "object" && !value.prototype)) {
            return type;
        }
        var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
        if (prototype.hasOwnProperty("__class__")) {
            return prototype["__class__"];
        }
        var constructorString = prototype.constructor.toString().trim();
        var index = constructorString.indexOf("{");
        var className = constructorString.substring(0, index);
        // var index = constructorString.indexOf("(");
        // var className = constructorString.substring(9, index);
        Object.defineProperty(prototype, "__class__", {
            value: className,
            enumerable: false,
            writable: true
        });
        return className;
    }

    static is(obj:any, type:string) {
        if(obj) {
            var prototype = obj.prototype ? obj.prototype : Object.getPrototypeOf(obj);
            var typeName:string;
            while(prototype) {
                typeName = prototype.constructor.name;
                if(type.includes(typeName)) {
                    return true;
                }
                obj = prototype["__proto__"];
                if(!obj) return false;
                prototype = obj.prototype ? obj.prototype : Object.getPrototypeOf(obj);
            }
            return false;
        }
        return false;
    }

    /**
     * 返回 name 参数指定的类的类对象引用。
     * @param name 类的名称。
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/getDefinitionByName.ts
     * @language zh_CN
     */
    static getDefinitionByName(name) {
        if (!name)
            return null;
        var definition = Global.getDefinitionByNameCache[name];
        if (definition) {
            return definition;
        }
        var paths = name.split(".");
        var length = paths.length;
        definition = window;
        for (var i = 0; i < length; i++) {
            var path = paths[i];
            definition = definition[path];
            if (!definition) {
                return null;
            }
        }
        Global.getDefinitionByNameCache[name] = definition;
        return definition;
    }

    /**
     *将16进制颜色分割成rgb值
    */
    public static spliceColor(color: number) {
        let result = { r: -1, g: -1, b: -1 };
        result.b = color % 256;
        result.g = Math.floor((color / 256)) % 256;
        result.r = Math.floor((color / 256) / 256);
        return result;
    }

    /**
     * 转换10进制rbg颜色转换到16进制
     */
    public static convertNumberToHex(r: number, g: number, b: number): number {
        var strHex: string = "";
        var r1 = r.toString(16);
        if (r1.length == 1 || r1 === "0") r1 = "0" + r1;
        var g1 = g.toString(16);
        if (g1.length == 1 || g1 === "0") g1 = "0" + g1;
        var b1 = b.toString(16);
        if (b1.length == 1 || b1 === "0") b1 = "0" + b1;
        strHex = "0x" + r1 + g1 + b1;
        return parseInt(strHex);
    }

    /**
     * 转换10进制rbg颜色转换到16进制
     */
    public static convertNumberToColor(r: number, g: number, b: number): string {
        var strHex: string = "";
        var r1 = r.toString(16);
        if (r1.length == 1 || r1 === "0") r1 = "0" + r1;
        var g1 = g.toString(16);
        if (g1.length == 1 || g1 === "0") g1 = "0" + g1;
        var b1 = b.toString(16);
        if (b1.length == 1 || b1 === "0") b1 = "0" + b1;
        strHex = "#" + r1 + g1 + b1;
        return strHex;
    }
}