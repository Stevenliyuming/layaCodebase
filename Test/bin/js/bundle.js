(function () {
    'use strict';

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
        }
    }
    GameConfig.width = 1920;
    GameConfig.height = 1080;
    GameConfig.scaleMode = "full";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Base64Util {
        static encode(arraybuffer) {
            let bytes = new Uint8Array(arraybuffer);
            let len = bytes.length;
            let base64 = '';
            for (let i = 0; i < len; i += 3) {
                base64 += chars[bytes[i] >> 2];
                base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                base64 += chars[bytes[i + 2] & 63];
            }
            if ((len % 3) === 2) {
                base64 = base64.substring(0, base64.length - 1) + '=';
            }
            else if (len % 3 === 1) {
                base64 = base64.substring(0, base64.length - 2) + '==';
            }
            return base64;
        }
        static decode(base64) {
            let bufferLength = base64.length * 0.75;
            let len = base64.length;
            let p = 0;
            let encoded1 = 0;
            let encoded2 = 0;
            let encoded3 = 0;
            let encoded4 = 0;
            if (base64[base64.length - 1] === '=') {
                bufferLength--;
                if (base64[base64.length - 2] === '=') {
                    bufferLength--;
                }
            }
            let arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
            for (let i = 0; i < len; i += 4) {
                encoded1 = lookup[base64.charCodeAt(i)];
                encoded2 = lookup[base64.charCodeAt(i + 1)];
                encoded3 = lookup[base64.charCodeAt(i + 2)];
                encoded4 = lookup[base64.charCodeAt(i + 3)];
                bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
            }
            return arraybuffer;
        }
    }
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    class Endian {
    }
    Endian.LITTLE_ENDIAN = "littleEndian";
    Endian.BIG_ENDIAN = "bigEndian";
    class ByteArray {
        constructor(buffer, bufferExtSize = 0) {
            this.bufferExtSize = 0;
            this.EOF_byte = -1;
            this.EOF_code_point = -1;
            if (bufferExtSize < 0) {
                bufferExtSize = 0;
            }
            this.bufferExtSize = bufferExtSize;
            let bytes, wpos = 0;
            if (buffer) {
                let uint8;
                if (buffer instanceof Uint8Array) {
                    uint8 = buffer;
                    wpos = buffer.length;
                }
                else {
                    wpos = buffer.byteLength;
                    uint8 = new Uint8Array(buffer);
                }
                if (bufferExtSize == 0) {
                    bytes = new Uint8Array(wpos);
                }
                else {
                    let multi = (wpos / bufferExtSize | 0) + 1;
                    bytes = new Uint8Array(multi * bufferExtSize);
                }
                bytes.set(uint8);
            }
            else {
                bytes = new Uint8Array(bufferExtSize);
            }
            this.write_position = wpos;
            this._position = 0;
            this._bytes = bytes;
            this.data = new DataView(bytes.buffer);
            this.endian = Endian.BIG_ENDIAN;
        }
        get endian() {
            return this.$endian == 0 ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
        }
        set endian(value) {
            this.$endian = value == Endian.LITTLE_ENDIAN ? 0 : 1;
        }
        setArrayBuffer(buffer) {
        }
        get readAvailable() {
            return this.write_position - this._position;
        }
        get buffer() {
            return this.data.buffer.slice(0, this.write_position);
        }
        get rawBuffer() {
            return this.data.buffer;
        }
        set buffer(value) {
            let wpos = value.byteLength;
            let uint8 = new Uint8Array(value);
            let bufferExtSize = this.bufferExtSize;
            let bytes;
            if (bufferExtSize == 0) {
                bytes = new Uint8Array(wpos);
            }
            else {
                let multi = (wpos / bufferExtSize | 0) + 1;
                bytes = new Uint8Array(multi * bufferExtSize);
            }
            bytes.set(uint8);
            this.write_position = wpos;
            this._bytes = bytes;
            this.data = new DataView(bytes.buffer);
        }
        get bytes() {
            return this._bytes;
        }
        get dataView() {
            return this.data;
        }
        set dataView(value) {
            this.buffer = value.buffer;
        }
        get bufferOffset() {
            return this.data.byteOffset;
        }
        get position() {
            return this._position;
        }
        set position(value) {
            this._position = value;
            if (value > this.write_position) {
                this.write_position = value;
            }
        }
        get length() {
            return this.write_position;
        }
        set length(value) {
            this.write_position = value;
            if (this.data.byteLength > value) {
                this._position = value;
            }
            this._validateBuffer(value);
        }
        _validateBuffer(value) {
            if (this.data.byteLength < value) {
                let be = this.bufferExtSize;
                let tmp;
                if (be == 0) {
                    tmp = new Uint8Array(value);
                }
                else {
                    let nLen = ((value / be >> 0) + 1) * be;
                    tmp = new Uint8Array(nLen);
                }
                tmp.set(this._bytes);
                this._bytes = tmp;
                this.data = new DataView(tmp.buffer);
            }
        }
        get bytesAvailable() {
            return this.data.byteLength - this._position;
        }
        clear() {
            let buffer = new ArrayBuffer(this.bufferExtSize);
            this.data = new DataView(buffer);
            this._bytes = new Uint8Array(buffer);
            this._position = 0;
            this.write_position = 0;
        }
        readBoolean() {
            if (this.validate(1))
                return !!this._bytes[this.position++];
        }
        readByte() {
            if (this.validate(1))
                return this.data.getInt8(this.position++);
        }
        readBytes(bytes, offset = 0, length = 0) {
            if (!bytes) {
                return;
            }
            let pos = this._position;
            let available = this.write_position - pos;
            if (available < 0) {
                console.error(1025);
                return;
            }
            if (length == 0) {
                length = available;
            }
            else if (length > available) {
                console.error(1025);
                return;
            }
            const position = bytes._position;
            bytes._position = 0;
            bytes.validateBuffer(offset + length);
            bytes._position = position;
            bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
            this.position += length;
        }
        readDouble() {
            if (this.validate(8)) {
                let value = this.data.getFloat64(this._position, this.$endian == 0);
                this.position += 8;
                return value;
            }
        }
        readFloat() {
            if (this.validate(4)) {
                let value = this.data.getFloat32(this._position, this.$endian == 0);
                this.position += 4;
                return value;
            }
        }
        readInt() {
            if (this.validate(4)) {
                let value = this.data.getInt32(this._position, this.$endian == 0);
                this.position += 4;
                return value;
            }
        }
        readShort() {
            if (this.validate(2)) {
                let value = this.data.getInt16(this._position, this.$endian == 0);
                this.position += 2;
                return value;
            }
        }
        readUnsignedByte() {
            if (this.validate(1))
                return this._bytes[this.position++];
        }
        readUnsignedInt() {
            if (this.validate(4)) {
                let value = this.data.getUint32(this._position, this.$endian == 0);
                this.position += 4;
                return value;
            }
        }
        readUnsignedShort() {
            if (this.validate(2)) {
                let value = this.data.getUint16(this._position, this.$endian == 0);
                this.position += 2;
                return value;
            }
        }
        readUTF() {
            let length = this.readUnsignedShort();
            if (length > 0) {
                return this.readUTFBytes(length);
            }
            else {
                return "";
            }
        }
        readUTFBytes(length) {
            if (!this.validate(length)) {
                return;
            }
            let data = this.data;
            let bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
            this.position += length;
            return this.decodeUTF8(bytes);
        }
        writeBoolean(value) {
            this.validateBuffer(1);
            this._bytes[this.position++] = +value;
        }
        writeByte(value) {
            this.validateBuffer(1);
            this._bytes[this.position++] = value & 0xff;
        }
        writeBytes(bytes, offset = 0, length = 0) {
            let writeLength;
            if (offset < 0) {
                return;
            }
            if (length < 0) {
                return;
            }
            else if (length == 0) {
                writeLength = bytes.length - offset;
            }
            else {
                writeLength = Math.min(bytes.length - offset, length);
            }
            if (writeLength > 0) {
                this.validateBuffer(writeLength);
                this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
                this.position = this._position + writeLength;
            }
        }
        writeDouble(value) {
            this.validateBuffer(8);
            this.data.setFloat64(this._position, value, this.$endian == 0);
            this.position += 8;
        }
        writeFloat(value) {
            this.validateBuffer(4);
            this.data.setFloat32(this._position, value, this.$endian == 0);
            this.position += 4;
        }
        writeInt(value) {
            this.validateBuffer(4);
            this.data.setInt32(this._position, value, this.$endian == 0);
            this.position += 4;
        }
        writeShort(value) {
            this.validateBuffer(2);
            this.data.setInt16(this._position, value, this.$endian == 0);
            this.position += 2;
        }
        writeUnsignedInt(value) {
            this.validateBuffer(4);
            this.data.setUint32(this._position, value, this.$endian == 0);
            this.position += 4;
        }
        writeUnsignedShort(value) {
            this.validateBuffer(2);
            this.data.setUint16(this._position, value, this.$endian == 0);
            this.position += 2;
        }
        writeUTF(value) {
            let utf8bytes = this.encodeUTF8(value);
            let length = utf8bytes.length;
            this.validateBuffer(2 + length);
            this.data.setUint16(this._position, length, this.$endian == 0);
            this.position += 2;
            this._writeUint8Array(utf8bytes, false);
        }
        writeUTFBytes(value) {
            this._writeUint8Array(this.encodeUTF8(value));
        }
        toString() {
            return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
        }
        _writeUint8Array(bytes, validateBuffer = true) {
            let pos = this._position;
            let npos = pos + bytes.length;
            if (validateBuffer) {
                this.validateBuffer(npos);
            }
            this.bytes.set(bytes, pos);
            this.position = npos;
        }
        validate(len) {
            let bl = this._bytes.length;
            if (bl > 0 && this._position + len <= bl) {
                return true;
            }
            else {
                console.error(1025);
            }
        }
        validateBuffer(len) {
            this.write_position = len > this.write_position ? len : this.write_position;
            len += this._position;
            this._validateBuffer(len);
        }
        encodeUTF8(str) {
            let pos = 0;
            let codePoints = this.stringToCodePoints(str);
            let outputBytes = [];
            while (codePoints.length > pos) {
                let code_point = codePoints[pos++];
                if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                    this.encoderError(code_point);
                }
                else if (this.inRange(code_point, 0x0000, 0x007f)) {
                    outputBytes.push(code_point);
                }
                else {
                    let count, offset;
                    if (this.inRange(code_point, 0x0080, 0x07FF)) {
                        count = 1;
                        offset = 0xC0;
                    }
                    else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                        count = 2;
                        offset = 0xE0;
                    }
                    else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                        count = 3;
                        offset = 0xF0;
                    }
                    outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                    while (count > 0) {
                        let temp = this.div(code_point, Math.pow(64, count - 1));
                        outputBytes.push(0x80 + (temp % 64));
                        count -= 1;
                    }
                }
            }
            return new Uint8Array(outputBytes);
        }
        decodeUTF8(data) {
            let fatal = false;
            let pos = 0;
            let result = "";
            let code_point;
            let utf8_code_point = 0;
            let utf8_bytes_needed = 0;
            let utf8_bytes_seen = 0;
            let utf8_lower_boundary = 0;
            while (data.length > pos) {
                let _byte = data[pos++];
                if (_byte == this.EOF_byte) {
                    if (utf8_bytes_needed != 0) {
                        code_point = this.decoderError(fatal);
                    }
                    else {
                        code_point = this.EOF_code_point;
                    }
                }
                else {
                    if (utf8_bytes_needed == 0) {
                        if (this.inRange(_byte, 0x00, 0x7F)) {
                            code_point = _byte;
                        }
                        else {
                            if (this.inRange(_byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = _byte - 0xC0;
                            }
                            else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = _byte - 0xE0;
                            }
                            else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = _byte - 0xF0;
                            }
                            else {
                                this.decoderError(fatal);
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    }
                    else if (!this.inRange(_byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = this.decoderError(fatal, _byte);
                    }
                    else {
                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        }
                        else {
                            let cp = utf8_code_point;
                            let lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            }
                            else {
                                code_point = this.decoderError(fatal, _byte);
                            }
                        }
                    }
                }
                if (code_point !== null && code_point !== this.EOF_code_point) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0)
                            result += String.fromCharCode(code_point);
                    }
                    else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        }
        encoderError(code_point) {
            console.error(1026, code_point);
        }
        decoderError(fatal, opt_code_point) {
            if (fatal) {
                console.error(1027);
            }
            return opt_code_point || 0xFFFD;
        }
        inRange(a, min, max) {
            return min <= a && a <= max;
        }
        div(n, d) {
            return Math.floor(n / d);
        }
        stringToCodePoints(string) {
            let cps = [];
            let i = 0, n = string.length;
            while (i < string.length) {
                let c = string.charCodeAt(i);
                if (!this.inRange(c, 0xD800, 0xDFFF)) {
                    cps.push(c);
                }
                else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                    cps.push(0xFFFD);
                }
                else {
                    if (i == n - 1) {
                        cps.push(0xFFFD);
                    }
                    else {
                        let d = string.charCodeAt(i + 1);
                        if (this.inRange(d, 0xDC00, 0xDFFF)) {
                            let a = c & 0x3FF;
                            let b = d & 0x3FF;
                            i += 1;
                            cps.push(0x10000 + (a << 10) + b);
                        }
                        else {
                            cps.push(0xFFFD);
                        }
                    }
                }
                i += 1;
            }
            return cps;
        }
    }

    class HttpLoader {
        constructor() {
            this.timeout = 0;
            this._url = "";
            this._method = "";
            this.responseType = "text";
            this.withCredentials = false;
            this.timeout = 3000;
        }
        get responseType() {
            return this._responseType;
        }
        set responseType(value) {
            this._responseType = value;
        }
        get response() {
            if (!this._xhr) {
                return null;
            }
            if (this._xhr.response != undefined) {
                return this._xhr.response;
            }
            if (this._responseType == "text") {
                return this._xhr.responseText;
            }
            if (this._responseType == "arraybuffer" && /msie 9.0/i.test(navigator.userAgent)) {
                let w = window;
                return w.convertResponseBodyToText(this._xhr["responseBody"]);
            }
            if (this._responseType == "document") {
                return this._xhr.responseXML;
            }
            return null;
        }
        get withCredentials() {
            return this._withCredentials;
        }
        set withCredentials(value) {
            this._withCredentials = value;
        }
        getXHR() {
            if (window["XMLHttpRequest"]) {
                return new window["XMLHttpRequest"]();
            }
            else {
                return new ActiveXObject("MSXML2.XMLHTTP");
            }
        }
        open(url, method = "GET") {
            this._url = url;
            this._method = method;
            if (this._xhr) {
                this._xhr.abort();
                this._xhr = null;
            }
            let xhr = this.getXHR();
            if (window["XMLHttpRequest"]) {
                xhr.addEventListener("load", this.onload.bind(this));
                xhr.addEventListener("error", this.onerror.bind(this));
            }
            else {
                xhr.onreadystatechange = this.onReadyStateChange.bind(this);
            }
            xhr.ontimeout = this.onTimeout.bind(this);
            xhr.open(this._method, this._url, true);
            this._xhr = xhr;
        }
        send(data) {
            if (this._responseType != null) {
                this._xhr.responseType = this._responseType;
            }
            if (this._withCredentials != null) {
                this._xhr.withCredentials = this._withCredentials;
            }
            if (this._headerObj) {
                for (let key in this._headerObj) {
                    this._xhr.setRequestHeader(key, this._headerObj[key]);
                }
            }
            this._xhr.timeout = this.timeout;
            this._xhr.send(data);
        }
        abort() {
            if (this._xhr) {
                this._xhr.abort();
            }
        }
        getAllResponseHeaders() {
            if (!this._xhr) {
                return null;
            }
            let result = this._xhr.getAllResponseHeaders();
            return result ? result : "";
        }
        get headerObj() {
            return this.headerObj;
        }
        set headerObj(value) {
            this._headerObj = value;
        }
        setRequestHeader(header, value) {
            if (!this._headerObj) {
                this._headerObj = {};
            }
            this._headerObj[header] = value;
        }
        getResponseHeader(header) {
            if (!this._xhr) {
                return null;
            }
            let result = this._xhr.getResponseHeader(header);
            return result ? result : "";
        }
        setCallBackFun(callBack, funObj) {
            let s = this;
            s.callBack = callBack;
            s.funObj = funObj;
        }
        loadFinishCall() {
            let s = this;
            if (s.callBack) {
                s.callBack.call(s.funObj, s);
                s.callBack = null;
            }
        }
        onTimeout() {
            console.log("请求超时：" + this._url);
            this.loadFinishCall();
        }
        onReadyStateChange() {
            let xhr = this._xhr;
            if (xhr.readyState == 4) {
                let ioError = (xhr.status >= 400 || xhr.status == 0);
                let url = this._url;
                let self = this;
                window.setTimeout(function () {
                    self.loadFinishCall();
                    if (ioError) {
                        console.log("请求错误：" + url);
                    }
                }, 0);
            }
        }
        updateProgress(event) {
            if (event.lengthComputable) {
            }
        }
        onload() {
            let self = this;
            let xhr = this._xhr;
            let url = this._url;
            let ioError = (xhr.status >= 400);
            window.setTimeout(function () {
                self.loadFinishCall();
                if (ioError) {
                    console.log("请求错误：" + url);
                }
            }, 0);
        }
        onerror() {
            let url = this._url;
            let self = this;
            window.setTimeout(function () {
                self.loadFinishCall();
                console.log("请求错误：" + url);
            }, 0);
        }
    }

    class Loader extends Laya.EventDispatcher {
        constructor() {
            super();
        }
        static getInstance() {
            if (!Loader.instance)
                Loader.instance = new Loader;
            return Loader.instance;
        }
        load(url, data = null, loadInfo, method = "GET", responseType = null, withCredentials = false, headerObj = null) {
            let s = this;
            let obj = headerObj ? headerObj : {};
            let params = data ? s.formatParams(data) : null;
            let _url = url;
            if (method.toLowerCase() === "get") {
                if (params) {
                    if (url.lastIndexOf("?") != (url.length - 1))
                        _url += "?";
                    _url += params;
                    params = null;
                }
            }
            else {
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
        formatParams(params) {
            if (!params)
                return null;
            return Object
                .keys(params)
                .map(function (key) {
                return key + "=" + params[key];
            })
                .join("&");
        }
        loadFinishCall(target) {
            let s = this;
            if (target.loadInfo && target.loadInfo.callBack) {
                target.loadInfo.callBack.call(target.loadInfo.funObj, target.loadInfo);
            }
        }
    }

    var ResourceItem;
    (function (ResourceItem) {
        ResourceItem.TYPE_EXML = "exml";
        ResourceItem.TYPE_XML = "xml";
        ResourceItem.TYPE_IMAGE = "image";
        ResourceItem.TYPE_BIN = "bin";
        ResourceItem.TYPE_TEXT = "text";
        ResourceItem.TYPE_JSON = "json";
        ResourceItem.TYPE_SHEET = "sheet";
        ResourceItem.TYPE_FONT = "font";
        ResourceItem.TYPE_SOUND = "sound";
        ResourceItem.TYPE_TTF = "ttf";
        ResourceItem.TYPE_ATLAS = "atlas";
        ResourceItem.TYPE_PKG = "pkg";
        class ResObject {
            constructor() {
                this._count = 0;
                this.res = null;
                this.inPool = false;
            }
            getRes() {
                let s = this;
                s._count += 1;
                return s.res;
            }
            relRes() {
                let s = this;
                s._count -= 1;
                if (s._count <= 0) {
                    console.log("重复释放资源：" + s.pathKey);
                }
            }
            clear(gc) {
                let s = this;
                if (s.type == ResourceItem.TYPE_IMAGE) {
                    s.res.destroy();
                }
                else if (s.type == ResourceItem.TYPE_SOUND) {
                    s.res.dispose();
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
            get count() {
                return this._count;
            }
            ;
            static getResObject() {
                let obj = new ResObject;
                return obj;
            }
        }
        ResourceItem.ResObject = ResObject;
        class LoadInfo {
            constructor() {
                this.url = null;
                this.callBack = null;
                this.funObj = null;
                this.responseType = "";
                this.resTag = null;
                this.loader = null;
                this.resGroup = null;
            }
        }
        ResourceItem.LoadInfo = LoadInfo;
        class ResGroup {
            constructor() {
                this.groupName = null;
                this.resNum = 0;
                this.status = 0;
                this.loadInfoArray = [];
                this.callBack = null;
                this.funObj = null;
            }
        }
        ResourceItem.ResGroup = ResGroup;
        class WarpMode {
        }
        WarpMode.Clamp = 1;
        WarpMode.Repeat = 0;
        ResourceItem.WarpMode = WarpMode;
    })(ResourceItem || (ResourceItem = {}));
    class ResLoader extends Loader {
        constructor() {
            super();
            this.resDict = {};
            this.loadPool = [];
            this.waitPool = [];
            this._maxLoadNum = 5;
            this.resGroupPool = {};
        }
        static getInstance() {
            if (!ResLoader.inst)
                ResLoader.inst = new ResLoader;
            return ResLoader.inst;
        }
        loadRes(url, callBack = null, funObj = null, responseType = "", resTag = null) {
            let s = this;
            ResLoader.loadHashCode += 1;
            let loadInfo = s.checkLoadInfo(url);
            if (!loadInfo) {
                if (s.loadPool.length < s._maxLoadNum) {
                    loadInfo = s.resLoad(url, null, callBack, funObj, "get", responseType, false, null);
                    s.loadPool.push(loadInfo);
                }
                else {
                    s.waitPool.push(loadInfo);
                }
            }
        }
        checkLoadInfo(url) {
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
        set maxLoadNum(value) {
            this.maxLoadNum = value;
        }
        get maxLoadNum() {
            return this.maxLoadNum;
        }
        resLoad(url, data = null, callBack, funObj, method = "GET", responseType = null, withCredentials = false, headerObj = null) {
            let s = this;
            let loadInfo = new ResourceItem.LoadInfo;
            loadInfo.url = url;
            loadInfo.callBack = callBack;
            loadInfo.funObj = funObj;
            loadInfo.responseType = responseType;
            super.load(url, data, loadInfo, method, responseType, withCredentials);
            return loadInfo;
        }
        resGroupLoad(urlGroup = [], groupName, data = null, callBack, funObj, method = "GET", responseType = "", withCredentials = false, headerObj = null) {
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
                if (urlGroup[i] == "")
                    continue;
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
                loadInfo.resGroup = resGroup;
                resGroup.loadInfoArray.push(loadInfo);
                resGroup.resNum += 1;
                super.load(urlGroup[i], data, loadInfo, method, respType, withCredentials);
            }
        }
        loadFinishCall(target) {
            let s = this;
            let loadInfo = target.loadInfo;
            let resPath = loadInfo.url;
            let type = s.typeSelector(resPath);
            let decodeFun = s.decodeFunction(type);
            if (decodeFun) {
                decodeFun.call(s, loadInfo);
            }
            else {
                console.log("无法解析资源类型：" + resPath);
            }
        }
        decodePackageRes(loadInfo) {
            let s = this;
            let resGroup = new ResourceItem.ResGroup;
            resGroup.groupName = loadInfo.url;
            resGroup.callBack = loadInfo.callBack;
            resGroup.funObj = loadInfo.funObj;
            s.resGroupPool[resGroup.groupName] = resGroup;
            let res = loadInfo.loader.response;
            let resBuffer = new ByteArray(res);
            resBuffer.position = 0;
            resBuffer.endian = Endian.LITTLE_ENDIAN;
            let fileNum = resBuffer.readUnsignedShort();
            resGroup.resNum = fileNum;
            for (let i = 0; i < fileNum; ++i) {
                resBuffer.endian = Endian.LITTLE_ENDIAN;
                let pathLength = resBuffer.readUnsignedShort();
                let fileLength = resBuffer.readUnsignedInt();
                resBuffer.endian = Endian.BIG_ENDIAN;
                let fileLocalPath = resBuffer.readUTFBytes(pathLength);
                fileLocalPath = fileLocalPath.split("\\").join("/");
                console.log(fileLocalPath);
                let fileByteArray = new ByteArray;
                resBuffer.readBytes(fileByteArray, 0, fileLength);
                let loadInfo2 = new ResourceItem.LoadInfo;
                loadInfo2.url = fileLocalPath;
                loadInfo2.callBack = loadInfo.callBack;
                loadInfo2.funObj = loadInfo.funObj;
                loadInfo2.resGroup = resGroup;
                loadInfo2.loader = new HttpLoader;
                let respType;
                let resType = s.typeSelector(fileLocalPath);
                if (resType == ResourceItem.TYPE_IMAGE || resType == ResourceItem.TYPE_SOUND || resType == ResourceItem.TYPE_BIN) {
                    respType = "arraybuffer";
                    loadInfo2.buffer = fileByteArray.buffer;
                }
                else {
                    loadInfo2.buffer = fileByteArray.readUTFBytes(fileLength);
                }
                loadInfo2.responseType = respType;
                resGroup.loadInfoArray.push(loadInfo2);
                let decodeFun = s.decodeFunction(resType);
                if (decodeFun) {
                    decodeFun.call(s, loadInfo2);
                }
                else {
                    console.log("无法解析资源类型：" + fileLocalPath);
                }
            }
        }
        decodeIMAGE(loadInfo) {
            let s = this;
            let data = loadInfo.loader.response || loadInfo.buffer;
            s._loadHtmlImage("arraybuffer", data, s, (img) => {
                let tex = new Laya.Texture2D(img.width, img.height, 1, false, false);
                tex.wrapModeU = ResourceItem.WarpMode.Clamp;
                tex.wrapModeV = ResourceItem.WarpMode.Clamp;
                tex.loadImageSource(img, true);
                tex._setCreateURL(img.src);
                var res = new Laya.Texture(tex);
                res.url = loadInfo.url;
                let obj = ResourceItem.ResObject.getResObject();
                obj.pathKey = loadInfo.url;
                obj.type = ResourceItem.TYPE_IMAGE;
                obj.res = res;
                obj.buffer = data;
                s.setRes(obj.pathKey, obj, loadInfo);
            });
        }
        _loadHtmlImage(type, data, onLoadCaller, onLoad, onErrorCaller = null, onError = null) {
            var image;
            function clear() {
                var img = image;
                img.onload = null;
                img.onerror = null;
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
            var imageType = "image/png";
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
            image.onload = onload;
            image.onerror = onerror;
        }
        decodeSOUND(loadInfo) {
            let s = this;
            let buff = loadInfo.loader.response || loadInfo.buffer;
            s._loadSound(buff, loadInfo);
        }
        _loadSound(buff, loadInfo) {
            let _file = new File([buff], "");
            let obj_url = window.URL.createObjectURL(_file);
            var sound = (new Laya.SoundManager["_soundClass"]);
            var _this = this;
            sound.on(Laya.Event.COMPLETE, this, soundOnload);
            sound.on(Laya.Event.ERROR, this, soundOnErr);
            sound.load(obj_url);
            function soundOnload() {
                clear();
                let obj = ResourceItem.ResObject.getResObject();
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
        base64ToBlob(base64, fileType) {
            let typeHeader = 'data:application/' + fileType + ';base64,';
            let audioSrc = typeHeader + base64;
            let arr = audioSrc.split(',');
            let array = arr[0].match(/:(.*?);/);
            let mime = (array && array.length > 1 ? array[1] : fileType) || fileType;
            let bytes = window.atob(arr[1]);
            let ab = new ArrayBuffer(bytes.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i);
            }
            return new Blob([ab], {
                type: mime
            });
        }
        decodeXML(loadInfo) {
            let s = this;
            let data = loadInfo.loader.response || loadInfo.buffer;
            let res = data;
            let obj = ResourceItem.ResObject.getResObject();
            obj.pathKey = loadInfo.url;
            obj.type = ResourceItem.TYPE_XML;
            obj.res = res;
            obj.buffer = data;
            s.setRes(obj.pathKey, obj, loadInfo);
        }
        decodeJSON(loadInfo) {
            let s = this;
            let data = loadInfo.loader.response || loadInfo.buffer;
            let res = JSON.parse(data);
            let obj = ResourceItem.ResObject.getResObject();
            obj.pathKey = loadInfo.url;
            obj.type = ResourceItem.TYPE_JSON;
            obj.res = res;
            obj.buffer = data;
            s.setRes(obj.pathKey, obj, loadInfo);
        }
        decodeTEXT(loadInfo) {
            let s = this;
            let data = loadInfo.loader.response || loadInfo.buffer;
            let obj = ResourceItem.ResObject.getResObject();
            obj.pathKey = loadInfo.url;
            obj.type = ResourceItem.TYPE_TEXT;
            obj.res = data;
            obj.buffer = data;
            s.setRes(obj.pathKey, obj, loadInfo);
        }
        decodeFONT() {
            let s = this;
        }
        decodeBIN(loadInfo) {
            let s = this;
            let res = loadInfo.loader.response || loadInfo.buffer;
            let obj = ResourceItem.ResObject.getResObject();
            obj.pathKey = loadInfo.url;
            obj.type = ResourceItem.TYPE_BIN;
            obj.res = res;
            obj.buffer = res;
            s.setRes(obj.pathKey, obj, loadInfo);
        }
        decodeATLAS(loadInfo) {
            let s = this;
            let res = loadInfo.loader.response || loadInfo.buffer;
            let obj = ResourceItem.ResObject.getResObject();
            obj.pathKey = loadInfo.url;
            obj.type = ResourceItem.TYPE_ATLAS;
            obj.res = res;
            obj.buffer = res;
            s.setRes(obj.pathKey, obj, loadInfo);
        }
        decodeMovieClip(text) {
            let s = this;
            let mcData = JSON.parse(text);
        }
        setRes(url, res, loadInfo = null) {
            let s = this;
            if (s.resDict[url]) {
                s.resDict[url].clear();
            }
            s.resDict[url] = res;
            if (loadInfo) {
                console.log("单个资源加载完成:" + loadInfo.url);
                if (loadInfo.resGroup) {
                    loadInfo.resGroup.resNum -= 1;
                    if (loadInfo.resGroup.resNum <= 0) {
                        console.log("组资源加载完成:" + loadInfo.resGroup.groupName);
                        loadInfo.resGroup.status = 1;
                        if (loadInfo.resGroup.callBack) {
                            loadInfo.resGroup.callBack.call(loadInfo.resGroup.funObj, loadInfo.resGroup);
                        }
                    }
                }
                else {
                    if (loadInfo && loadInfo.callBack) {
                        loadInfo.callBack.call(loadInfo.funObj, loadInfo);
                    }
                }
            }
        }
        getRes(key, aliasKey = null) {
            var s = this;
            if (aliasKey === void 0) {
                aliasKey = null;
            }
            var res;
            if (aliasKey == null)
                res = s.resDict[key];
            else {
                var arr = void 0;
                key = aliasKey + "$" + key;
                res = s.resDict[key];
                if (res == null) {
                    var textureRes = void 0;
                    textureRes = s.resDict[aliasKey];
                    if (textureRes) {
                        if (textureRes.param == null) {
                            var jsonRes = s.getRes(aliasKey.replace(".png", ".json"));
                            if (jsonRes) {
                                textureRes.param = { sheet: textureRes.res, json: jsonRes, subRes: [] };
                                var data = jsonRes.res;
                                var frames_1 = data.frames;
                                for (var subkey in frames_1) {
                                    var config = frames_1[subkey];
                                    var texture = Laya.Texture.create(textureRes.res, config.x, config.y, config.w, config.h, config.offX, config.offY, config.sourceW, config.sourceH);
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
        getResData(key, alias = null) {
            let s = this;
        }
        getResGroup(key) {
            let s = this;
            let resGroup = [];
            if (key == null) {
                console.log("key为空");
                return resGroup;
            }
            ;
            let ind;
            for (let key2 in s.resDict) {
                ind = key2.indexOf(key);
                if (ind > -1) {
                    resGroup.push(s.resDict[key2]);
                }
            }
            return resGroup;
        }
        getTexture(imageName) {
            let s = this;
            let tex = s.getRes(imageName).res;
            return tex;
        }
        typeSelector(path) {
            const ext = path.substr(path.lastIndexOf(".") + 1);
            let type;
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
        decodeFunction(type) {
            let s = this;
            let processorMap = {
                "image": s.decodeIMAGE,
                "json": s.decodeJSON,
                "text": s.decodeTEXT,
                "xml": s.decodeXML,
                "font": s.decodeJSON,
                "bin": s.decodeBIN,
                "sound": s.decodeSOUND,
                "movieclip": s.decodeMovieClip,
                "atlas": s.decodeATLAS,
                "pkg": s.decodePackageRes
            };
            return processorMap[type];
        }
    }
    ResLoader.loadHashCode = 1;

    class StringUtil {
        static dump(array) {
            var s = "";
            var a = "";
            for (var i = 0; i < array.length; i++) {
                if (i % 16 == 0)
                    s += ("0000" + i.toString(16)).substring(-4, 4) + " ";
                if (i % 8 == 0)
                    s += " ";
                var v = array[i].getInt32();
                s += ("0" + v.toString(16)).substring(-2, 2) + " ";
                if (((i + 1) % 16) == 0 || i == (array.length - 1)) {
                    s += " |" + a + "|\n";
                    a = "";
                }
            }
            return s;
        }
        static isUsage(value) {
            if (value == undefined || value == null || value == "" || value == "undefined" || value.trim() == "") {
                return false;
            }
            return true;
        }
        static randomRange(start, end = 0) {
            return Math.floor(start + (Math.random() * (end - start)));
        }
        static changToMoney(value, hasSign = false) {
            var i = 0;
            var count = 0;
            var str = "";
            if (hasSign) {
                if (value.charCodeAt(0) >= 48 && value.charCodeAt(0) <= 57) {
                    value = "+" + value;
                }
            }
            for (i = value.length - 1; i >= 0; i--) {
                str = value.charAt(i) + str;
                if (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) {
                    if (value.charCodeAt(i - 1) >= 48 && value.charCodeAt(i - 1) <= 57) {
                        count++;
                        if (count == 3) {
                            str = "," + str;
                            count = 0;
                        }
                    }
                }
                else {
                    count = 0;
                }
            }
            return str;
        }
        static getMatchesCount(subString, source) {
            var count = 0;
            var lastIndex = source.lastIndexOf(subString);
            var currentIndex = source.indexOf(subString);
            if (currentIndex == lastIndex && lastIndex >= 0) {
                return 1;
            }
            else if (currentIndex != lastIndex && lastIndex >= 0) {
                ++count;
                while (currentIndex != lastIndex) {
                    currentIndex = source.indexOf(subString, currentIndex + subString.length - 1);
                    if (currentIndex != -1) {
                        ++count;
                    }
                }
            }
            return count;
        }
        static changeIntToText(value = 0) {
            var str = "";
            if (value >= 10000) {
                str += Math.ceil(value / 10000).toFixed(0) + "万";
            }
            else if (value < 0) {
                str += "0";
            }
            else {
                str += value.toFixed(0);
            }
            return str;
        }
        static convertColor2Html(color = 0) {
            var colorHtml = "#000000";
            var colorTemp = "";
            try {
                colorTemp = color.toString(16);
                while (colorTemp.length < 6) {
                    colorTemp = "0" + colorTemp;
                }
                colorHtml = "#" + colorTemp;
            }
            catch (err) {
            }
            return colorHtml;
        }
        static htmlESC(value) {
            if (!StringUtil.isUsage(value)) {
                return null;
            }
            else {
                var ampPattern = /&/g;
                var ltPattern = /</g;
                var gtPattern = />/g;
                value = value.replace(ampPattern, "&amp;");
                value = value.replace(ltPattern, "&lt;");
                value = value.replace(gtPattern, "&gt;");
                return value;
            }
        }
        static replaceNumberToArray(value) {
            var numVector = new Array();
            var str = value.toString();
            var len = str.length;
            for (var i = 0; i < len; i++) {
                numVector.push(str.charAt(i));
            }
            return numVector;
        }
        static replace(content, src, target) {
            if (!StringUtil.isUsage(content))
                return "";
            while (content.indexOf(src) >= 0)
                content = content.replace(src, target);
            return content;
        }
        static splitStrArr(str, split) {
            var result = [];
            if (StringUtil.isUsage(str)) {
                var sd = str.split(split);
                for (var i = 0; i < sd.length; i++) {
                    if (StringUtil.isUsage(sd[i])) {
                        result.push(sd[i]);
                    }
                }
            }
            return result;
        }
        static parserStrToObj(str, item = null, kvSplit = "@", split = ";") {
            var obj = {};
            if (item)
                obj = item;
            if (!StringUtil.isUsage(str))
                return obj;
            var result1 = StringUtil.splitStrArr(str, split);
            var keyvalue = null;
            for (var i = 0; i < result1.length; i++) {
                keyvalue = StringUtil.splitStrArr(result1[i], kvSplit);
                if (keyvalue.length == 2) {
                    var typeValue = typeof (obj[keyvalue[0]]);
                    if (typeValue == "number") {
                        obj[keyvalue[0]] = parseInt(keyvalue[1]);
                    }
                    else if (typeValue == "boolean") {
                        obj[keyvalue[0]] = keyvalue[1] == "true";
                    }
                    else {
                        if (obj[keyvalue[0]] instanceof Array) {
                            obj[keyvalue[0]] = StringUtil.splitStrArr(keyvalue[1], ",");
                        }
                        else {
                            obj[keyvalue[0]] = keyvalue[1];
                        }
                    }
                }
            }
            return obj;
        }
        static parserObjToStr(obj, kvSplit = "@", split = ";") {
            var str = "";
            for (var key in obj) {
                if (key != "__class__" && key != "hashCode" && key != "__types__" && key != "__proto__") {
                    if (!(obj[key] instanceof Function)) {
                        str += key + kvSplit + obj[key] + split;
                    }
                }
            }
            return str;
        }
        static isPhone(str) {
            if (StringUtil.isUsage(str) && str.length == 11) {
                var num = parseInt(str);
                if (("" + num) == str) {
                    return true;
                }
            }
            return false;
        }
        static formatTime(timer, formate = ":") {
            var str = "";
            var minute = Math.floor(timer / 60);
            if (minute < 10) {
                str = "0" + minute;
            }
            else {
                str = "" + minute;
            }
            str += formate;
            var second = Math.floor(timer % 60);
            if (second < 10) {
                str += "0" + second;
            }
            else {
                str += "" + second;
            }
            return str;
        }
        static dateFormat(date, fmt) {
            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
    }

    class Global {
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
            Object.defineProperty(prototype, "__class__", {
                value: className,
                enumerable: false,
                writable: true
            });
            return className;
        }
        static is(obj, type) {
            if (obj) {
                var prototype = obj.prototype ? obj.prototype : Object.getPrototypeOf(obj);
                var typeName;
                while (prototype) {
                    typeName = prototype.constructor.name;
                    if (type.includes(typeName)) {
                        return true;
                    }
                    obj = prototype["__proto__"];
                    if (!obj)
                        return false;
                    prototype = obj.prototype ? obj.prototype : Object.getPrototypeOf(obj);
                }
                return false;
            }
            return false;
        }
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
        static spliceColor(color) {
            let result = { r: -1, g: -1, b: -1 };
            result.b = color % 256;
            result.g = Math.floor((color / 256)) % 256;
            result.r = Math.floor((color / 256) / 256);
            return result;
        }
        static convertNumberToHex(r, g, b) {
            var strHex = "";
            var r1 = r.toString(16);
            if (r1.length == 1 || r1 === "0")
                r1 = "0" + r1;
            var g1 = g.toString(16);
            if (g1.length == 1 || g1 === "0")
                g1 = "0" + g1;
            var b1 = b.toString(16);
            if (b1.length == 1 || b1 === "0")
                b1 = "0" + b1;
            strHex = "0x" + r1 + g1 + b1;
            return parseInt(strHex);
        }
        static convertNumberToColor(r, g, b) {
            var strHex = "";
            var r1 = r.toString(16);
            if (r1.length == 1 || r1 === "0")
                r1 = "0" + r1;
            var g1 = g.toString(16);
            if (g1.length == 1 || g1 === "0")
                g1 = "0" + g1;
            var b1 = b.toString(16);
            if (b1.length == 1 || b1 === "0")
                b1 = "0" + b1;
            strHex = "#" + r1 + g1 + b1;
            return strHex;
        }
    }
    Global.FRAME_RATE = 30;
    Global.STATS_BTN = false;
    Global.getDefinitionByNameCache = {};

    class BasicUIEvent extends Laya.EventDispatcher {
        constructor(type = "", data = null, currentTarget = null) {
            super();
            this.type = type;
            this.data = data;
            this.currentTarget = currentTarget;
        }
    }
    BasicUIEvent.MOUSE_OVER = "event-over";
    BasicUIEvent.MOUSE_OUT = "event-out";
    BasicUIEvent.MOUSE_DOWN = "event-down";
    BasicUIEvent.MOUSE_MOVE = "event-move";
    BasicUIEvent.MOUSE_UP = "event-up";
    BasicUIEvent.CLICK = "event-click";
    BasicUIEvent.CHANGE = "change";
    BasicUIEvent.COMPLETE = "complete";
    BasicUIEvent.ERROR = "error";
    BasicUIEvent.RENDER_COMPLETE = "render complete";
    BasicUIEvent.UPDATE = "update";
    BasicUIEvent.START = "start";
    BasicUIEvent.MOVE = "move";
    BasicUIEvent.OVER = "over";
    BasicUIEvent.PAUSE = "pause";
    BasicUIEvent.STOP = "stop";
    BasicUIEvent.PLAY = "play";
    BasicUIEvent.OPEN = "open";
    BasicUIEvent.CLOSE = "close";
    BasicUIEvent.ITEM_SELECTED = "ITEM_SELECTED";
    BasicUIEvent.TOUCH_BEGIN = Laya.Event.MOUSE_DOWN;
    BasicUIEvent.TOUCH_MOVE = Laya.Event.MOUSE_MOVE;
    BasicUIEvent.TOUCH_END = Laya.Event.MOUSE_UP;
    BasicUIEvent.TOUCH_RELEASE_OUTSIDE = Laya.Event.MOUSE_OUT;

    class TextField extends Laya.Text {
    }
    ;
    class Sprite extends Laya.Sprite {
    }
    ;
    class DisplayObjectContainer extends Laya.Sprite {
    }
    ;
    class Point extends Laya.Point {
    }
    ;
    class Rectangle extends Laya.Rectangle {
    }
    ;
    class Texture extends Laya.Texture {
    }
    ;
    class Stage extends Laya.Stage {
    }
    ;
    class Tween extends Laya.Tween {
    }
    ;
    class Ease extends Laya.Ease {
    }
    ;
    class Event extends Laya.Event {
    }
    ;
    class SimpleLayout {
        static displayRank(array, xNum = 1, xDis = 0, yDis = 0, x = 0, y = 0, sign = 1) {
            var display;
            for (var i = 0; i < array.length; i++) {
                display = array[i];
                display.x = x + Math.floor(i % xNum) * (display.width + xDis) * sign;
                display.y = y + Math.floor(i / xNum) * (display.height + yDis) * sign;
            }
        }
    }

    class BasicGroup extends Sprite {
        constructor() {
            super();
            this._isAddedToStage = false;
            this._top = NaN;
            this._left = NaN;
            this._bottom = NaN;
            this._right = NaN;
            this._horizontalCenter = NaN;
            this._verticalCenter = NaN;
            this._hasInvalidatePosition = false;
            this._drawDelay = false;
            this._hasInvalidate = false;
            this._enabled = true;
            this._data = null;
            this.dataEvent = new Object;
            this.elements = [];
            this.hashCode = 0;
            let s = this;
            s.hashCode = ++BasicGroup.$hashCode;
        }
        onEnable() {
            super.onEnable();
            let s = this;
            s._isAddedToStage = true;
            s.createChildren();
            s.initData();
            s.onInvalidatePosition();
            s.invalidate();
        }
        onDisable() {
            super.onDisable();
        }
        createChildren() {
            let s = this;
        }
        initData() {
        }
        set width(w) {
            if (w >= 0) {
                super.set_width(w);
                this.onInvalidatePosition();
                this.invalidate();
            }
        }
        get width() {
            return this.get_width();
        }
        set height(h) {
            if (h >= 0) {
                super.set_height(h);
                this.onInvalidatePosition();
                this.invalidate();
            }
        }
        get height() {
            return this.get_height();
        }
        setSize(w, h) {
            let s = this;
            if (s.width != w || s.height != h) {
                s.width = w;
                s.height = h;
                s.onInvalidatePosition();
                s.invalidate();
            }
        }
        get top() {
            return this._top;
        }
        set top(value) {
            let s = this;
            if (s._top != value) {
                s._top = value;
                s.onInvalidatePosition();
            }
        }
        get left() {
            return this._left;
        }
        set left(value) {
            let s = this;
            if (s._left != value) {
                s._left = value;
                s.onInvalidatePosition();
            }
        }
        get bottom() {
            return this._bottom;
        }
        set bottom(value) {
            let s = this;
            if (s._bottom != value) {
                s._bottom = value;
                s.onInvalidatePosition();
            }
        }
        get right() {
            return this._right;
        }
        set right(value) {
            let s = this;
            if (s._right != value) {
                s._right = value;
                s.onInvalidatePosition();
            }
        }
        get horizontalCenter() {
            return this._horizontalCenter;
        }
        set horizontalCenter(value) {
            let s = this;
            if (s._horizontalCenter != value) {
                s._horizontalCenter = value;
                s.onInvalidatePosition();
            }
        }
        get verticalCenter() {
            return this._verticalCenter;
        }
        set verticalCenter(value) {
            let s = this;
            if (s._verticalCenter != value) {
                s._verticalCenter = value;
                s.onInvalidatePosition();
            }
        }
        onInvalidatePosition() {
            let s = this;
            if (!s._hasInvalidatePosition) {
                s._hasInvalidatePosition = true;
                Laya.timer.frameLoop(1, s, s.resetPosition);
                let child;
                for (var i = 0; i < s.numChildren; i++) {
                    child = s.getChildAt(i);
                    if (child instanceof BasicGroup) {
                        child.onInvalidatePosition();
                    }
                }
            }
        }
        resetPosition() {
            let s = this;
            var pr = s.parent;
            if (pr != null) {
                var parentWidth = pr.width;
                var parentHeight = pr.height;
                var thisWidth = s.width;
                var thisHeight = s.height;
                if (isNaN(parentWidth) || parentHeight == undefined) {
                    parentWidth = 0;
                }
                if (isNaN(parentHeight) || parentHeight == undefined) {
                    parentHeight = 0;
                }
                if (isNaN(thisWidth) || thisWidth == undefined) {
                    thisWidth = 0;
                }
                if (isNaN(thisHeight) || thisHeight == undefined) {
                    thisWidth = 0;
                }
                var widthChanged = false;
                var heightChanged = false;
                if (!isNaN(s._top) && isNaN(s._bottom)) {
                    s.y = s._top;
                }
                else if (!isNaN(s._bottom) && isNaN(s._top)) {
                    s.y = parentHeight - s._bottom - thisHeight;
                }
                else if (!isNaN(s._top) && !isNaN(s._bottom)) {
                    s.y = s._top;
                    thisHeight = parentHeight - s._top - s._bottom;
                    if (s.height != thisHeight) {
                        s.height = thisHeight;
                        heightChanged = true;
                    }
                }
                if (!isNaN(s._left) && isNaN(s._right)) {
                    s.x = s._left;
                }
                else if (!isNaN(s._right) && isNaN(s.left)) {
                    s.x = parentWidth - s._right - thisWidth;
                }
                else if (!isNaN(s.left) && !isNaN(s._right)) {
                    s.x = s._left;
                    thisWidth = parentWidth - s._left - s._right;
                    if (s.width != thisWidth) {
                        s.width = thisWidth;
                        widthChanged = true;
                    }
                }
                if (!isNaN(s._horizontalCenter) && !widthChanged) {
                    s.x = (parentWidth - thisWidth) / 2 + s._horizontalCenter;
                }
                if (!isNaN(s._verticalCenter) && !heightChanged) {
                    s.y = (parentHeight - thisHeight) / 2 + s._verticalCenter;
                }
                if (s.elements.length > 0) {
                    for (let i = 0; i < s.elements.length; ++i) {
                        super.addChild(s.elements[i]);
                    }
                    s.elements.length = 0;
                }
                let child;
                for (let i = 0, num = s.numChildren; i < num; i++) {
                    child = s.getChildAt(i);
                    if ((widthChanged || heightChanged) && Global.is(child, "BasicGroup")) {
                        child.onInvalidatePosition();
                    }
                    else {
                        if (Global.is(child, "Laya.UIComponent")) {
                            BasicGroup.resetChildPosition(child);
                        }
                    }
                }
            }
            Laya.timer.clear(s, s.resetPosition);
            s._hasInvalidatePosition = false;
        }
        static resetChildPosition(child) {
            var pr = child.parent;
            if (pr != null && child['top'] !== undefined && child['bottom'] !== undefined && child['left'] !== undefined && child['right'] !== undefined && child['horizontalCenter'] !== undefined && child['verticalCenter'] !== undefined) {
                var parentWidth = pr.width;
                var parentHeight = pr.height;
                var thisWidth = child.width;
                var thisHeight = child.height;
                if (isNaN(parentWidth) || parentHeight == undefined) {
                    parentWidth = 0;
                }
                if (isNaN(parentHeight) || parentHeight == undefined) {
                    parentHeight = 0;
                }
                if (isNaN(thisWidth) || thisWidth == undefined) {
                    thisWidth = 0;
                }
                if (isNaN(thisHeight) || thisHeight == undefined) {
                    thisWidth = 0;
                }
                var widthChanged = false;
                var heightChanged = false;
                if (!isNaN(child['top']) && isNaN(child['bottom'])) {
                    child.y = child['top'];
                }
                else if (!isNaN(child['bottom']) && isNaN(child['top'])) {
                    child.y = parentHeight - child['bottom'] - thisHeight;
                }
                else if (!isNaN(child['top']) && !isNaN(child['bottom'])) {
                    child.y = child['top'];
                    thisHeight = parentHeight - child['top'] - child['bottom'];
                    if (child.height != thisHeight) {
                        child.height = thisHeight;
                        heightChanged = true;
                    }
                }
                if (!isNaN(child['left']) && isNaN(child['right'])) {
                    child.x = child['left'];
                }
                else if (!isNaN(child['right']) && isNaN(child['left'])) {
                    child.x = parentWidth - child['right'] - thisWidth;
                }
                else if (!isNaN(child['left']) && !isNaN(child['right'])) {
                    child.x = child['left'];
                    thisWidth = parentWidth - child['left'] - child['right'];
                    if (child.width != thisWidth) {
                        child.width = thisWidth;
                        widthChanged = true;
                    }
                }
                if (!isNaN(child['horizontalCenter']) && !widthChanged) {
                    child.x = (parentWidth - thisWidth) / 2 + child['horizontalCenter'];
                }
                if (!isNaN(child['verticalCenter']) && !heightChanged) {
                    child.y = (parentHeight - thisHeight) / 2 + child['verticalCenter'];
                }
                if (widthChanged || heightChanged) {
                    if (child.numChildren == undefined)
                        return;
                    let temp;
                    for (let i = 0, num = child.numChildren; i < num; i++) {
                        temp = child.getChildAt(i);
                        if (temp instanceof BasicGroup) {
                            temp.onInvalidatePosition();
                        }
                        else {
                            BasicGroup.resetChildPosition(temp);
                        }
                    }
                }
            }
        }
        addChild(child) {
            let s = this;
            if (child.parent === s) {
                console.warn("子元素不能重复添加到同一个父级节点中");
                return;
            }
            if (Global.is(child, "Laya.UIComponent")) {
                if (s.elements.indexOf(child) >= 0) {
                    console.warn("子元素不能重复添加到同一个父级节点中");
                    return;
                }
                s.elements.push(child);
            }
            else {
                super.addChild(child);
            }
            s.onInvalidatePosition();
        }
        addEventListener(type, listener, thisObject, useCapture, priority) {
            this.on(type, thisObject, listener);
        }
        removeEventListener(type, listener, thisObject, useCapture) {
            this.off(type, thisObject, listener);
        }
        dispatchEventWith(type, bubbles, data, cancelable) {
            this.event(type, data);
            return true;
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
        }
        clean() {
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._enabled = value;
        }
        get cx() {
            return this.width / 2;
        }
        get cy() {
            return this.height / 2;
        }
        getGlobalXY() {
            let s = this;
            let point = new Point(s.pivotX, s.pivotY);
            this.localToGlobal(point, false);
            return point;
        }
        get actualWidth() {
            return this.width * this.scaleX;
        }
        get actualHeight() {
            return this.height * this.scaleX;
        }
        invalidate() {
            let s = this;
            if (!s._hasInvalidate && !s._drawDelay) {
                Laya.timer.frameLoop(1, s, s.onInvalidate);
                s._hasInvalidate = true;
            }
        }
        onInvalidate(event) {
            let s = this;
            s.draw();
            Laya.timer.clear(s, s.onInvalidate);
            s._hasInvalidate = false;
        }
        draw() {
        }
        set drawDelay(delay) {
            let s = this;
            s._drawDelay = delay;
            if (s._drawDelay) {
                s.off(Laya.Event.FRAME, s, s.onInvalidate);
                s._hasInvalidate = false;
            }
            else {
                s.invalidate();
            }
        }
        get drawDelay() {
            return this._drawDelay;
        }
        get isAddedToStage() {
            return this._isAddedToStage;
        }
        dispEvent(type, data = null) {
            if (this.dataEvent) {
                var fun = this.dataEvent[type];
                if (fun != null) {
                    var evt = new BasicUIEvent;
                    evt.currentTarget = this;
                    evt.data = data;
                    evt.type = type;
                    if (fun["this"]) {
                        fun.apply(fun["this"], [evt]);
                    }
                    else {
                        fun(evt);
                    }
                }
            }
        }
        addEvent(type, listener, thisObj = null) {
            let s = this;
            if (s.dataEvent && s.dataEvent[type] == null) {
                listener["this"] = thisObj;
                s.dataEvent[type] = listener;
            }
        }
        removeEvent(type, listener) {
            let s = this;
            if (s.dataEvent && s.dataEvent[type]) {
                delete s.dataEvent[type];
            }
        }
        removeFromParent(dispose = false) {
            let s = this;
            let _parent = this.parent;
            if (dispose)
                s.dispose();
            if (_parent)
                _parent.removeChild(s);
            _parent = null;
        }
        removeChildAll(dispose = false) {
            let s = this;
            while (s.numChildren > 0) {
                s.removeChildIndex(0, dispose);
            }
        }
        removeChildIndex(index, dispose) {
            let s = this;
            if (index >= 0 || index < s.numChildren) {
                let child = s.getChildAt(index);
                if (child instanceof BasicGroup) {
                    child.removeFromParent(dispose);
                }
                else {
                    let display = this.getChildAt(index);
                    if (display.parent)
                        display.parent.removeChild(display);
                }
            }
        }
        dispose() {
            let s = this;
            s.removeChildAll(true);
        }
        getPixel32(x, y) {
            return null;
        }
        testPixel32(x, y) {
            let s = this;
            var datas = s.getPixel32(x, y);
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    return true;
                }
            }
            return false;
        }
    }
    BasicGroup.$hashCode = 0;

    class UIColor {
        static get random() { return Math.random() * 0XFFFFFF; }
        ;
        static get white() { return 0XFFFFFF; }
        ;
        static get black() { return 0X000000; }
        ;
        static get gray() { return 0X666666; }
        ;
        static get red() { return 0XFF0000; }
        ;
        static get green() { return 0X00FF00; }
        ;
        static get blue() { return 0X0000FF; }
        ;
        static get skinNormal() { return 0X15191C; }
        ;
        static get skinDown() { return 0X999999; }
        ;
        static get titleBackground() { return 0X20262B; }
        ;
        static getRandomColors(count) {
            var colors = [];
            for (var i = 0; i < count; i++)
                colors.push(Math.random() * 0XFFFFFF);
            return colors;
        }
        ;
        static lightenDarkenColor(color, value) {
            var r = (color >> 16) + value;
            if (r > 255)
                r = 255;
            else if (r < 0)
                r = 0;
            var b = ((color >> 8) & 0x00FF) + value;
            if (b > 255)
                b = 255;
            else if (b < 0)
                b = 0;
            var g = (color & 0x0000FF) + value;
            if (g > 255)
                g = 255;
            else if (g < 0)
                g = 0;
            return (g | (b << 8) | (r << 16));
        }
        static convertColor(color) {
            if (typeof color == "number") {
                let c1 = Global.spliceColor(color);
                let tempColor = Global.convertNumberToColor(c1.r, c1.g, c1.b);
                return tempColor;
            }
            else {
                return color;
            }
        }
    }

    class ObjectPool {
        static getByClass(clz, flag = "", pop = true) {
            var key = Global.getQualifiedClassName(clz);
            key = flag + key;
            var item = ObjectPool.getObject(key, pop);
            if (item == null)
                item = new clz();
            if (!pop) {
                ObjectPool.recycleClass(item, flag);
            }
            return item;
        }
        static recycleClass(obj, flag = "") {
            if (!obj)
                return;
            var key = Global.getQualifiedClassName(obj);
            key = flag + key;
            ObjectPool.recycleObject(key, obj);
        }
        static hasClass(clz, flag = "") {
            return ObjectPool.getByClass(clz, flag, false);
        }
        static getObject(name, pop = true) {
            if (ObjectPool._dataPool.hasOwnProperty(name) && ObjectPool._dataPool[name].length > 0) {
                var obj = null;
                if (pop) {
                    obj = ObjectPool._dataPool[name].pop();
                    if (ObjectPool._dataPool[name].length == 0)
                        delete ObjectPool._dataPool[name];
                }
                else {
                    obj = ObjectPool._dataPool[name][0];
                }
                return obj;
            }
            return null;
        }
        static setObject(name, item) {
            ObjectPool.recycleObject(name, item);
        }
        static recycleObject(name, item) {
            if (!item)
                return;
            if (!ObjectPool._dataPool.hasOwnProperty(name)) {
                ObjectPool._dataPool[name] = [];
            }
            if (item.hasOwnProperty("destroy"))
                item.destroy();
            if (ObjectPool._dataPool[name].indexOf(item) < 0) {
                ObjectPool._dataPool[name].push(item);
            }
        }
        static hasObject(name) {
            return ObjectPool.getObject(name, false);
        }
        static dispose(clz) {
            var key = Global.getQualifiedClassName(clz);
            ObjectPool.disposeObjects(key);
        }
        static disposeObjects(name) {
            if (ObjectPool._dataPool.hasOwnProperty(name)) {
                ObjectPool._dataPool[name].length = 0;
                delete ObjectPool._dataPool[name];
            }
        }
    }
    ObjectPool._dataPool = {};

    class Style {
        constructor() {
        }
        static setStyle(style) {
            switch (style) {
                case Style.DARK:
                    Style.BACKGROUND = 0x444444;
                    Style.BUTTON_FACE = 0x666666;
                    Style.BUTTON_DOWN = 0x222222;
                    Style.INPUT_TEXT = 0xBBBBBB;
                    Style.LABEL_TEXT = 0xCCCCCC;
                    Style.PANEL = 0x666666;
                    Style.PROGRESS_BAR = 0x666666;
                    Style.TEXT_BACKGROUND = 0x555555;
                    Style.LIST_DEFAULT = 0x444444;
                    Style.LIST_ALTERNATE = 0x393939;
                    Style.LIST_SELECTED = 0x666666;
                    Style.LIST_ROLLOVER = 0x777777;
                    break;
                case Style.LIGHT:
                default:
                    Style.BACKGROUND = 0xCCCCCC;
                    Style.BUTTON_FACE = 0xFFFFFF;
                    Style.BUTTON_DOWN = 0xEEEEEE;
                    Style.INPUT_TEXT = 0x333333;
                    Style.LABEL_TEXT = 0x666666;
                    Style.PANEL = 0xF3F3F3;
                    Style.PROGRESS_BAR = 0xFFFFFF;
                    Style.TEXT_BACKGROUND = 0xFFFFFF;
                    Style.LIST_DEFAULT = 0xFFFFFF;
                    Style.LIST_ALTERNATE = 0xF3F3F3;
                    Style.LIST_SELECTED = 0xCCCCCC;
                    Style.LIST_ROLLOVER = 0xDDDDDD;
                    break;
            }
        }
    }
    Style.TEXT_BACKGROUND = 0xFFFFFF;
    Style.BACKGROUND = 0xCCCCCC;
    Style.BUTTON_FACE = 0xFFFFFF;
    Style.BUTTON_DOWN = 0xEEEEEE;
    Style.INPUT_TEXT = 0x333333;
    Style.LABEL_TEXT = 0x000000;
    Style.BUTTON_TEXT = 0x666666;
    Style.DROPSHADOW = 0x000000;
    Style.PANEL = 0xF3F3F3;
    Style.PROGRESS_BAR = 0xFFFFFF;
    Style.LIST_DEFAULT = 0xFFFFFF;
    Style.LIST_ALTERNATE = 0xF3F3F3;
    Style.LIST_SELECTED = 0xCCCCCC;
    Style.LIST_ROLLOVER = 0XDDDDDD;
    Style.BUTTON_DEFAULT_WIDTH = 100;
    Style.BUTTON_DEFAULT_HEIGHT = 32;
    Style.VIDEO_DEFAULT_WIDTH = 320;
    Style.VIDEO_DEFAULT_HEIGHT = 250;
    Style.embedFonts = false;
    Style.fontName = null;
    Style.fontSize = 26;
    Style.DARK = "dark";
    Style.LIGHT = "light";
    Style.TEXTINPUT_HEIGHT = 25;
    Style.TEXTINPUT_WIDTH = 100;
    Style.TEXTINPUT_COLOR = 0xffffff;
    Style.HORIZONTAL = "horizontal";
    Style.VERTICAL = "vertical";
    Style.FREE = "free";
    Style.SLIDER_WIDTH = 300;
    Style.SLIDER_HEIGHT = 17;
    Style.SCROLLBAR_WIDTH = 300;
    Style.SCROLLBAR_HEIGHT = 17;
    Style.BASEGROUP_WIDTH = 100;
    Style.BASEGROUP_HEIGHT = 100;
    Style.REPEAT = "repeat";
    Style.SCALE = "scale";
    Style.CLIP = "clip";

    class Image$1 extends BasicGroup {
        constructor() {
            super();
            this._bitmap = null;
            this._texture = null;
            this.scale9RectData = [];
            this._fillMode = Style.SCALE;
            this._smoothing = false;
            this.explicitWidth = NaN;
            this.explicitHeight = NaN;
            this._bitmap = new Sprite;
            this.addChild(this._bitmap);
        }
        createChildren() {
            super.createChildren();
        }
        get fillMode() {
            return this._fillMode;
        }
        set fillMode(value) {
            if (this._fillMode != value) {
                this._fillMode = value;
                this.invalidate();
            }
        }
        get texture() {
            return this._texture;
        }
        set texture(value) {
            let s = this;
            if (s._texture != value) {
                s._texture = value;
                s.draw();
                s.onInvalidatePosition();
            }
        }
        scale9Grid(data = []) {
            let s = this;
            if (data.length == 4) {
                this.scale9RectData = data.concat();
            }
            else {
                this.scale9RectData.length = 0;
            }
            this.invalidate();
        }
        set smoothing(value) {
            if (this._smoothing != value) {
                this._smoothing = value;
                this.invalidate();
            }
        }
        get smoothing() {
            return this._smoothing;
        }
        set width(w) {
            if (w < 0 || w == this.explicitWidth) {
                return;
            }
            this.explicitWidth = w;
            super.set_width(w);
            this.onInvalidatePosition();
            this.invalidate();
        }
        get width() {
            return this.get_width();
        }
        set height(h) {
            if (h < 0 || h == this.explicitHeight) {
                return;
            }
            this.explicitHeight = h;
            super.set_height(h);
            this.onInvalidatePosition();
            this.invalidate();
        }
        get height() {
            return this.get_height();
        }
        draw() {
            let s = this;
            if (!s._bitmap || !s._texture)
                return;
            if (s._bitmap.texture != s._texture) {
                if (s.scale9RectData.length == 4) {
                    s._bitmap.texture = null;
                    s._bitmap.graphics.draw9Grid(s._texture, 0, 0, s._texture.sourceWidth, s._texture.sourceHeight, s.scale9RectData);
                }
                else {
                    s._bitmap.texture = s._texture;
                }
                if (isNaN(s.explicitWidth)) {
                    s.width = s._texture.sourceWidth;
                }
                if (isNaN(s.explicitHeight)) {
                    s.height = s._texture.sourceHeight;
                }
            }
            if (s._fillMode != Style.SCALE) {
                s._bitmap.width = s.width;
                s._bitmap.height = s.height;
            }
            else {
                s._bitmap.scaleX = s.width / s._texture.sourceWidth;
                s._bitmap.scaleY = s.height / s._texture.sourceHeight;
            }
        }
        getBitmap() {
            return this._bitmap;
        }
        getPixel32(x, y) {
            let s = this;
            if (s._bitmap && s._texture) {
                var locolPoint = s.globalToLocal(new Point(x, y), false);
                return s._bitmap.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            return null;
        }
    }

    class Group extends BasicGroup {
        constructor() {
            super();
            this._showBg = false;
            this._bgColor = 0xCCCCCC;
            this._bgImage = null;
            this._bgTexture = null;
            this._scale9GridRect = null;
            this.scale9RectData = [];
            this._fillMode = "scale";
            this._border = false;
            this._clip = true;
            this._touchNonePixel = false;
        }
        createChildren() {
            super.createChildren();
        }
        get bgColor() {
            return this._bgColor;
        }
        set bgColor(value) {
            if (this._bgColor != value && this._showBg) {
                this._bgColor = value;
                this._bgTexture = null;
                this.invalidate();
            }
        }
        get fillMode() {
            return this._fillMode;
        }
        set fillMode(value) {
            if (this._fillMode != value) {
                this._fillMode = value;
                this.invalidate();
            }
        }
        set showBg(value) {
            if (this._showBg != value) {
                this._showBg = value;
                this.invalidate();
            }
        }
        get showBg() {
            return this._showBg;
        }
        set clip(value) {
            if (value != this._clip) {
                this._clip = value;
                this.invalidate();
            }
        }
        get clip() {
            return this._clip;
        }
        draw() {
            let s = this;
            if (s.width == 0 || s.height == 0)
                return;
            super.draw();
            if (s._clip) {
                var rect = ObjectPool.getByClass(Rectangle);
                if (s.scrollRect) {
                    ObjectPool.recycleClass(s.scrollRect);
                    s.scrollRect = null;
                }
                rect.width = s.width;
                rect.height = s.height;
                rect.x = 0;
                rect.y = 0;
                s.scrollRect = rect;
            }
            else {
                s.scrollRect = null;
            }
            if (s._showBg || s._touchNonePixel) {
                s.addDefaultSkin();
                if (s._bgImage) {
                    s._bgImage.visible = true;
                    if (s._touchNonePixel && !s._showBg) {
                        s._bgImage.alpha = 0;
                    }
                    else {
                        s._bgImage.alpha = 1;
                    }
                }
            }
            else {
                if (s._bgImage) {
                    s._bgImage.visible = false;
                    if (s._bgImage.parent) {
                        s._bgImage.parent.removeChild(s._bgImage);
                    }
                }
            }
        }
        addDefaultSkin() {
            let s = this;
            if (s.width > 0 && s.height > 0) {
                if (s._bgImage == null) {
                    s._bgImage = new Image$1;
                }
                if (s._bgTexture == null) {
                    s._bgImage.fillMode = Style.SCALE;
                    var shape = new Sprite;
                    shape.width = s.width;
                    shape.height = s.height;
                    shape.graphics.drawRect(0, 0, s.width, s.height, s._bgColor);
                    var htmlC = shape.drawToCanvas(shape.width, shape.height, 0, 0);
                    s._bgTexture = new Laya.Texture(htmlC.getTexture());
                    s._bgImage.texture = s._bgTexture;
                }
                else {
                    s._bgImage.texture = s._bgTexture;
                }
            }
            if (s._bgImage && (s._showBg || s._touchNonePixel)) {
                if (!s._bgImage.parent)
                    s.addChildAt(s._bgImage, 0);
                if (s.scale9RectData.length == 4) {
                    s._bgImage.scale9Grid(s.scale9RectData);
                }
                else {
                    s._bgImage.scale9Grid = null;
                }
                s._bgImage.width = s.width;
                s._bgImage.height = s.height;
                s._bgImage.fillMode = s._fillMode;
            }
        }
        set border(value) {
            if (this._border != value) {
                this._border = value;
                this.invalidate();
            }
        }
        get border() {
            return this._border;
        }
        getDefaultSkin() {
            return this._bgImage;
        }
        set bgTexture(value) {
            if (this._bgTexture != value) {
                this._bgTexture = value;
                this.invalidate();
            }
        }
        get bgTexture() {
            return this._bgTexture;
        }
        get touchNonePixel() {
            return this._touchNonePixel;
        }
        set touchNonePixel(value) {
            if (value != this._touchNonePixel) {
                this._touchNonePixel = value;
                this.invalidate();
            }
        }
        scale9Grid(scale9RectData = []) {
            let s = this;
            if (scale9RectData.length == 4) {
                this.scale9RectData = scale9RectData.concat();
            }
            else {
                this.scale9RectData.length = 0;
            }
            this.invalidate();
        }
        scale9Rect() {
            let rect = new Rectangle();
            rect.x = 1;
            rect.y = 1;
            rect.width = 1;
            rect.height = 1;
            return rect;
        }
    }

    class Label extends Group {
        constructor() {
            super();
            this._text = "";
            this._textField = null;
            this._fontSize = Style.fontSize;
            this._color = Style.LABEL_TEXT;
            this._fontName = Style.fontName;
            this._hAlign = "left";
            this._vAlign = "middle";
            this._bold = false;
            this._italic = false;
            this._lineSpacing = 0;
            this._multiline = false;
            this._wordWrap = false;
            this._stroke = 0;
            this._strokeColor = 0x003350;
            this._html = false;
            this._autoSize = true;
            this._paddingLeft = 0;
            this._paddingRight = 0;
            this._paddingTop = 0;
            this._paddingBottom = 0;
            this._textField = new TextField();
            this._textField.on(BasicUIEvent.CHANGE, this, this.onTextChange);
            this.addChild(this._textField);
            this.clip = false;
        }
        createChildren() {
            super.createChildren();
        }
        initData() {
            super.initData();
        }
        onTextChange(event) {
            let s = this;
            s._text = s._textField.text;
        }
        get text() {
            return this._text;
        }
        set text(value) {
            let s = this;
            if (s._text != value) {
                s._text = value;
                if (s._html) {
                }
                else {
                    if (s._text == null) {
                        s._text = "";
                    }
                }
                s.draw();
            }
        }
        getTextField() {
            return this._textField;
        }
        draw() {
            let s = this;
            if (s._textField == null)
                return;
            if (s._fontName != null) {
                s._textField.font = s.fontName;
            }
            if (s._color >= 0)
                s._textField.color = UIColor.convertColor(s._color);
            if (s._fontSize > 0)
                s._textField.fontSize = s._fontSize;
            s._textField.bold = s._bold;
            s._textField.italic = s._italic;
            s._textField.stroke = s._stroke;
            s._textField.wordWrap = s._wordWrap;
            if (s._html) {
            }
            else {
                s._textField.text = s._text;
            }
            if (s._autoSize) {
                s.setSize(s._textField.textWidth, s._textField.textHeight);
            }
            else {
                s._textField.width = s.width;
                s._textField.height = s.height;
                let newWidth = s._textField.width - s._paddingLeft - s._paddingRight;
                let newHeight = s._textField.height - s._paddingTop - s._paddingBottom;
                s._textField.width = newWidth;
                s._textField.height = newHeight;
                s._textField.x = s._paddingLeft;
                s._textField.y = s._paddingTop;
            }
            s._textField.align = s._hAlign;
            s._textField.valign = s._vAlign;
            super.draw();
        }
        set paddingLeft(value) {
            if (this._paddingLeft != value) {
                this._paddingLeft = value;
                this.invalidate();
            }
        }
        get paddingLeft() {
            return this._paddingLeft;
        }
        set paddingRight(value) {
            if (this._paddingRight != value) {
                this._paddingRight = value;
                this.invalidate();
            }
        }
        get paddingRight() {
            return this._paddingRight;
        }
        set paddingTop(value) {
            if (this._paddingTop != value) {
                this._paddingTop = value;
                this.invalidate();
            }
        }
        get paddingTop() {
            return this._paddingTop;
        }
        set paddingBottom(value) {
            if (this._paddingBottom != value) {
                this._paddingBottom = value;
                this.invalidate();
            }
        }
        get paddingBottom() {
            return this._paddingBottom;
        }
        get wordWrap() {
            return this._wordWrap;
        }
        set wordWrap(value) {
            if (this._wordWrap != value) {
                this._wordWrap = value;
                this.invalidate();
            }
        }
        set italic(value) {
            if (this._italic != value) {
                this._italic = value;
                this.invalidate();
            }
        }
        get italic() {
            return this._italic;
        }
        set bold(value) {
            if (this._bold != value) {
                this._bold = value;
                this.invalidate();
            }
        }
        get bold() {
            return this._bold;
        }
        set fontName(value) {
            if (this._fontName != value) {
                this._fontName = value;
                this.invalidate();
            }
        }
        get fontName() {
            return this._fontName;
        }
        set fontSize(value) {
            if (this._fontSize != value) {
                this._fontSize = value;
                this.invalidate();
            }
        }
        get fontSize() {
            return this._fontSize;
        }
        set color(value) {
            if (this._color !== value) {
                this._color = value;
                this.invalidate();
            }
        }
        get color() {
            return this._color;
        }
        get lineSpacing() {
            return this._lineSpacing;
        }
        set lineSpacing(value) {
            if (this._lineSpacing != value) {
                this._lineSpacing = value;
                this.invalidate();
            }
        }
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            if (this._multiline != value) {
                this._multiline = value;
                this.invalidate();
            }
        }
        get stroke() {
            return this._stroke;
        }
        set stroke(value) {
            if (this._stroke != value) {
                this._stroke = value;
                this.invalidate();
            }
        }
        get strokeColor() {
            return this._strokeColor;
        }
        set strokeColor(value) {
            if (this._strokeColor != value) {
                this._strokeColor = value;
                this.invalidate();
            }
        }
        get hAlign() {
            return this._hAlign;
        }
        set hAlign(value) {
            if (this._hAlign != value) {
                this._hAlign = value;
                this.invalidate();
            }
        }
        get vAlign() {
            return this._vAlign;
        }
        set vAlign(value) {
            if (this._vAlign != value) {
                this._vAlign = value;
                this.invalidate();
            }
        }
        set html(value) {
            if (this._html != value) {
                this._html = value;
                this.invalidate();
            }
        }
        get html() {
            return this._html;
        }
    }

    class Button extends BasicGroup {
        constructor() {
            super();
            this._verticalSplit = true;
            this._text = "";
            this._label = null;
            this._texture = null;
            this._imgDisplay = null;
            this._textureLabel = null;
            this._imgLabel = null;
            this._textureIcon = null;
            this._imgIcon = null;
            this._initDisplayData = false;
            this._selected = false;
            this.stateArray = [Button.STATUS_UP];
            this._currentState = Button.STATUS_UP;
            this._textureDict = {};
            this._labelMarginLeft = NaN;
            this._labelMarginTop = NaN;
            this._iconMarginLeft = NaN;
            this._iconMarginTop = NaN;
            this._autoSize = false;
            this._labelColor = Style.BUTTON_TEXT;
            this._labelBold = false;
            this._labelItalic = false;
            this._labelLineSpacing = 0;
            this._labelMultiline = false;
            this._labelStroke = 0;
            this._labelStrokeColor = 0x003350;
            this._fontSize = 30;
            this._fontName = null;
            this._scale9GridEnable = false;
            this._scale9GridRect = [];
            this._fillMode = Style.SCALE;
            this._testPixelEnable = false;
        }
        createChildren() {
            super.createChildren();
            let s = this;
            s._imgDisplay = new Image$1;
            s.addChild(s._imgDisplay);
            s._imgDisplay.width = s.width;
            s._imgDisplay.height = s.height;
            s._imgDisplay.fillMode = s._fillMode;
            s._label = new Label();
            s._label.autoSize = true;
            s._label.clip = false;
            s._label.hAlign = "center";
            s._label.vAlign = "middle";
            s._label.showBg = false;
            s.addChild(s._label);
            s.on(BasicUIEvent.TOUCH_BEGIN, s, s.onTouchEvent);
            s.on(BasicUIEvent.TOUCH_END, s, s.onTouchEvent);
            s.on(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, s, s.onTouchReleaseOutside);
        }
        onTouchEvent(event) {
            let s = this;
            if (!s.enabled) {
                event.stopPropagation();
                return;
            }
            if (event.currentTarget == s) {
                if (s._testPixelEnable && !s.testPixel32(s.mouseX, s.mouseX)) {
                    event.stopPropagation();
                    return;
                }
                if (event.type == BasicUIEvent.TOUCH_BEGIN) {
                    s._currentState = Button.STATUS_DOWN;
                    s.onClick();
                    s.onPlaySound();
                }
                else if (event.type == BasicUIEvent.TOUCH_END) {
                    s._currentState = Button.STATUS_UP;
                }
                else if (event.type == BasicUIEvent.TOUCH_MOVE) {
                    s._currentState = Button.STATUS_OVER;
                }
                if (s.statesLength == 1 && s._currentState == Button.STATUS_DOWN) {
                    s.alpha = 0.8;
                }
                else {
                    s.alpha = 1;
                }
            }
            s.invalidate();
        }
        onTouchReleaseOutside(event) {
            this._currentState = Button.STATUS_UP;
            this.invalidate();
        }
        setClick(fun, obj) {
            this.clickFun = fun;
            this.clickFunObj = obj;
        }
        onClick() {
            if (this.clickFun && this.clickFunObj) {
                this.clickFun.call(this.clickFunObj, this);
            }
        }
        get currentState() {
            return this._currentState;
        }
        set currentState(value) {
            if (this._currentState != value) {
                this._currentState = value;
                this.invalidate();
            }
        }
        get texture() {
            return this._texture;
        }
        set texture(value) {
            if (this._texture != value) {
                this._initDisplayData = false;
                this._texture = value;
                this.invalidate();
            }
        }
        get fillMode() {
            return this._fillMode;
        }
        set fillMode(value) {
            if (this._fillMode != value) {
                this._fillMode = value;
                this.invalidate();
            }
        }
        scale9GridRect() {
            return this._scale9GridRect;
        }
        scale9Grid(scale9Rectangle = []) {
            if (scale9Rectangle.length == 4) {
                this._scale9GridRect.length = 0;
                this._scale9GridRect = scale9Rectangle.concat();
            }
            else {
                this._scale9GridRect = null;
            }
            this.invalidate();
        }
        draw() {
            let s = this;
            if (!s._initDisplayData) {
                if (!s._texture) {
                    if (Button.DEFAULT_TEXTURE == null) {
                        s.initDefaultTexture();
                    }
                    s._texture = Button.DEFAULT_TEXTURE;
                }
                s.splitTextureSource();
            }
            if (s._imgDisplay == null)
                return;
            if (s.statesLength == 1 && s._currentState == Button.STATUS_DOWN) {
                s._imgDisplay.texture = s._textureDict[Button.STATUS_UP];
            }
            else {
                s._imgDisplay.texture = s._textureDict[s._currentState];
            }
            if (s._scale9GridRect.length == 4) {
                s._imgDisplay.scale9Grid(s._scale9GridRect);
            }
            else {
                s._imgDisplay.scale9Grid();
            }
            s._imgDisplay.fillMode = s._fillMode;
            s._imgDisplay.width = s.width;
            s._imgDisplay.height = s.height;
            if (s._textureLabel != null) {
                if (s._imgLabel == null) {
                    s._imgLabel = new Image$1;
                    s.addChild(s._imgLabel);
                }
                s._imgLabel.texture = s._textureLabel;
                if (!isNaN(s._labelMarginLeft)) {
                    s._imgLabel.x = s._labelMarginLeft;
                }
                else {
                    s._imgLabel.x = (s.width - s._imgLabel.width) / 2;
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._imgLabel.y = s._labelMarginTop;
                }
                else {
                    s._imgLabel.y = (s.height - s._imgLabel.height) / 2;
                }
            }
            if (s._textureIcon != null) {
                if (s._imgIcon == null) {
                    s._imgIcon = new Image$1;
                    s.addChild(s._imgIcon);
                }
                s._imgIcon.texture = s._textureIcon;
                if (!isNaN(s._iconMarginLeft)) {
                    s._imgIcon.x = s._iconMarginLeft;
                }
                else {
                    s._imgIcon.x = (s.width - s._imgIcon.width) / 2;
                }
                if (!isNaN(s._iconMarginTop)) {
                    s._imgIcon.y = s._iconMarginTop;
                }
                else {
                    s._imgIcon.y = (s.height - s._imgIcon.height) / 2;
                }
            }
            if (s._label) {
                if (!s._label.parent)
                    s.addChild(s._label);
                s._label.text = s._text;
                s._label.fontSize = s._fontSize;
                s._label.fontName = s._fontName;
                s._label.bold = s._labelBold;
                s._label.italic = s._labelItalic;
                s._label.lineSpacing = s._labelLineSpacing;
                s._label.multiline = s._labelMultiline;
                s._label.stroke = s._labelStroke;
                s._label.strokeColor = s._labelStrokeColor;
                s._label.onInvalidate(null);
                if (!isNaN(s._labelMarginLeft)) {
                    s._label.x = s._labelMarginLeft;
                }
                else {
                    s._label.x = (s.width - s._label.width) / 2;
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._label.y = s._labelMarginTop;
                }
                else {
                    s._label.y = (s.height - s._label.height) / 2;
                }
            }
        }
        initDefaultTexture() {
            if (Button.DEFAULT_TEXTURE == null) {
                this.setSize(Style.BUTTON_DEFAULT_WIDTH, Style.BUTTON_DEFAULT_HEIGHT);
                var shape = new Laya.Sprite;
                shape.width = this.width;
                shape.height = this.height;
                shape.graphics.drawRect(0, 0, this.width, this.height, Style.BUTTON_FACE);
                shape.graphics.drawRect(0, 0, this.width - 1, this.height - 1, 0x000000);
                var htmlC = shape.drawToCanvas(shape.width, shape.height, 0, 0);
                Button.DEFAULT_TEXTURE = new Laya.Texture(htmlC.getTexture());
            }
        }
        splitTextureSource() {
            if (this._texture) {
                this._initDisplayData = true;
                var splitWidth = 0;
                var splitHeight = 0;
                var textureWidth = this._texture.sourceWidth;
                var textureHeight = this._texture.sourceHeight;
                if (this.stateArray.length == 1) {
                    splitWidth = textureWidth;
                    splitHeight = textureHeight;
                    this._textureDict[this.stateArray[0]] = this._texture;
                }
                else {
                    var i = 0;
                    var xOffset = 0;
                    var yOffset = 0;
                    if (this._verticalSplit) {
                        splitWidth = textureWidth;
                        splitHeight = textureHeight / this.statesLength;
                    }
                    else {
                        splitWidth = textureWidth / this.statesLength;
                        splitHeight = textureHeight;
                    }
                    for (i = 0; i < this.stateArray.length; i++) {
                        if (this._verticalSplit) {
                            this._textureDict[this.stateArray[i]] = Laya.Texture.createFromTexture(this._texture, xOffset, yOffset + i * splitHeight, splitWidth, splitHeight);
                        }
                        else {
                            this._textureDict[this.stateArray[i]] = Laya.Texture.createFromTexture(this._texture, xOffset + i * splitWidth, yOffset, splitWidth, splitHeight);
                        }
                    }
                }
                if (this._autoSize) {
                    this.width = splitWidth;
                    this.height = splitHeight;
                }
            }
        }
        set upSkin(value) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_UP)) {
                s.stateArray.push(Button.STATUS_UP);
            }
            s._textureDict[Button.STATUS_UP] = value;
            s.invalidate();
        }
        get upSkin() {
            return this._textureDict[Button.STATUS_UP];
        }
        set overSkin(value) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_OVER)) {
                s.stateArray.push(Button.STATUS_OVER);
            }
            s._textureDict[Button.STATUS_OVER] = value;
            s.invalidate();
        }
        get overSkin() {
            return this._textureDict[Button.STATUS_OVER];
        }
        set downSkin(value) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_DOWN)) {
                s.stateArray.push(Button.STATUS_DOWN);
            }
            s._textureDict[Button.STATUS_DOWN] = value;
            s.invalidate();
        }
        get downSkin() {
            return this._textureDict[Button.STATUS_DOWN];
        }
        set disableSkin(value) {
            let s = this;
            if (!s.isStateExist(Button.STATUS_DISABLE)) {
                s.stateArray.push(Button.STATUS_DISABLE);
            }
            s._textureDict[Button.STATUS_DISABLE] = value;
            s.invalidate();
        }
        get disableSkin() {
            return this._textureDict[Button.STATUS_DISABLE];
        }
        isStateExist(state) {
            if (this.stateArray.indexOf(state) != -1) {
                return true;
            }
            return false;
        }
        set label(value) {
            let s = this;
            s._text = value;
            if (s._label) {
                s._label.text = s._text;
            }
            s.invalidate();
        }
        get label() {
            return this._text;
        }
        setSkins(statusSkin = []) {
            let statusNum = statusSkin.length == 0 ? 1 : statusSkin.length;
            switch (statusNum) {
                case 1:
                    this.stateArray = [Button.STATUS_UP];
                    break;
                case 2:
                    this.stateArray = [Button.STATUS_UP, Button.STATUS_DOWN];
                    break;
                case 3:
                    this.stateArray = [Button.STATUS_UP, Button.STATUS_DOWN, Button.STATUS_OVER];
                    break;
                case 4:
                    this.stateArray = [Button.STATUS_UP, Button.STATUS_DOWN, Button.STATUS_OVER, Button.STATUS_DISABLE];
                    break;
            }
            this._initDisplayData = false;
            if (statusSkin.length > 0) {
                this._initDisplayData = true;
                for (let i = 0; i < this.stateArray.length; ++i) {
                    if (statusSkin[i]) {
                        this._textureDict[this.stateArray[i]] = statusSkin[i];
                    }
                    else {
                        this._initDisplayData = false;
                        console.warn("指定的状态数和状态图片数不一致");
                        break;
                    }
                }
            }
            if (this._initDisplayData)
                this.setSize(statusSkin[0].sourceWidth, statusSkin[0].sourceHeight);
            this.invalidate();
        }
        get statesLength() {
            return this.stateArray.length;
        }
        set imgLabel(value) {
            if (this._textureLabel != value) {
                this._textureLabel = value;
                this.invalidate();
            }
        }
        get imgLabel() {
            return this._textureLabel;
        }
        set imgIcon(value) {
            if (this._textureIcon != value) {
                this._textureIcon = value;
                this.invalidate();
            }
        }
        get imgIcon() {
            return this._textureIcon;
        }
        set labelColor(value) {
            if (this._labelColor != value) {
                this._labelColor = value;
                if (this._label)
                    this._label.color = value;
                this.invalidate();
            }
        }
        get labelColor() {
            return this._labelColor;
        }
        set fontName(value) {
            if (this._fontName != value) {
                this._fontName = value;
                this.invalidate();
            }
        }
        get fontName() {
            return this._fontName;
        }
        set fontSize(value) {
            if (this._fontSize != value) {
                this._fontSize = value;
                this.invalidate();
            }
        }
        get fontSize() {
            return this._fontSize;
        }
        set labelMarginLeft(value) {
            if (this._labelMarginLeft != value) {
                this._labelMarginLeft = value;
                this.invalidate();
            }
        }
        get labelMarginLeft() {
            return this._labelMarginLeft;
        }
        set labelMarginTop(value) {
            if (this._labelMarginTop != value) {
                this._labelMarginTop = value;
                this.invalidate();
            }
        }
        get labelMarginTop() {
            return this._labelMarginTop;
        }
        set iconMarginLeft(value) {
            if (this._iconMarginLeft != value) {
                this._iconMarginLeft = value;
                this.invalidate();
            }
        }
        get iconMarginLeft() {
            return this._iconMarginLeft;
        }
        set iconMarginTop(value) {
            if (this._iconMarginTop != value) {
                this._iconMarginTop = value;
                this.invalidate();
            }
        }
        get iconMarginTop() {
            return this._iconMarginTop;
        }
        setSize(w, h) {
            super.setSize(w, h);
        }
        onPlaySound() {
            if (StringUtil.isUsage(this._soundName)) {
                Laya.SoundManager.playSound(this._soundName);
            }
        }
        set sound(value) {
            this._soundName = value;
        }
        get sound() {
            return this._soundName;
        }
        set drawDelay(delay) {
            if (this._label)
                this._label.drawDelay = delay;
        }
        set labelBold(value) {
            if (this._labelBold != value) {
                this._labelBold = value;
                this.invalidate();
            }
        }
        get labelBold() {
            return this._labelBold;
        }
        set labelItalic(value) {
            if (this._labelItalic != value) {
                this._labelItalic = value;
                this.invalidate();
            }
        }
        get labelItalic() {
            return this._labelItalic;
        }
        set labelLineSpacing(value) {
            if (this._labelLineSpacing != value) {
                this._labelLineSpacing = value;
                this.invalidate();
            }
        }
        get labelLineSpacing() {
            return this._labelLineSpacing;
        }
        set labelMultiline(value) {
            if (this._labelMultiline != value) {
                this._labelMultiline = value;
                this.invalidate();
            }
        }
        get labelMultiline() {
            return this._labelMultiline;
        }
        set labelStroke(value) {
            if (this._labelStroke != value) {
                this._labelStroke = value;
                this.invalidate();
            }
        }
        get labelStroke() {
            return this._labelStroke;
        }
        set labelStrokeColor(value) {
            if (this._labelStrokeColor != value) {
                this._labelStrokeColor = value;
                this.invalidate();
            }
        }
        get labelStrokeColor() {
            return this._labelStrokeColor;
        }
        set testPixelEnable(value) {
            this._testPixelEnable = value;
        }
        get testPixelEnable() {
            return this._testPixelEnable;
        }
        getPixel32(x, y) {
            let s = this;
            var locolPoint = this.globalToLocal(new Laya.Point(x, y));
            var found;
            var datas = null;
            if (s._imgDisplay && s._imgDisplay.texture) {
                datas = s._imgDisplay.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }
            if (s._imgLabel && s._imgLabel.texture) {
                datas = s._imgLabel.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }
            if (s._imgIcon && s._imgIcon.texture) {
                datas = s._imgIcon.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    found = true;
                    return datas;
                }
            }
            return null;
        }
    }
    Button.DEFAULT_TEXTURE = null;
    Button.STATUS_UP = "status_up";
    Button.STATUS_DOWN = "status_down";
    Button.STATUS_OVER = "status_over";
    Button.STATUS_DISABLE = "status_disable";
    Button.STATUS_NORMAL = "status_normal";
    Button.STATUS_CHECKED = "status_checked";

    class UISkin {
        static get randomRect() { return UISkin.getRect(60, 60, UIColor.random); }
        ;
        static get randomCircle() { return UISkin.getCircle(50, UIColor.random); }
        ;
        static get pointNormal() { return UISkin.getCircle(6, UIColor.black); }
        ;
        static get pointDown() { return UISkin.getCircle(6, UIColor.gray); }
        ;
        static get buttonNormal() { return UISkin.getRect(60, 60, UIColor.skinNormal); }
        ;
        static get buttonDown() { return UISkin.getRect(60, 60, UIColor.skinDown); }
        ;
        static get radioOff() { return UISkin.getRadioCircle(UIColor.white, UIColor.white); }
        ;
        static get radioOn() { return UISkin.getRadioCircle(UIColor.white, UIColor.black, 1); }
        ;
        static get checkBoxOff() { return UISkin.getCheckBoxRect(UIColor.white, UIColor.white); }
        ;
        static get checkBoxOn() { return UISkin.getCheckBoxRect(UIColor.white, UIColor.black, 1); }
        ;
        static get checkBoxDisable() { return UISkin.getCheckBoxRect(UIColor.gray, UIColor.white); }
        ;
        static get switchOff() { return UISkin.getSwitch(UIColor.skinNormal, UIColor.white); }
        ;
        static get switchOn() { return UISkin.getSwitch(UIColor.skinNormal, UIColor.white, 1); }
        ;
        static get progressBackground() { return UISkin.getRect(300, 20, UIColor.skinNormal); }
        static get progressSkin() { return UISkin.getRect(300, 20, UIColor.skinDown); }
        static get sliderBackground() { return UISkin.getRect(300, 10, UIColor.skinNormal); }
        static get sliderSkin() { return UISkin.getRect(300, 10, UIColor.skinDown); }
        static get sliderBar() { return UISkin.getCircle(15, UIColor.white); }
        static get scrollBarV() { return UISkin.getRoundRect(10, 60, UIColor.skinNormal); }
        static get scrollBarH() { return UISkin.getRoundRect(60, 10, UIColor.skinNormal); }
        static get pnBarPrevNormal() { return UISkin.getPolygon(3, 20, UIColor.skinNormal, 180); }
        static get pnBarPrevDown() { return UISkin.getPolygon(3, 20, UIColor.skinDown, 180); }
        static get pnBarNextNormal() { return UISkin.getPolygon(3, 20, UIColor.skinNormal); }
        static get pnBarNextDown() { return UISkin.getPolygon(3, 20, UIColor.skinDown); }
        static getLineRect(w, h, c = 0, s = 1, x = 0, y = 0) {
            var sp = new Sprite();
            sp.autoSize = true;
            var c1 = UIColor.convertColor(c);
            sp.graphics.drawLines(x, y, [x + w, y, x + w, y + h, x, y + h, x, y], c1, 3);
            sp.graphics.drawRect(x, y, w, h, c1);
            return sp;
        }
        static getLineCircle(r, c = 0, s = 1, x = 0, y = 0) {
            var sp = new Sprite();
            sp.autoSize = true;
            var c1 = UIColor.convertColor(c);
            sp.graphics.drawCircle(x, y, r, c1);
            return sp;
        }
        static getMatrixRect(w, h, c1 = 0, c2 = 0, a = 0) {
            var node = new Sprite();
            return node;
        }
        static getRect(w, h, c = 0, x = 0, y = 0) {
            var s = new Sprite();
            s.width = w;
            s.height = h;
            var c1 = UIColor.convertColor(c);
            s.graphics.drawRect(x, y, w, h, c1);
            return s;
        }
        static getRectAndX(w, h, c = 0, x = 0, y = 0) {
            var s = this.getRect(w, h, c, x, y);
            s.autoSize = true;
            s.addChild(this.getX(w, h, c, 1, x, y));
            return s;
        }
        static getX(w, h, c = 0, s = 1, x = 0, y = 0) {
            var container = new Sprite;
            container.autoSize = true;
            var l1 = new Sprite;
            l1.autoSize = true;
            var c1 = UIColor.convertColor(c);
            l1.graphics.drawLine(0, 0, w, h, c1, s);
            l1.graphics.drawLine(w, 0, 0, h, c1, s);
            container.addChild(l1);
            return container;
        }
        static getRoundRect(w, h, c = 0, ew = 5, eh = 5, x = 0, y = 0) {
            var sp = new Sprite();
            sp.graphics.drawPath(x, y, [
                ["moveTo", ew, 0],
                ["lineTo", w - ew, 0],
                ["arcTo", w, 0, w, ew, eh],
                ["lineTo", w, h - eh],
                ["arcTo", w, h, w - ew, h, ew],
                ["lineTo", ew, h],
                ["arcTo", 0, h, 0, h - eh, eh],
                ["lineTo", 0, eh],
                ["arcTo", 0, 0, eh, 0, ew],
                ["closePath"]
            ], { fillStyle: "#ffffff" });
            return sp;
        }
        static getCircle(r, c = 0, x = 0, y = 0) {
            var s = new Sprite();
            s.autoSize = true;
            var c1 = UIColor.convertColor(c);
            s.graphics.drawCircle(x, y, r, c1);
            return s;
        }
        static getPolygon(side = 3, r = 10, c = 0, rotation = 0) {
            var s = new Sprite;
            s.autoSize = true;
            s.rotation = rotation;
            var c1 = UIColor.convertColor(c);
            var oldX = 0;
            var oldY = 0;
            for (var i = 0; i <= side; i++) {
                var lineX = Math.cos((i * (360 / side) * Math.PI / 180)) * r;
                var lineY = Math.sin((i * (360 / side) * Math.PI / 180)) * r;
                s.graphics.drawLine(oldX, oldY, lineX, lineY, c1);
                oldX = lineX;
                oldY = lineY;
            }
            return s;
        }
        static getArrowRoundRect(w, h, rc, pc = 0, rotation = 0) {
            var s = new Sprite;
            s.autoSize = true;
            s.addChild(this.getRoundRect(w, h, rc));
            var p = this.getPolygon(3, w / 3, pc, 30 + rotation);
            p.autoSize = true;
            p.x = s.width >> 1;
            p.y = s.height >> 1;
            s.addChild(p);
            return s;
        }
        static getScrollLineBar(w, h, c) {
            var s = new Sprite;
            s.autoSize = true;
            var _h = h / 3;
            for (var i = 0; i < 3; i++) {
                var r = this.getRect(w, 1, c, 0, i * _h);
                r.autoSize = true;
                s.addChild(r);
            }
            return s;
        }
        static getAddRoundRect(w, h, c) {
            var s = new Sprite;
            s.autoSize = true;
            s.addChild(this.getRoundRect(w, h, c));
            var r1 = this.getRect(w / 2, 2, 0, w / 4, h / 2 - 1);
            var r2 = this.getRect(2, h / 2, 0, w / 2 - 1, h / 4);
            r1.autoSize = true;
            r2.autoSize = true;
            s.addChild(r1);
            s.addChild(r2);
            return s;
        }
        static getRemoveRoundRect(w, h, c) {
            var s = new Sprite;
            s.autoSize = true;
            s.addChild(this.getRoundRect(w, h, c));
            var r = this.getRect(w / 2, 2, 0, w / 4, h / 2 - 1);
            r.autoSize = true;
            s.addChild(r);
            return s;
        }
        static getRoundRectText(w, h, c, str = "click") {
            var s = new Sprite;
            s.autoSize = true;
            s.addChild(this.getRoundRect(w, h, c));
            var text = new TextField;
            text.name = "text";
            text.text = str;
            text.x = (s.width - text.width) >> 1;
            text.y = (s.height - text.height) >> 1;
            s.addChild(text);
            return s;
        }
        static getSwitch(bc = 0XFFFFFF, gc = 0, type = 0) {
            var node = UISkin.getRoundRect(80, 50, bc, 60, 60);
            node.autoSize = true;
            node.addChild(UISkin.getCircle(22, gc, type == 0 ? 25 : 55, 25));
            return node;
        }
        static getCheckBoxRect(bc = 0XFFFFFF, gc = 0, type = 0) {
            var s = this.getRect(40, 40, bc);
            if (type == 1) {
                var r = new Sprite;
                var c1 = UIColor.convertColor(gc);
                r.graphics.drawPoly(0, 20, [20, 36, 44, 8, 36, 0, 20, 18, 12, 8, 0, 20], c1, 1);
                s.addChild(r);
                r.y = -20;
            }
            return s;
        }
        static getRadioCircle(bc = 0XFFFFFF, gc = 0, type = 0) {
            var s = this.getCircle(16, bc, 16, 16);
            if (type == 1) {
                var r = this.getCircle(8, gc, 16, 16);
                s.addChild(r);
            }
            return s;
        }
        static getGridding(rect, c = 0) {
            var s = new Sprite;
            s.autoSize = true;
            var c1 = UIColor.convertColor(c);
            var disx = rect.width / rect.x;
            var disy = rect.height / rect.y;
            for (var i = 0; i < rect.x; i++) {
                s.graphics.drawLine(0, i * disy, rect.width, i * disy, c1, 0.1);
            }
            for (i = 0; i < rect.y; i++) {
                s.graphics.drawLine(i * disx, 0, i * disx, rect.height, c1, 0.1);
            }
            return s;
        }
    }

    class CheckBox extends Button {
        constructor() {
            super();
            this.touchId = -1;
        }
        createChildren() {
            let s = this;
            s._currentState = Button.STATUS_NORMAL;
            s._imgDisplay = new Image$1;
            s.addChild(s._imgDisplay);
            s._imgDisplay.fillMode = s._fillMode;
            s._labelMarginLeft = NaN;
            s._labelMarginTop = NaN;
            s._label = new Label;
            s.fontSize = 15;
            s._label.autoSize = true;
            s._label.clip = false;
            s._label.hAlign = "left";
            s._label.vAlign = "middle";
            s._label.showBg = false;
            s.addChild(s._label);
            s.on(BasicUIEvent.TOUCH_BEGIN, s, s.onTouchEvent);
            s.on(BasicUIEvent.TOUCH_END, s, s.onTouchEvent);
            s.on(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, s, s.onTouchReleaseOutside);
        }
        initData() {
            let s = this;
            s.stateArray = [Button.STATUS_NORMAL, Button.STATUS_CHECKED];
            if (!CheckBox.normalTexture) {
                let normalSpr = UISkin.checkBoxOff;
                var htmlC = normalSpr.drawToCanvas(normalSpr.width, normalSpr.height, 0, 0);
                CheckBox.normalTexture = new Laya.Texture(htmlC.getTexture());
                let checkSpr = UISkin.checkBoxOn;
                htmlC = checkSpr.drawToCanvas(checkSpr.width, checkSpr.height, 0, 0);
                CheckBox.checkTexture = new Laya.Texture(htmlC.getTexture());
                let disableSpr = UISkin.checkBoxDisable;
                htmlC = disableSpr.drawToCanvas(disableSpr.width, disableSpr.height, 0, 0);
                CheckBox.disableTexture = new Laya.Texture(htmlC.getTexture());
            }
        }
        onTouchEvent(event) {
            let s = this;
            if (!s.enabled || s.currentState == Button.STATUS_DISABLE) {
                event.stopPropagation();
                return;
            }
            if (event.currentTarget == s) {
                if (s._testPixelEnable && !s.testPixel32(s.mouseX, s.mouseY)) {
                    event.stopPropagation();
                    return;
                }
                if (event.type == BasicUIEvent.TOUCH_BEGIN) {
                    s.alpha = 0.8;
                    s.touchId = event.touchId;
                }
                else if (event.type == BasicUIEvent.TOUCH_END) {
                    if (s.touchId == -1)
                        return;
                    s.touchId = -1;
                    s.alpha = 1;
                    s.selected = !s._selected;
                    s.onPlaySound();
                }
            }
            s.invalidate();
        }
        onTouchReleaseOutside(event) {
            let s = this;
            s.alpha = 1;
            s.touchId = -1;
        }
        set selected(value) {
            let s = this;
            s._selected = value;
            s._currentState = (s._selected ? Button.STATUS_CHECKED : Button.STATUS_NORMAL);
            s.dispatchEventWith(BasicUIEvent.CHANGE, false, { caller: s, status: s.currentState });
            if (s.clickFun && s.clickFunObj) {
                s.clickFun.call(s.clickFunObj, event);
            }
            s.invalidate();
        }
        get selected() {
            return this._selected;
        }
        draw() {
            let s = this;
            if (!s._initDisplayData) {
                s.initDisplay();
            }
            if (s._imgDisplay == null)
                return;
            s._imgDisplay.texture = s._textureDict[s._currentState];
            if (s._label) {
                if (!s._label.parent)
                    s.addChild(s._label);
                s._label.text = s._text;
                s._label.fontSize = s._fontSize;
                s._label.fontName = s._fontName;
                s._label.bold = s._labelBold;
                s._label.italic = s._labelItalic;
                s._label.lineSpacing = s._labelLineSpacing;
                s._label.multiline = s._labelMultiline;
                s._label.stroke = s._labelStroke;
                s._label.strokeColor = s._labelStrokeColor;
                s._label.onInvalidate(null);
                if (!isNaN(s._labelMarginLeft)) {
                    s._label.x = s._labelMarginLeft;
                }
                else {
                    s._label.x = s.width + 5;
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._label.y = s._labelMarginTop;
                }
                else {
                    s._label.y = (s.height - s._label.height) / 2;
                }
            }
        }
        initDisplay() {
            let s = this;
            s.setSkins([CheckBox.normalTexture, CheckBox.checkTexture, CheckBox.disableTexture]);
        }
        setSkins(skins) {
            let s = this;
            if (!skins || skins.length < 2) {
                console.warn("CHECKBOX皮肤数量不能小于2");
                return;
            }
            if (skins.length == 3) {
                s.stateArray.push(Button.STATUS_DISABLE);
            }
            s._initDisplayData = true;
            for (let i = 0, len = s.stateArray.length; i < len; ++i) {
                if (skins[i]) {
                    s._textureDict[s.stateArray[i]] = skins[i];
                }
                else {
                    s._initDisplayData = false;
                    console.warn("指定的状态数和状态图片数不一致");
                    break;
                }
            }
            if (s._initDisplayData)
                s.setSize(skins[0].sourceWidth, skins[0].sourceHeight);
            s.invalidate();
        }
    }

    class ImageNumber extends BasicGroup {
        constructor() {
            super();
            this.numberImages = [];
            this.numberImagePool = [];
            this.numberTexture = {};
            this.deltaWidth = 0;
            this.deltaHeight = 0;
        }
        init(imageAlias, sheetAlias = "", verticalAlign = "top", horizontalAlign = "left") {
            let s = this;
            s.imageAlias = imageAlias;
            s.sheetAlias = sheetAlias;
            s.verticalAlign = verticalAlign.toLowerCase();
            s.horizontalAlign = horizontalAlign.toLowerCase();
        }
        show(pr, px, py, defaultText = null) {
            let s = this;
            if (s.parent != pr) {
                pr.addChild(s);
            }
            s.px = px;
            s.py = py;
            s.x = px;
            s.y = py;
            s.numberValue = defaultText;
            s.setNumber();
        }
        set text(value) {
            let s = this;
            if (s.numberValue != value) {
                s.numberValue = value;
                s.setNumber();
            }
        }
        get text() {
            let s = this;
            return s.numberValue;
        }
        setNumber() {
            let s = this;
            if (s.numberImages.length > 0) {
                for (let i = 0; i < s.numberImages.length; ++i) {
                    s.removeChild(s.numberImages[i]);
                    s.numberImagePool.push(s.numberImages[i]);
                }
                s.numberImages.length = 0;
            }
            if (s.numberValue && s.numberValue.length > 0) {
                let num = s.numberValue.length;
                let numberBitmap;
                let tex;
                let name;
                let spriteWidth = 0;
                let spriteHeight = 0;
                let temp = num / 2;
                for (let i = 0; i < num; ++i) {
                    name = s.numberValue[i];
                    if (s.numberImagePool.length > 0) {
                        numberBitmap = s.numberImagePool.pop();
                    }
                    else {
                        numberBitmap = new Image$1;
                    }
                    tex = s.numberTexture[s.imageAlias + name];
                    if (!tex) {
                        tex = Laya.loader.getRes(s.sheetAlias + `.${s.imageAlias + name}`);
                    }
                    numberBitmap.texture = tex;
                    if (numberBitmap) {
                        s.addChild(numberBitmap);
                        if (s.horizontalAlign == "left") {
                            numberBitmap.x = 0 + i * numberBitmap.width + i * s.deltaWidth;
                        }
                        else if (s.horizontalAlign == "center") {
                            numberBitmap.x = 0 + (i - temp) * numberBitmap.width + i * s.deltaWidth;
                        }
                        else if (s.horizontalAlign == "right") {
                            numberBitmap.x = 0 - (i + 1) * numberBitmap.width + i * s.deltaWidth;
                        }
                        if (s.verticalAlign == "top") {
                            numberBitmap.y = 0;
                        }
                        else if (s.verticalAlign == "middle") {
                            numberBitmap.y = 0 - numberBitmap.height / 2;
                        }
                        else if (s.verticalAlign == "bottom") {
                            numberBitmap.y = 0 - numberBitmap.height;
                        }
                        s.numberImages.push(numberBitmap);
                        spriteWidth += (numberBitmap.width + s.deltaWidth);
                        spriteHeight = numberBitmap.height;
                    }
                }
                s.width = spriteWidth;
                s.height = spriteHeight;
                if (s.horizontalAlign == "center") {
                    s.x = s.px + ((num - 1) * s.deltaWidth * -1) / 2;
                }
            }
        }
    }

    class MessageControler {
        static addHandle(handle) {
            if (handle != null && MessageControler.handles.indexOf(handle) < 0)
                MessageControler.handles.push(handle);
        }
        static addEvent(eventName) {
            if (MessageControler.eventHandles.indexOf(eventName) < 0)
                MessageControler.eventHandles.push(eventName);
        }
        static receivePacket(pkt) {
            var i = 0;
            for (i = 0; i < MessageControler.handles.length; i++) {
                MessageControler.handles[i].receivePacket(pkt);
            }
        }
        static receiveEvent(event) {
            if (MessageControler.eventHandles.indexOf(event.type) >= 0) {
                var i = 0;
                for (i = 0; i < MessageControler.handles.length; i++) {
                    MessageControler.handles[i].receiveEvent(event);
                }
            }
        }
    }
    MessageControler.handles = [];
    MessageControler.eventHandles = [];

    class HeartBeat {
        static onEnterFrame(event) {
            var i = 0;
            var j = 0;
            var lenght = 0;
            var item = null;
            var runNum = 1;
            if (HeartBeat._lastTime > 0 && HeartBeat._eplasedTime > 0) {
                var timeNum = Math.floor((Date.now() - HeartBeat._lastTime) - HeartBeat._eplasedTime);
                if (timeNum > 0) {
                    HeartBeat._cumulativeTime += timeNum;
                    if (HeartBeat._cumulativeTime > HeartBeat._eplasedTime) {
                        runNum += Math.floor(HeartBeat._cumulativeTime / HeartBeat._eplasedTime);
                        HeartBeat._cumulativeTime = HeartBeat._cumulativeTime % HeartBeat._eplasedTime;
                    }
                }
            }
            for (var k = 0; k < runNum; k++) {
                lenght = HeartBeat._listeners.length - 1;
                for (i = lenght; i >= 0; i--) {
                    item = HeartBeat._listeners[i];
                    item.frameIndex++;
                    if (item.del) {
                        HeartBeat._listeners.splice(i, 1);
                        ObjectPool.recycleClass(item);
                        continue;
                    }
                    if (item.frameCount <= 1 || (item.frameIndex % item.frameCount) == 0) {
                        item.loopcount++;
                        if (item.loop > 0 && item.loopcount >= item.loop) {
                            item.del = true;
                        }
                        HeartBeat._functionCallList.unshift(item);
                    }
                }
            }
            lenght = HeartBeat._functionCallList.length;
            for (i = 0; i < lenght; i++) {
                item = HeartBeat._functionCallList.pop();
                HeartBeat.executeFunCall(item);
            }
            if (HeartBeat._listeners.length == 0)
                Laya.stage.off(Laya.Event.FRAME, this, HeartBeat.onEnterFrame);
            HeartBeat._lastTime = Laya.Browser.now();
        }
        static executeFunCall(item) {
            if (item.param && item.param.length > 0) {
                item.func.apply(item.thisArg, item.param);
            }
            else {
                if (item.func.length == 0) {
                    item.func.call(item.thisArg);
                }
                else {
                    item.func.call(item.thisArg, item.del);
                }
            }
        }
        static addListener(thisArg, respone, heartRrate = 1, repeat = -1, delay = 0, params = null, nowExecute = false) {
            if (respone == null || HeartBeat.hasListener(thisArg, respone))
                return false;
            var item = ObjectPool.getByClass(BeatItem);
            if (heartRrate <= 0)
                heartRrate = 1;
            item.setData(thisArg, respone, heartRrate, repeat, delay, params);
            HeartBeat._listeners.push(item);
            if (nowExecute) {
                item.loopcount++;
                HeartBeat.executeFunCall(item);
            }
            HeartBeat._lastTime = Date.now();
            Laya.timer.frameLoop(1, this, HeartBeat.onEnterFrame, null, true);
            return true;
        }
        static removeListener(thisArg, respone) {
            var i = 0;
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                if (HeartBeat._listeners[i].func == respone && HeartBeat._listeners[i].thisArg == thisArg) {
                    HeartBeat._listeners[i].del = true;
                    break;
                }
            }
        }
        static hasListener(thisArg, respone) {
            var i = 0;
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                if (HeartBeat._listeners[i].thisArg == thisArg && HeartBeat._listeners[i].func == respone && !HeartBeat._listeners[i].del) {
                    return true;
                }
            }
            return false;
        }
        static getHearBeatLenght() {
            return HeartBeat._listeners.length;
        }
        static init() {
            if (HeartBeat._eplasedTime == 0) {
                HeartBeat._eplasedTime = 1000 / Global.FRAME_RATE;
            }
        }
        static dispose() {
            var i = 0;
            var item;
            Laya.timer.clear(this, this.onEnterFrame);
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                item = HeartBeat._listeners[i];
                ObjectPool.recycleClass(item);
            }
            HeartBeat._listeners.length = 0;
            HeartBeat._functionCallList.length = 0;
            HeartBeat._lastTime = 0;
            HeartBeat._eplasedTime = 0;
            HeartBeat._cumulativeTime = 0;
        }
        static getHearBeatTrace() {
            var i = 0;
            var msg = "";
            var item = null;
            msg += "总数:" + HeartBeat._listeners.length + "\n";
            msg += "========================================================\n";
            for (i = 0; i < HeartBeat._listeners.length; i++) {
                item = HeartBeat._listeners[i];
                if (item) {
                    msg += "基本信息 (" + i + "): ";
                    msg += "del=" + item.del + ", count=" + item.frameCount + ", index=" + item.frameIndex + ", loop=" + item.loop + ", loopCount=" + item.loopcount + "\n";
                    msg += "------------------------------------\n";
                }
            }
            msg += "========================================================\n";
            return msg;
        }
    }
    HeartBeat._listeners = new Array();
    HeartBeat._functionCallList = new Array();
    HeartBeat._MAX_EXECUTE_COUNT = 20;
    HeartBeat.isInit = false;
    HeartBeat._lastTime = 0;
    HeartBeat._eplasedTime = 0;
    HeartBeat._cumulativeTime = 0;
    HeartBeat.nowTime = 0;
    HeartBeat.realFrame = 0;
    HeartBeat.item = null;
    HeartBeat.endCall = false;
    class BeatItem {
        constructor() {
            this.func = null;
            this.thisArg = null;
            this.param = null;
            this.frameCount = 0;
            this.frameIndex = 0;
            this.loop = 0;
            this.loopcount = 0;
            this.delay = 0;
            this.del = false;
            this.traceMsg = null;
        }
        setData(thisArg, respone, heartRrate, repeat, delay, params) {
            this.thisArg = thisArg;
            this.func = respone;
            this.frameCount = heartRrate;
            this.loop = repeat;
            this.delay = delay;
            this.frameIndex = 0;
            this.loopcount = 0;
            this.del = false;
            this.param = params;
        }
    }

    class DefaultRenderer extends Group {
        constructor() {
            super();
            this.list = null;
        }
        createChildren() {
            super.createChildren();
        }
        initData() {
        }
        draw() {
            super.draw();
        }
        set data(value) {
            this._data = value;
            this.invalidate();
        }
        get data() {
            return this._data;
        }
        refresh() {
            this.data = this._data;
        }
        set selected(value) {
            this.setSelected(value);
        }
        get selected() {
            return this._selected;
        }
        setSelected(value) {
            if (this._selected != value) {
                this._selected = value;
                this.invalidate();
            }
        }
        destroy() {
        }
        validateNow() {
        }
    }

    class List extends Group {
        constructor() {
            super();
            this.METHOD_DEF = {};
            this._itemRenderer = DefaultRenderer;
            this._itemContainer = null;
            this._gap = 2;
            this._direction = Style.VERTICAL;
            this._dataIndexBegin = 0;
            this._dataIndexEnd = 0;
            this._itemDatas = null;
            this._dataIndexToRender = null;
            this._autoSize = false;
            this._marginTop = 4;
            this._marginBottom = 4;
            this._marginLeft = 4;
            this._marginRight = 4;
            this._line = 1;
            this._lineGap = 0;
            this._effect = null;
            this._isDragBegin = false;
            this._isMoveBegin = false;
            this._moveCount = 0;
            this._dragBeginPoint = null;
            this._dragLastTime = 0;
            this.bounceBack = false;
            this._autoScrollGap = 0;
            this._autoScrollStep = 0;
            this._lastTimeNum = 0;
            this._selected = null;
            this._fixed = false;
            this._data_end_func_call = null;
            this._data_end_func_this = null;
        }
        createChildren() {
            super.createChildren();
            this._itemContainer = new BasicGroup();
            this.addChild(this._itemContainer);
            this._itemContainer.scrollRect = new Rectangle(0, 0, this.width, this.height);
            this.addEventListener(BasicUIEvent.TOUCH_BEGIN, this.onTouchBeginEvent, this);
            this.addEventListener(BasicUIEvent.TOUCH_MOVE, this.onTouchMoveEvent, this);
            this.addEventListener(BasicUIEvent.TOUCH_END, this.onTouchEndEvent, this);
            this.addEventListener(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchReleaseOutsideEvent, this);
            this._dragBeginPoint = new Point;
            this.touchNonePixel = true;
        }
        addHandleEvent(eventType, funcName) {
            MessageControler.addEvent(eventType);
            this.METHOD_DEF[eventType] = funcName;
        }
        receiveEvent(event) {
            var sp = null;
            for (var i = 0; i < this._itemContainer.numChildren; i++) {
                sp = this._itemContainer.getChildAt(i);
                if (sp["refresh"]) {
                    sp["refresh"]();
                }
            }
        }
        onTouchBeginEvent(event) {
            if (!this._itemDatas || this._itemDatas.length == 0)
                return;
            this._isDragBegin = true;
            this._isMoveBegin = false;
            this._lastTimeNum = 0;
            this._moveCount = 0;
            this._dragBeginPoint.x = event.stageX;
            this._dragBeginPoint.y = event.stageY;
            this._dragLastTime = Date.now();
            HeartBeat.removeListener(this, this.onAutoScroll);
        }
        onTouchMoveEvent(event) {
            if (!this._isDragBegin || !this._itemDatas || this._itemDatas.length == 0 || this.bounceBack)
                return;
            if (this._isDragBegin) {
                this._isMoveBegin = true;
                this._moveCount++;
                this.moveItemUIPosition(event.stageX - this._dragBeginPoint.x, event.stageY - this._dragBeginPoint.y);
            }
            if (this._direction == Style.VERTICAL) {
                this._autoScrollGap = event.stageY - this._dragBeginPoint.y;
                if (event.stageY <= this.getGlobalXY().y || event.stageY >= this.getGlobalXY().y + this.height) {
                    this.onTouchEndEvent(event);
                    return;
                }
            }
            else {
                this._autoScrollGap = event.stageX - this._dragBeginPoint.x;
                if (event.stageX <= this.getGlobalXY().x || event.stageX >= this.getGlobalXY().x + this.width) {
                    this.onTouchEndEvent(event);
                    return;
                }
            }
            this._dragBeginPoint.x = event.stageX;
            this._dragBeginPoint.y = event.stageY;
        }
        onTouchReleaseOutsideEvent(event) {
            this.onTouchEndEvent(event);
        }
        onTouchEndEvent(event) {
            let s = this;
            if (!this._isDragBegin || !this._itemDatas || this._itemDatas.length == 0 || this.bounceBack)
                return;
            console.log("onTouchEndEvent this._dataIndexBegin=" + s._dataIndexBegin + ", this._dataIndexEnd=" + s._dataIndexEnd);
            if (s._isDragBegin && (!s._isMoveBegin || (s._moveCount < 4 && Math.abs(event.stageX - s._dragBeginPoint.x) < 5 && Math.abs(event.stageY - s._dragBeginPoint.y) < 5))) {
                var sp = null;
                var spPoint = s._itemContainer.globalToLocal(new Point(event.stageX, event.stageY), false);
                for (var i = 0; i < s._itemContainer.numChildren; i++) {
                    sp = s._itemContainer.getChildAt(i);
                    if (sp.x < spPoint.x && sp.y < spPoint.y && (sp.x + sp.width) > spPoint.x && (sp.y + sp.height) > spPoint.y) {
                        try {
                            s.selected = sp["_data"];
                            console.log(sp["dataIndex"]);
                            break;
                        }
                        catch (e) {
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
            if (s._lastTimeNum < 400 && ((s._dataIndexBegin > 0 && s._autoScrollGap > 0) || (s._itemDatas && s._dataIndexEnd < s._itemDatas.length - 1 && s._autoScrollGap < 0))) {
                s._autoScrollGap = (s._autoScrollGap / s._lastTimeNum) * 50;
                HeartBeat.addListener(s, s.onAutoScroll);
                return;
            }
            s.checkBounceBack();
        }
        onAutoScroll() {
            let s = this;
            if (s._direction == Style.VERTICAL) {
                s.moveItemUIPosition(0, s._autoScrollGap);
            }
            else {
                s.moveItemUIPosition(s._autoScrollGap, 0);
            }
            s._autoScrollGap -= s._autoScrollGap / 10;
            if (Math.abs(s._autoScrollGap) < 0.5 || s._dataIndexBegin == 0 || s._dataIndexEnd == s._itemDatas.length - 1) {
                HeartBeat.removeListener(s, s.onAutoScroll);
                s.checkBounceBack();
            }
        }
        checkBounceBack() {
            if (this._itemContainer.numChildren > 0 && this._itemDatas && this._itemDatas.length > 0 && (this._dataIndexBegin == 0 || this._dataIndexEnd >= this._itemDatas.length - 1)) {
                var pos = 0;
                if (this._dataIndexBegin == 0) {
                    if (this._direction == Style.VERTICAL) {
                        pos = this._itemContainer.getChildAt(0).y;
                    }
                    else {
                        pos = this._itemContainer.getChildAt(0).x;
                    }
                    if (pos < 0 && this._dataIndexEnd != (this._itemDatas.length - 1)) {
                        return;
                    }
                }
                else if (this._dataIndexEnd == this._itemDatas.length - 1) {
                    let child = this._itemContainer.getChildAt(this._itemContainer.numChildren - 1);
                    if (this._direction == Style.VERTICAL) {
                        pos = child.y + child.height - this._itemContainer.height;
                    }
                    else {
                        pos = child.x + child.width - this._itemContainer.width;
                    }
                    if (pos > 0 && this._dataIndexBegin != 0) {
                        return;
                    }
                }
                if (pos != 0) {
                    this.bounceBack = true;
                    this._autoScrollStep = Number((-pos / 5).toFixed(2));
                    this._autoScrollGap = Number(Math.abs(pos).toFixed(2));
                    HeartBeat.addListener(this, this.doBounceBack);
                }
            }
        }
        doBounceBack() {
            if (this._autoScrollGap < Math.abs(this._autoScrollStep)) {
                this._autoScrollStep = this._autoScrollStep > 0 ? this._autoScrollGap : -this._autoScrollGap;
            }
            if (this._direction == Style.VERTICAL) {
                this.moveItemUIPosition(0, this._autoScrollStep);
            }
            else {
                this.moveItemUIPosition(this._autoScrollStep, 0);
            }
            this._autoScrollGap -= Math.abs(this._autoScrollStep);
            if (this._autoScrollGap <= 0) {
                if (this.bounceBack)
                    this.bounceBack = false;
                this._autoScrollStep = 0;
                this._autoScrollGap = 0;
                HeartBeat.removeListener(this, this.doBounceBack);
            }
        }
        removeRender(render) {
            if (!render)
                return;
            for (var key in this._dataIndexToRender) {
                if (this._dataIndexToRender[key] === render) {
                    delete this._dataIndexToRender[key];
                    break;
                }
            }
            try {
                render["data"] = null;
                render["list"] = null;
            }
            catch (e) {
            }
            if (render && render.parent)
                render.parent.removeChild(render);
            ObjectPool.recycleClass(render, "list_" + this.name);
        }
        moveItemUIPosition(xv, yv) {
            var itemRenderer = null;
            var addNum = 0;
            for (var i = this._itemContainer.numChildren - 1; i >= 0; i--) {
                itemRenderer = this._itemContainer.getChildAt(i);
                if (this._direction == Style.VERTICAL) {
                    if (!this._fixed)
                        itemRenderer.y += yv;
                    if (yv < 0) {
                        if (this._dataIndexEnd < this._itemDatas.length - 1) {
                            let child = this._itemContainer.getChildAt(this._itemContainer.numChildren - 1);
                            if (child.y + child.height + this._gap < this._itemContainer.height) {
                                addNum = this.addUIItem(this._dataIndexEnd + 1, false);
                                this._dataIndexEnd += addNum;
                            }
                            if ((itemRenderer.y + itemRenderer.height) < 0) {
                                this.removeRender(itemRenderer);
                                this._dataIndexBegin++;
                            }
                        }
                    }
                    else {
                        if (this._dataIndexBegin > 0) {
                            let child = this._itemContainer.getChildAt(0);
                            if (child.y - this._gap > 0) {
                                addNum = this.addUIItem(this._dataIndexBegin - this._line, true);
                                this._dataIndexBegin -= addNum;
                            }
                            if (itemRenderer.y > this._itemContainer.height) {
                                this.removeRender(itemRenderer);
                                this._dataIndexEnd--;
                            }
                        }
                    }
                }
                else {
                    if (!this._fixed)
                        itemRenderer.x += xv;
                    if (xv < 0) {
                        if (this._dataIndexEnd < this._itemDatas.length - 1) {
                            let child = this._itemContainer.getChildAt(this._itemContainer.numChildren - 1);
                            if (child.x + itemRenderer.width + this._gap < this._itemContainer.width) {
                                addNum = this.addUIItem(this._dataIndexEnd + 1, false);
                                this._dataIndexEnd += addNum;
                            }
                            if ((itemRenderer.x + itemRenderer.width) < 0) {
                                this.removeRender(this._itemContainer.getChildAt(i));
                                this._dataIndexBegin++;
                            }
                        }
                    }
                    else {
                        if (this._dataIndexBegin > 0) {
                            let child = this._itemContainer.getChildAt(0);
                            if (child.x - this._gap > 0) {
                                addNum = this.addUIItem(this._dataIndexBegin - this.line, true);
                                this._dataIndexBegin -= addNum;
                            }
                            if (itemRenderer.x > this._itemContainer.width) {
                                this.removeRender(this._itemContainer.getChildAt(i));
                                this._dataIndexEnd--;
                            }
                        }
                    }
                }
            }
        }
        addUIItem(dataIndex, topPlace) {
            let s = this;
            if (!s._itemDatas || dataIndex < 0 || dataIndex >= s._itemDatas.length) {
                return 0;
            }
            var indexAdd = 0;
            var yPos = 0;
            var xPos = 0;
            while (indexAdd < s._line) {
                if (!s._itemDatas || dataIndex < 0 || dataIndex >= s._itemDatas.length)
                    break;
                var displayItemUI = ObjectPool.getByClass(s._itemRenderer, "list_" + s.name);
                try {
                    displayItemUI.data = s._itemDatas[dataIndex];
                    displayItemUI.dataIndex = dataIndex;
                    displayItemUI.list = s;
                    displayItemUI.validateNow();
                }
                catch (e) {
                }
                if (s._autoSize) {
                    if (s._direction == Style.VERTICAL) {
                        displayItemUI.width = (s._itemContainer.width - (s._line - 1) * s._gap) / s._line;
                    }
                    else {
                        displayItemUI.height = (s._itemContainer.height - (s._line - 1) * s._gap) / s._line;
                    }
                }
                if (s._direction == Style.VERTICAL) {
                    xPos = (displayItemUI.width + s._lineGap) * indexAdd;
                    let child;
                    if (s._itemContainer.numChildren > 0 && indexAdd == 0) {
                        if (topPlace) {
                            child = s._itemContainer.getChildAt(0);
                            yPos = child.y;
                            yPos -= (s._gap + displayItemUI.height);
                        }
                        else {
                            child = s._itemContainer.getChildAt(s._itemContainer.numChildren - 1);
                            yPos = child.y;
                            yPos += (s._gap + child.height) * (indexAdd + 1);
                        }
                    }
                    if (yPos > s._itemContainer.height || yPos < -displayItemUI.height) {
                        s.removeRender(displayItemUI);
                        return indexAdd;
                    }
                    displayItemUI.x = xPos;
                    displayItemUI.y = yPos;
                }
                else {
                    yPos = (displayItemUI.height + s._lineGap) * indexAdd;
                    let child;
                    if (s._itemContainer.numChildren > 0 && indexAdd == 0) {
                        if (topPlace) {
                            child = s._itemContainer.getChildAt(0);
                            xPos = child.x;
                            xPos = xPos - (s._gap + displayItemUI.width);
                        }
                        else {
                            child = s._itemContainer.getChildAt(s._itemContainer.numChildren - 1);
                            xPos = child.x;
                            xPos += (s._gap + child.width) * (indexAdd + 1);
                        }
                    }
                    if (xPos > s._itemContainer.width || xPos < -displayItemUI.width) {
                        s.removeRender(displayItemUI);
                        return indexAdd;
                    }
                    displayItemUI.x = xPos;
                    displayItemUI.y = yPos;
                }
                if (topPlace) {
                    s._itemContainer.addChildAt(displayItemUI, 0);
                }
                else {
                    s._itemContainer.addChild(displayItemUI);
                }
                s._dataIndexToRender["" + dataIndex] = displayItemUI;
                indexAdd++;
                dataIndex++;
            }
            if (dataIndex >= s._itemDatas.length && indexAdd > 0) {
                if (s._data_end_func_call)
                    s._data_end_func_call.call(s._data_end_func_this);
            }
            return indexAdd;
        }
        initList() {
            if (this._data && this._data instanceof Array && this._data.length > 0 && !this._itemDatas) {
                this._itemDatas = null;
                this._dataIndexToRender = {};
                this.setItemContainerSize();
                var displayItemUI = null;
                while (this._itemContainer.numChildren > 0) {
                    displayItemUI = this._itemContainer.removeChildAt(0);
                    if (displayItemUI instanceof this._itemRenderer) {
                        this.removeRender(displayItemUI);
                    }
                }
                this._itemDatas = this._data;
                if (this._itemDatas.length == 0)
                    return;
                this._dataIndexBegin = 0;
                var placeValue = 0;
                var addNum = this.addUIItem(this._dataIndexBegin, false);
                this._dataIndexEnd = addNum;
                while (addNum != 0 && this._dataIndexEnd < this._itemDatas.length) {
                    addNum = this.addUIItem(this._dataIndexEnd, false);
                    this._dataIndexEnd += addNum;
                }
                this._dataIndexEnd--;
            }
        }
        set data(value) {
            this._data = value;
        }
        append(datas) {
            if (datas) {
                this._itemDatas = this._itemDatas.concat(datas);
            }
        }
        draw() {
            super.draw();
            if (this.width == 0 || this.height == 0)
                return;
            this.initList();
        }
        setItemContainerSize() {
            this._itemContainer.width = this.width - this._marginLeft - this._marginRight;
            this._itemContainer.height = this.height - this._marginTop - this._marginBottom;
            this._itemContainer.x = this._marginLeft;
            this._itemContainer.y = this._marginTop;
            this._itemContainer.scrollRect.width = this._itemContainer.width;
            this._itemContainer.scrollRect.height = this._itemContainer.height;
        }
        setHorizontalLayout() {
            this.layout = Style.HORIZONTAL;
        }
        setVerticalLayout() {
            this.layout = Style.VERTICAL;
        }
        set layout(direct) {
            this._direction = direct;
            this.invalidate();
        }
        get layout() {
            return this._direction;
        }
        set selected(item) {
            var sp = null;
            this._selected = item;
            for (var i = 0; i < this._itemContainer.numChildren; i++) {
                sp = this._itemContainer.getChildAt(i);
                if (sp["selected"])
                    sp["selected"] = false;
                try {
                    if (sp["_data"] == item) {
                        sp["selected"] = true;
                        this.dispatchEventWith(BasicUIEvent.ITEM_SELECTED, false, { item: sp }, false);
                    }
                }
                catch (e) {
                }
            }
        }
        get selected() {
            return this._selected;
        }
        get selectedIndex() {
            if (this._selected) {
                return this._data.indexOf(this._selected);
            }
            return -1;
        }
        get itemRenderer() {
            return this._itemRenderer;
        }
        set itemRenderer(value) {
            if (this._itemRenderer != value) {
                this._itemRenderer = value;
                this.invalidate();
            }
        }
        get marginTop() {
            return this._marginTop;
        }
        set marginTop(value) {
            if (this._marginTop != value) {
                this._marginTop = value;
                this.invalidate();
            }
        }
        get marginBottom() {
            return this._marginBottom;
        }
        set marginBottom(value) {
            if (this._marginBottom != value) {
                this._marginBottom = value;
                this.invalidate();
            }
        }
        get marginLeft() {
            return this._marginLeft;
        }
        set marginLeft(value) {
            this._marginLeft = value;
            this.invalidate();
        }
        get marginRight() {
            return this._marginRight;
        }
        set marginRight(value) {
            if (this._marginRight = value) {
                this._marginRight = value;
                this.invalidate();
            }
        }
        get gap() {
            return this._gap;
        }
        set gap(value) {
            this._gap = value;
            this.invalidate();
        }
        get line() {
            return this._line;
        }
        set line(value) {
            this._line = value;
            if (this._line < 1)
                this._line = 1;
            this.invalidate();
        }
        get lineGap() {
            return this._lineGap;
        }
        set lineGap(value) {
            this._lineGap = value;
            if (this._lineGap < 0)
                this._lineGap = 0;
            this.invalidate();
        }
        set fixed(value) {
            if (this._fixed != value) {
                this._fixed = value;
                this.invalidate();
            }
        }
        get fixed() {
            return this._fixed;
        }
        setDataEndCall(func, thisObj) {
            this._data_end_func_call = func;
            this._data_end_func_this = thisObj;
        }
    }

    class Progress extends BasicGroup {
        constructor() {
            super();
            this._value = 0;
        }
        setSkin(bg, skin) {
            this.skinBg = bg || UISkin.progressBackground;
            this.skinProgress = skin || UISkin.progressSkin;
            this.addChild(this.skinBg);
            this.addChild(this.skinProgress);
            this.text = new Label;
            this.addChild(this.text);
        }
        set value(v) {
            v = v < 0 ? 0 : v > 1 ? 1 : v;
            this._value = v;
            this.skinProgress.scaleX = v;
        }
        get value() {
            return this._value;
        }
        showText(text, x = -1, y = -1) {
            this.text.text = text;
            if (x == -1)
                this.text.x = (this.skinBg.width - this.text.width) >> 1;
            else
                this.text.x = x;
            if (y == -1)
                this.text.y = this.skinBg.height + 5;
            else
                this.text.y = y;
        }
    }

    class MyEvent {
        constructor(typeValue) {
            this.callStack = null;
            this.type = null;
            this.datas = {};
            this.type = typeValue;
        }
        addItem(property, value) {
            this.datas[property] = value;
        }
        getItem(property) {
            if (this.datas.hasOwnProperty(property)) {
                return this.datas[property];
            }
            return null;
        }
        hasItem(property) {
            return this.datas.hasOwnProperty(property);
        }
        destory() {
            this.callStack = null;
            for (var item in this.datas) {
                delete this.datas[item];
            }
        }
        removeItem(property) {
            if (this.datas.hasOwnProperty(property)) {
                delete this.datas[property];
                return true;
            }
            return false;
        }
        send() {
            EventManager.dispatchEvent(this);
        }
        static getEvent(type) {
            return EventManager.getEvent(type);
        }
        static sendEvent(type, param = null) {
            EventManager.dispatch(type, param);
        }
    }

    class EventManager {
        static getPacket(messageId, clientSide = true) {
            var packetArray = EventManager.packetCachePool[(clientSide ? "c_" : "s_") + messageId];
            if (packetArray == null) {
                packetArray = new Array();
                EventManager.packetCachePool[(clientSide ? "c_" : "s_") + messageId] = packetArray;
            }
            if (packetArray.length == 0) {
                var packetFactory = Global.getDefinitionByName("PacketFactory");
                if (packetFactory) {
                    return packetFactory.createPacket(messageId, clientSide);
                }
                return null;
            }
            return packetArray.shift();
        }
        static releasePacket(packet) {
            var packetArray = EventManager.packetCachePool[(packet.clientSide ? "c_" : "s_") + packet.header.messageId];
            if (packetArray == null) {
                packetArray = new Array();
                EventManager.packetCachePool[(packet.clientSide ? "c_" : "s_") + packet.header.messageId] = packetArray;
            }
            packetArray.push(packet);
        }
        static getEvent(type) {
            var eventArray = EventManager.eventCachePool[type];
            if (eventArray == null) {
                eventArray = [];
                EventManager.eventCachePool[type] = eventArray;
            }
            if (eventArray.length == 0) {
                return new MyEvent(type);
            }
            return eventArray.pop();
        }
        static releaseEvent(e) {
            var eventArray = EventManager.eventCachePool[e.type];
            if (eventArray == null) {
                eventArray = [];
                EventManager.eventCachePool[e.type] = eventArray;
            }
            e.destory();
            eventArray.push(e);
        }
        static addPacketEvent(messageId, response, thisArg) {
            if (response == null || EventManager.isContainerPacketEventListener(messageId, response, thisArg))
                return;
            var serverList = null;
            serverList = EventManager.packetEventList[EventManager.PREFIX + messageId];
            if (serverList == null) {
                serverList = new Array();
                EventManager.packetEventList[EventManager.PREFIX + messageId] = serverList;
            }
            serverList.push({ func: response, owner: thisArg });
        }
        static removePacketEvent(messageId, response, thisArg) {
            if (response == null || !EventManager.isContainerPacketEventListener(messageId, response, thisArg))
                return;
            var listenerList = EventManager.packetEventList[EventManager.PREFIX + messageId];
            if (listenerList)
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        listenerList.splice(i, 1);
                        break;
                    }
                }
        }
        static isContainerPacketEventListener(messageId, response, thisArg) {
            var listenerList = EventManager.packetEventList[EventManager.PREFIX + messageId];
            if (listenerList != null) {
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        return true;
                    }
                }
            }
            return false;
        }
        static dispactchPacket(packet) {
            if (packet != null) {
                this.packetSendCacheList.push(packet);
                HeartBeat.addListener(EventManager, EventManager.onFireDispactchPacket);
            }
            ;
        }
        static onFireDispactchPacket() {
            if (EventManager.packetSendCacheList.length > 0) {
                var packet = EventManager.packetSendCacheList.shift();
                var serverList = EventManager.packetEventList[EventManager.PREFIX + packet.header.messageId];
                if (serverList != null) {
                    var length = serverList.length;
                    for (var i = 0; i < length; i++) {
                        serverList[i]["func"].call(serverList[i]["owner"], packet);
                    }
                    EventManager.releasePacket(packet);
                }
            }
            if (this.packetSendCacheList.length == 0) {
                HeartBeat.removeListener(EventManager, EventManager.onFireDispactchPacket);
            }
        }
        static dispatch(type, param = null) {
            var myEvent = EventManager.getEvent(type);
            if (param) {
                var value = null;
                for (var key in param) {
                    if (key != "__class__" && key != "hashCode" && key != "__types__" && key != "__proto__") {
                        value = param[key];
                        if (!(value instanceof Function)) {
                            myEvent.addItem(key, value);
                        }
                    }
                }
            }
            EventManager.dispatchEvent(myEvent);
        }
        static dispatchEvent(e) {
            if (e != null) {
                EventManager.eventSendCacheList.push(e);
                HeartBeat.addListener(EventManager, EventManager.onFiredispatchEvent);
            }
        }
        static onFiredispatchEvent() {
            if (EventManager.eventSendCacheList.length > 0) {
                var e = EventManager.eventSendCacheList.shift();
                var listenerList = EventManager.commEventList[e.type];
                if (listenerList != null) {
                    for (var i = listenerList.length - 1; i >= 0; i--) {
                        listenerList[i]["func"].call(listenerList[i]["owner"], e);
                    }
                }
                EventManager.releaseEvent(e);
            }
            if (EventManager.eventSendCacheList.length == 0) {
                HeartBeat.removeListener(EventManager, EventManager.onFiredispatchEvent);
            }
        }
        static removeEventListener(eventType, response, thisArg) {
            var listenerList = EventManager.commEventList[eventType];
            if (listenerList != null) {
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        listenerList.splice(i, 1);
                        break;
                    }
                }
            }
        }
        static addEventListener(eventType, response, thisArg) {
            if (response == null || EventManager.isContainerEventListener(eventType, response, thisArg))
                return;
            var listenerList = EventManager.commEventList[eventType];
            if (listenerList == null) {
                listenerList = new Array();
                EventManager.commEventList["" + eventType] = listenerList;
            }
            listenerList.push({ func: response, owner: thisArg });
        }
        static isContainerEventListener(eventType, response, thisArg) {
            var listenerList = EventManager.commEventList["" + eventType];
            if (listenerList != null) {
                for (var i = 0; i < listenerList.length; i++) {
                    if (listenerList[i]["func"] == response && listenerList[i]["owner"] == thisArg) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    EventManager.PREFIX = "PKT_";
    EventManager.packetEventList = {};
    EventManager.commEventList = {};
    EventManager.eventCachePool = {};
    EventManager.eventSendCacheList = [];
    EventManager.packetCachePool = {};
    EventManager.packetSendCacheList = [];

    class RadioButton extends CheckBox {
        constructor() {
            super();
            this.UI_PREFIX = "ui#radioButton#";
        }
        createChildren() {
            super.createChildren();
        }
        initData() {
            let s = this;
            s.stateArray = [Button.STATUS_NORMAL, Button.STATUS_CHECKED];
            if (!RadioButton.radio_normalTexture) {
                let normalSpr = UISkin.radioOff;
                var htmlC = normalSpr.drawToCanvas(normalSpr.width, normalSpr.height, 0, 0);
                RadioButton.radio_normalTexture = new Laya.Texture(htmlC.getTexture());
                let checkSpr = UISkin.radioOn;
                htmlC = checkSpr.drawToCanvas(checkSpr.width, checkSpr.height, 0, 0);
                RadioButton.radio_checkTexture = new Laya.Texture(htmlC.getTexture());
            }
        }
        onTouchEvent(event) {
            let s = this;
            if (!s.enabled || s.currentState == Button.STATUS_DISABLE) {
                event.stopPropagation();
                return;
            }
            if (event.currentTarget == s) {
                if (s._testPixelEnable && !s.testPixel32(s.mouseX, s.mouseY)) {
                    event.stopPropagation();
                    return;
                }
                if (event.type == BasicUIEvent.TOUCH_BEGIN) {
                    s.alpha = 0.8;
                    s.touchId = event.touchId;
                }
                else if (event.type == BasicUIEvent.TOUCH_END) {
                    s.alpha = 1;
                    if (s.touchId == -1)
                        return;
                    s.touchId = -1;
                    if (s.selected)
                        return;
                    s.selected = !s._selected;
                    s.onPlaySound();
                }
            }
            s.invalidate();
        }
        initDisplay() {
            let s = this;
            s.setSkins([RadioButton.radio_normalTexture, RadioButton.radio_checkTexture]);
        }
        set selected(value) {
            let s = this;
            s._selected = value;
            s._currentState = (s._selected ? Button.STATUS_CHECKED : Button.STATUS_NORMAL);
            if (s._selected && StringUtil.isUsage(s._groupName)) {
                var myevent = MyEvent.getEvent(s.UI_PREFIX + s._groupName);
                myevent.addItem("caller", s);
                myevent.addItem("groupName", s._groupName);
                myevent.send();
            }
            s.invalidate();
        }
        get selected() {
            return this._selected;
        }
        set groupName(value) {
            let s = this;
            if (StringUtil.isUsage(s._groupName)) {
                EventManager.removeEventListener(s.UI_PREFIX + s._groupName, s.onEventToggle, s);
            }
            s._groupName = value;
            if (StringUtil.isUsage(s._groupName)) {
                EventManager.addEventListener(s.UI_PREFIX + s._groupName, s.onEventToggle, s);
            }
        }
        get groupName() {
            return this._groupName;
        }
        onEventToggle(event) {
            let s = this;
            if (StringUtil.isUsage(s._groupName) && event.getItem("groupName") == s._groupName) {
                if (event.getItem("caller") != s) {
                    s.selected = false;
                }
                else {
                    if (s.clickFun && s.clickFunObj) {
                        s.clickFun.call(s.clickFunObj, event);
                    }
                }
                s.dispatchEventWith(BasicUIEvent.CHANGE, false, { caller: s, status: s.currentState });
            }
        }
        setSkins(skins) {
            let s = this;
            if (!skins || skins.length < 1 || skins.length > 2) {
                console.warn("RadioButton皮肤数量不能小于1或者大于2");
                return;
            }
            s._initDisplayData = true;
            for (let i = 0, len = s.stateArray.length; i < len; ++i) {
                if (skins[i]) {
                    s._textureDict[s.stateArray[i]] = skins[i];
                }
                else {
                    s._initDisplayData = false;
                    console.warn("指定的状态数和状态图片数不一致");
                    break;
                }
            }
            if (s._initDisplayData)
                s.setSize(skins[0].sourceWidth, skins[0].sourceHeight);
            s.invalidate();
        }
    }

    class Slider extends Progress {
        constructor() {
            super();
        }
        setSkin(bg = null, skin = null, bar = null) {
            super.setSkin(bg, skin);
            this.skinBar = bar || UISkin.sliderBar;
            this.addChild(this.skinBar);
            this.skinBar.on(BasicUIEvent.TOUCH_BEGIN, this, this.onTouch);
            this.layout();
            this.value = 0;
        }
        onTouch(e) {
            switch (e.type) {
                case BasicUIEvent.TOUCH_BEGIN:
                    this.stage.on(BasicUIEvent.TOUCH_END, this, this.onTouch);
                    this.stage.on(BasicUIEvent.TOUCH_MOVE, this, this.onTouch);
                    this.dispEvent(BasicUIEvent.START);
                    break;
                case BasicUIEvent.TOUCH_MOVE:
                    this.moveDo(e.stageX, e.stageY);
                    this.dispEvent(BasicUIEvent.MOVE);
                    break;
                case BasicUIEvent.TOUCH_END:
                    this.stage.off(BasicUIEvent.TOUCH_END, this, this.onTouch);
                    this.stage.off(BasicUIEvent.TOUCH_MOVE, this, this.onTouch);
                    this.dispEvent(BasicUIEvent.OVER);
                    break;
            }
        }
        moveDo(x, y) {
            let s = this;
            var p = s.globalToLocal(new Point(x, y));
            var v;
            if (s.type == Style.HORIZONTAL)
                v = p.x / s.skinProgress.width;
            else
                v = p.y / s.skinProgress.width;
            s.value = v;
        }
        set value(v) {
            v = v < 0 ? 0 : v > 1 ? 1 : v;
            this._value = v;
            this.skinProgress.scaleX = v;
            if (this.type == Style.HORIZONTAL)
                this.skinBar.x = this.skinProgress.width * v;
            else
                this.skinBar.y = this.skinProgress.width * v;
        }
        get value() {
            return this._value;
        }
        layout(type = Style.HORIZONTAL, interval = 0) {
            this.type = type;
            if (type == Style.VERTICAL) {
                var angle = 90;
                this.skinBar.x = -this.skinProgress.height >> 1;
            }
            else {
                var angle = 0;
                this.skinBar.y = this.skinProgress.height >> 1;
            }
            this.skinBg.rotation = angle;
            this.skinProgress.rotation = angle;
            this.value = this._value;
        }
    }

    class TabBar extends RadioButton {
        constructor() {
            super();
        }
        createChildren() {
            super.createChildren();
        }
        initData() {
            let s = this;
            s.UI_PREFIX = "ui#TabBar#";
            s.stateArray = [Button.STATUS_NORMAL, Button.STATUS_CHECKED];
            if (!TabBar.tabBar_normalTexture) {
                let normalSpr = UISkin.getRect(TabBar.tabDefaultWidth, TabBar.tabDefaultHeight, UIColor.white);
                var htmlC = normalSpr.drawToCanvas(normalSpr.width, normalSpr.height, 0, 0);
                TabBar.tabBar_normalTexture = new Laya.Texture(htmlC.getTexture());
                let checkSpr = UISkin.getRect(TabBar.tabDefaultWidth, TabBar.tabDefaultHeight, UIColor.gray);
                htmlC = checkSpr.drawToCanvas(checkSpr.width, checkSpr.height, 0, 0);
                TabBar.tabBar_checkTexture = new Laya.Texture(htmlC.getTexture());
            }
        }
        initDisplay() {
            let s = this;
            s.setSkins([TabBar.tabBar_normalTexture, TabBar.tabBar_checkTexture]);
        }
        draw() {
            let s = this;
            if (!s._initDisplayData) {
                s.initDisplay();
            }
            if (s._imgDisplay == null)
                return;
            s._imgDisplay.texture = s._textureDict[s._currentState];
            if (s._label) {
                if (!s._label.parent)
                    s.addChild(s._label);
                s._label.text = s._text;
                s._label.fontSize = s._fontSize;
                s._label.fontName = s._fontName;
                s._label.bold = s._labelBold;
                s._label.italic = s._labelItalic;
                s._label.lineSpacing = s._labelLineSpacing;
                s._label.multiline = s._labelMultiline;
                s._label.stroke = s._labelStroke;
                s._label.strokeColor = s._labelStrokeColor;
                s._label.onInvalidate(null);
                if (!isNaN(s._labelMarginLeft)) {
                    s._label.x = s._labelMarginLeft;
                }
                else {
                    s._label.x = (s.width - s._label.width) / 2;
                }
                if (!isNaN(s._labelMarginTop)) {
                    s._label.y = s._labelMarginTop;
                }
                else {
                    s._label.y = (s.height - s._label.height) / 2;
                }
            }
        }
    }
    TabBar.tabDefaultWidth = 60;
    TabBar.tabDefaultHeight = 30;

    class TextArea extends Group {
        constructor() {
            super();
            this._text = "";
            this._textField = null;
            this._fontSize = Style.fontSize;
            this._color = Style.LABEL_TEXT;
            this._fontName = Style.fontName;
            this._hAlign = "left";
            this._vAlign = "top";
            this._bold = false;
            this._italic = false;
            this._lineSpacing = 0;
            this._stroke = 0;
            this._strokeColor = 0x003350;
            this._html = false;
            this._editable = false;
            this._maxChars = 0;
            this._restrict = null;
            this._inputType = null;
            this._followForce = false;
            this._follow = TextArea.FOLLOW_NONE;
            this.isAddScollListener = false;
            this._link = null;
            this._paddingLeft = 0;
            this._paddingRight = 0;
            this._paddingTop = 0;
            this._paddingBottom = 0;
            this._isTouchBegin = false;
            this._touchPoint = null;
            this.moveDelta = 0;
        }
        createChildren() {
            super.createChildren();
            this._textField = new TextField();
            this._textField.on(BasicUIEvent.CHANGE, this, this.onTextChange);
            this.addChild(this._textField);
        }
        initData() {
            super.initData();
        }
        onSetScrollText(scroll) {
            if (scroll && !this.isAddScollListener) {
                this.isAddScollListener = true;
                this.touchNonePixel = true;
                this.addEventListener(BasicUIEvent.TOUCH_BEGIN, this.onTouchBegin, this);
                this.addEventListener(BasicUIEvent.TOUCH_END, this.onTouchEnd, this);
                this.addEventListener(BasicUIEvent.TOUCH_MOVE, this.onTouchMove, this);
                this.addEventListener(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchCancel, this);
            }
            else if (!scroll && this.isAddScollListener) {
                this.isAddScollListener = false;
                this.touchNonePixel = false;
                this.removeEventListener(BasicUIEvent.TOUCH_BEGIN, this.onTouchBegin, this);
                this.removeEventListener(BasicUIEvent.TOUCH_END, this.onTouchEnd, this);
                this.removeEventListener(BasicUIEvent.TOUCH_MOVE, this.onTouchMove, this);
                this.removeEventListener(BasicUIEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchCancel, this);
            }
        }
        onTouchBegin(event) {
            this._isTouchBegin = true;
            this.moveDelta = 0;
            if (this._touchPoint == null)
                this._touchPoint = new Point();
            this._touchPoint.x = event.stageX;
            this._touchPoint.y = event.stageY;
        }
        onTouchEnd(event) {
            this._isTouchBegin = false;
        }
        onTouchMove(event) {
            if (this._isTouchBegin) {
                this.moveDelta += Math.abs(event.stageY - this._touchPoint.y);
                if (this.moveDelta >= this._fontSize) {
                    this.moveDelta -= this._fontSize;
                    if (event.stageY - this._touchPoint.y > 0) {
                    }
                    else {
                    }
                }
                this._touchPoint.x = event.stageX;
                this._touchPoint.y = event.stageY;
            }
        }
        onTouchCancel(event) {
            this._isTouchBegin = false;
        }
        onTextChange(event) {
            this._text = this._textField.text;
        }
        set paddingLeft(value) {
            if (this._paddingLeft != value) {
                this._paddingLeft = value;
                this.invalidate();
            }
        }
        get paddingLeft() {
            return this._paddingLeft;
        }
        set paddingRight(value) {
            if (this._paddingRight != value) {
                this._paddingRight = value;
                this.invalidate();
            }
        }
        get paddingRight() {
            return this._paddingRight;
        }
        set paddingTop(value) {
            if (this._paddingTop != value) {
                this._paddingTop = value;
                this.invalidate();
            }
        }
        get paddingTop() {
            return this._paddingTop;
        }
        set paddingBottom(value) {
            if (this._paddingBottom != value) {
                this._paddingBottom = value;
                this.invalidate();
            }
        }
        get paddingBottom() {
            return this._paddingBottom;
        }
        get text() {
            return this._text;
        }
        set text(value) {
            if (this._text != value) {
                this._text = value;
                if (this._html) {
                }
                else {
                    if (this._text == null) {
                        this._text = "";
                    }
                }
                this.invalidate();
            }
        }
        append(value) {
            var oldLines = this._textField.lines.length;
            var oldscrollV = this._textField.scrollY;
            if (this._html) {
            }
            else {
                if (this._follow == TextArea.FOLLOW_TOP) {
                    this._text = value + this._text;
                    this.draw();
                }
                else {
                    this._text += value;
                    this.draw();
                    if (this._textField.textHeight > this.height) {
                        this.onSetScrollText(true);
                    }
                    else {
                        this.onSetScrollText(false);
                    }
                }
            }
            if (this._follow != TextArea.FOLLOW_NONE) {
                if (this._follow == TextArea.FOLLOW_TOP) {
                    if (oldLines == 1 || this._followForce) {
                        this.scrollTo(1);
                    }
                }
                else {
                    if (oldLines == oldscrollV || this._followForce) {
                        this.scrollTo(this._textField.lines.length);
                    }
                }
            }
        }
        scrollTo(value) {
        }
        getTextField() {
            return this._textField;
        }
        draw() {
            super.draw();
            let s = this;
            if (s._textField == null)
                return;
            if (s._fontName != null) {
                s._textField.font = s.fontName;
            }
            if (s._color >= 0)
                s._textField.color = UIColor.convertColor(s._color);
            if (s._fontSize > 0)
                s._textField.fontSize = s._fontSize;
            s._textField.bold = s._bold;
            s._textField.italic = s._italic;
            if (s._html) {
            }
            else {
                s._textField.text = s._text;
            }
            s._textField.stroke = s._stroke;
            if (s._textField.width != s.width)
                s._textField.width = s.width;
            if (s._textField.height != s.height)
                s._textField.height = s.height;
            var newWidth = s._textField.width - s._paddingLeft - s._paddingRight;
            var newHeight = s._textField.height - s._paddingTop - s._paddingBottom;
            s._textField.width = newWidth;
            s._textField.height = newHeight;
            s._textField.x = s._paddingLeft;
            s._textField.y = s._paddingTop;
            s._textField.align = s._hAlign;
            s._textField.valign = s._vAlign;
            if (s._textField.textHeight > s.height) {
                s.onSetScrollText(true);
            }
            else {
                s.onSetScrollText(false);
            }
        }
        set italic(value) {
            if (this._italic != value) {
                this._italic = value;
                this.invalidate();
            }
        }
        get italic() {
            return this._italic;
        }
        set bold(value) {
            if (this._bold != value) {
                this._bold = value;
                this.invalidate();
            }
        }
        get bold() {
            return this._bold;
        }
        set fontName(value) {
            if (this._fontName != value) {
                this._fontName = value;
                this.invalidate();
            }
        }
        get fontName() {
            return this._fontName;
        }
        set fontSize(value) {
            if (this._fontSize != value) {
                this._fontSize = value;
                this.invalidate();
            }
        }
        get fontSize() {
            return this._fontSize;
        }
        set color(value) {
            if (this._color != value) {
                this._color = value;
                this.invalidate();
            }
        }
        get color() {
            return this._color;
        }
        get lineSpacing() {
            return this._lineSpacing;
        }
        set lineSpacing(value) {
            if (this._lineSpacing != value) {
                this._lineSpacing = value;
                this.invalidate();
            }
        }
        get stroke() {
            return this._stroke;
        }
        set stroke(value) {
            if (this._stroke != value) {
                this._stroke = value;
                this.invalidate();
            }
        }
        get strokeColor() {
            return this._strokeColor;
        }
        set strokeColor(value) {
            if (this._strokeColor != value) {
                this._strokeColor = value;
                this.invalidate();
            }
        }
        get hAlign() {
            return this._hAlign;
        }
        set hAlign(value) {
            if (this._hAlign != value) {
                this._hAlign = value;
                this.invalidate();
            }
        }
        get vAlign() {
            return this._vAlign;
        }
        set vAlign(value) {
            if (this._vAlign != value) {
                this._vAlign = value;
                this.invalidate();
            }
        }
        set followForce(value) {
            this._followForce = value;
        }
        get followForce() {
            return this._followForce;
        }
        set follow(value) {
            this._follow = value;
        }
        get follow() {
            return this._follow;
        }
        set html(value) {
            if (this._html != value) {
                this._html = value;
                if (this._html) {
                }
                else {
                }
                this.invalidate();
            }
        }
        get html() {
            return this._html;
        }
        set editable(value) {
            if (this._editable != value) {
                this._editable = value;
                this.invalidate();
            }
        }
        get editable() {
            return this._editable;
        }
        set maxChars(value) {
            if (this._maxChars != value) {
                this._maxChars = value;
                this.invalidate();
            }
        }
        get maxChars() {
            return this._maxChars;
        }
        set restrict(value) {
            if (this._restrict != value) {
                this._restrict = value;
                this.invalidate();
            }
        }
        get restrict() {
            return this._restrict;
        }
        set inputType(value) {
            if (this._inputType != value) {
                this._inputType = value;
                this.invalidate();
            }
        }
        get inputType() {
            return this._inputType;
        }
    }
    TextArea.FOLLOW_NONE = "none";
    TextArea.FOLLOW_TOP = "top";
    TextArea.FOLLOW_BOTTOM = "bottom";

    class TextInput extends Group {
        constructor() {
            super();
            this._textField = null;
            this._text = "";
            this._fontName = Style.fontName;
            this._fontSize = Style.fontSize;
            this._fontColor = Style.TEXTINPUT_COLOR;
            this._hAlign = "left";
            this._vAlign = "top";
            this._bold = false;
            this._italic = false;
            this._multiline = false;
            this._stroke = 0;
            this._wordWrap = true;
            this._maxChars = 0;
            this._restrict = null;
            this._inputType = Laya.Input.TYPE_TEXT;
            this._paddingLeft = 0;
            this._paddingRight = 0;
            this._paddingTop = 0;
            this._paddingBottom = 0;
        }
        createChildren() {
            super.createChildren();
            this.bgColor = Style.INPUT_TEXT;
            this.clip = false;
            this._textField = new Laya.Input();
            this._textField.width = this.width;
            this._textField.height = this.height;
            this._textField.type = Laya.Input.TYPE_TEXT;
            this._textField.on(BasicUIEvent.CHANGE, this, this.onTextChange);
            this.addChild(this._textField);
        }
        onTextChange(event) {
            this._text = this._textField.text;
        }
        getTextField() {
            return this._textField;
        }
        draw() {
            super.draw();
            let s = this;
            if (!s._textField)
                return;
            if (s._fontName != null) {
                s._textField.font = s._fontName;
            }
            let newWidth = s.width - s._paddingLeft - s._paddingRight;
            let newHeight = s.height - s._paddingTop - s._paddingBottom;
            s._textField.width = newWidth;
            s._textField.height = newHeight;
            s._textField.x = s._paddingLeft;
            s._textField.y = s._paddingTop;
            s._textField.color = s._fontColor;
            if (s._fontSize > 0)
                s._textField.fontSize = s._fontSize;
            s._textField.align = s._hAlign;
            s._textField.valign = s._vAlign;
            s._textField.bold = s._bold;
            s._textField.italic = s._italic;
            s._textField.multiline = s._multiline;
            s._textField.stroke = s._stroke;
            s._textField.type = s._inputType;
            s._textField.text = s._text;
            s._textField.wordWrap = s._wordWrap;
            s._textField.maxChars = s._maxChars;
            if (StringUtil.isUsage(s._restrict))
                s._textField.restrict = s._restrict;
        }
        set paddingLeft(value) {
            if (this._paddingLeft != value) {
                this._paddingLeft = value;
                this.invalidate();
            }
        }
        get paddingLeft() {
            return this._paddingLeft;
        }
        set paddingRight(value) {
            if (this._paddingRight != value) {
                this._paddingRight = value;
                this.invalidate();
            }
        }
        get paddingRight() {
            return this._paddingRight;
        }
        set paddingTop(value) {
            if (this._paddingTop != value) {
                this._paddingTop = value;
                this.invalidate();
            }
        }
        get paddingTop() {
            return this._paddingTop;
        }
        set paddingBottom(value) {
            if (this._paddingBottom != value) {
                this._paddingBottom = value;
                this.invalidate();
            }
        }
        get paddingBottom() {
            return this._paddingBottom;
        }
        set fontName(value) {
            if (this._fontName != value) {
                this._fontName = value;
                this.invalidate();
            }
        }
        get fontName() {
            return this._fontName;
        }
        set fontSize(value) {
            if (this._fontSize != value) {
                this._fontSize = value;
                this.invalidate();
            }
        }
        get fontSize() {
            return this._fontSize;
        }
        set fontColor(value) {
            let val = UIColor.convertColor(value);
            if (this._fontColor != val) {
                this._fontColor = value;
                this.invalidate();
            }
        }
        get fontColor() {
            return this._fontColor;
        }
        set text(t) {
            if (this._text != t) {
                this._text = t;
                this.invalidate();
            }
        }
        get text() {
            return this._text;
        }
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            if (this._multiline != value) {
                this._multiline = value;
                this.invalidate();
            }
        }
        get wordWrap() {
            return this._wordWrap;
        }
        set wordWrap(value) {
            if (this._wordWrap != value) {
                this._wordWrap = value;
                this.invalidate();
            }
        }
        get stroke() {
            return this._stroke;
        }
        set stroke(value) {
            if (this._stroke != value) {
                this._stroke = value;
                this.invalidate();
            }
        }
        get hAlign() {
            return this._hAlign;
        }
        set hAlign(value) {
            if (this._hAlign != value) {
                this._hAlign = value;
                this.invalidate();
            }
        }
        get vAlign() {
            return this._vAlign;
        }
        set vAlign(value) {
            if (this._vAlign != value) {
                this._vAlign = value;
                this.invalidate();
            }
        }
        setFocus() {
            if (this._textField) {
                this._textField.focus = true;
            }
        }
        set maxChars(value) {
            if (this._maxChars != value) {
                this._maxChars = value;
                this.invalidate();
            }
        }
        get maxChars() {
            return this._maxChars;
        }
        set restrict(value) {
            if (this._restrict != value) {
                this._restrict = value;
                this.invalidate();
            }
        }
        get restrict() {
            return this._restrict;
        }
        set inputType(value) {
            if (this._inputType != value) {
                this._inputType = value;
                this.invalidate();
            }
        }
        get inputType() {
            return this._inputType;
        }
    }

    class UICreator {
        constructor() {
        }
        static createImage(texture, pr = null, px = 0, py = 0, scale9Rect = []) {
            let img = new Image$1;
            if (pr) {
                pr.addChild(img);
                img.x = px;
                img.y = py;
            }
            img.texture = texture;
            return img;
        }
        static createImageNumber(pr, px, py, imageAlias, sheetAlias = "", verticalAlign = "top", horizontalAlign = "left", defaultText = null) {
            let imageNumber = new ImageNumber;
            imageNumber.init(imageAlias, sheetAlias, verticalAlign, horizontalAlign);
            imageNumber.text = defaultText;
            if (pr) {
                imageNumber.show(pr, px, py);
            }
            return imageNumber;
        }
        static createButton(skins, pr = null, px = 0, py = 0, clickFun = null, funObj = null, clickSound = null) {
            let button = new Button;
            button.setSkins(skins);
            button.setClick(clickFun, funObj);
            button.sound = clickSound;
            if (pr) {
                pr.addChild(button);
                button.x = px;
                button.y = py;
            }
            return button;
        }
        static createCheckBox(skins, label, clickFun = null, funObj = null, clickSound = null) {
            let box = new CheckBox;
            box.setSkins(skins);
            box.setClick(clickFun, funObj);
            box.label = label;
            box.sound = clickSound;
            return box;
        }
        static createRadioButton(skins, groupName, label, clickFun = null, funObj = null, clickSound = null) {
            let radio = new RadioButton;
            radio.setSkins(skins);
            radio.setClick(clickFun, funObj);
            radio.groupName = groupName;
            radio.label = label;
            radio.sound = clickSound;
            return radio;
        }
        static createTabBar(skins, groupName, label = null, clickFun = null, funObj = null, clickSound = null) {
            let tabBar = new TabBar;
            tabBar.setSkins(skins);
            tabBar.setClick(clickFun, funObj);
            tabBar.label = label;
            tabBar.sound = clickSound;
            return tabBar;
        }
        static createLabel(pr, px, py, fonsize = 26, text = "") {
            let label = new Label;
            if (pr) {
                pr.addChild(label);
                label.x = px;
                label.y = py;
            }
            label.fontSize = fonsize;
            label.text = text;
            label.showBg = false;
            label.autoSize = true;
            return label;
        }
        static createTextArea(pr, px, py, width, height, text = "") {
            let textArea = new TextArea;
            if (pr) {
                pr.addChild(textArea);
                textArea.x = 200;
                textArea.y = 100;
            }
            textArea.width = 300;
            textArea.height = 300;
            textArea.showBg = true;
            textArea.text = text;
            return textArea;
        }
        static createTextInput(pr, px, py, width, height) {
            let textInput = new TextInput;
            if (pr) {
                pr.addChild(textInput);
                textInput.x = px;
                textInput.y = py;
            }
            textInput.showBg = true;
            textInput.width = width;
            textInput.height = height;
            return textInput;
        }
        static createList(pr, px, py, width, height, itemRenderer, listData, gap = 10, line = 1, lineGap = 10, layout = Style.VERTICAL) {
            let list = new List;
            if (pr) {
                pr.addChild(list);
                list.x = px;
                list.y = py;
            }
            list.width = width;
            list.height = height;
            list.itemRenderer = itemRenderer;
            list.gap = gap;
            list.line = line;
            list.lineGap = lineGap;
            list.data = listData;
            return list;
        }
        static createSpineAnimation(skeletonName, _path = null) {
        }
        createProgress(bg = null, skin = null, pr = null, px = 0, py = 0) {
            let progress = new Progress();
            progress.setSkin(bg, skin);
            if (pr) {
                pr.addChild(progress);
                progress.x = px;
                progress.y = py;
            }
            return progress;
        }
        createSlider(bg = null, skin = null, bar = null, pr = null, px = 0, py = 0) {
            let slider = new Slider();
            slider.setSkin(bg, skin, bar);
            if (pr) {
                pr.addChild(slider);
                slider.x = px;
                slider.y = py;
            }
            return slider;
        }
        static getPixel32(target, x, y) {
            if (target && target.texture) {
                var locolPoint = target.globalToLocal(new Point(x, y));
                return target.texture.getTexturePixels(locolPoint.x, locolPoint.y, 1, 1);
            }
            return null;
        }
        static testPixel32(target, x, y) {
            var datas = this.getPixel32(target, x, y);
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] > 0) {
                    return true;
                }
            }
            return false;
        }
    }

    class BaseScene extends BasicGroup {
        constructor() {
            super();
            this.isClear = false;
        }
        onEnable() {
            super.onEnable();
            this.initData();
            this.init();
        }
        onDisable() {
            super.onDisable();
            this.hide();
        }
        init() {
        }
        initData() {
            let s = this;
            s._stage = Laya.stage;
            s.modulePath = "../laya/assets";
            s.skeletonPath = s.modulePath + "/skeleton/";
            s.soundPath = s.modulePath + "/sound/";
            s.videopath = s.modulePath + "video/";
        }
        hide() {
            console.log("remove" + Global.getQualifiedClassName(this));
        }
    }

    class ListItemRenderer extends DefaultRenderer {
        constructor() {
            super();
        }
        initData() {
        }
        draw() {
            if (this.itemImage) {
                this.width = this.itemImage.texture.sourceWidth;
                this.height = this.itemImage.texture.sourceHeight;
            }
        }
        destroy() {
            let s = this;
            if (s.itemImage) {
                if (s.itemImage.parent) {
                    s.itemImage.parent.removeChild(s.itemImage);
                }
                s.itemImage = null;
            }
        }
        validateNow() {
            let s = this;
            if (s.data) {
                if (!s.itemImage) {
                    s.itemImage = new Image$1;
                    s.addChild(s.itemImage);
                }
                s.itemImage.texture = Laya.loader.getRes(s.data.res);
                s.onInvalidate(null);
            }
        }
    }

    class Scroller extends BasicGroup {
        constructor(w, h, content, align = Style.VERTICAL) {
            super();
            this.barVisible = false;
            this.mouseEnable = false;
            this.mouseOver = false;
            let s = this;
            s.width = w;
            s.height = h;
            s.addEventListener(BasicUIEvent.TOUCH_BEGIN, s.onTouch, s);
            s.startPos = new Point;
            s.stPos = new Point;
            s._contentPos = new Point;
            s.content = content;
            s.alignType = align;
            s.viewPort = UISkin.getRect(w, h, UIColor.white);
            s.addChildAt(s.viewPort, 0);
            s.viewPort.visible = false;
            s.layout(align);
        }
        onTouch(e) {
            let s = this;
            switch (e.type) {
                case BasicUIEvent.TOUCH_BEGIN:
                    s.stage.on(BasicUIEvent.TOUCH_MOVE, s, s.onTouch);
                    s.stage.on(BasicUIEvent.TOUCH_END, s, s.onTouch);
                    s.stPos.x = e.stageX;
                    s.stPos.y = e.stageY;
                    s.startPos.x = e.stageX - s._contentPos.x;
                    s.startPos.y = e.stageY - s._contentPos.y;
                    s.hideShow(1);
                    s.startTime = Date.now();
                    break;
                case BasicUIEvent.TOUCH_MOVE:
                    s.moveDo(e.stageX, e.stageY);
                    break;
                case BasicUIEvent.TOUCH_END:
                    s.stage.off(BasicUIEvent.TOUCH_MOVE, s, s.onTouch);
                    s.stage.off(BasicUIEvent.TOUCH_END, s, s.onTouch);
                    s.hideShow(0, 100);
                    s.timeMove(e.stageX, e.stageY);
                    break;
            }
        }
        setMouseWheelEnable(value) {
            let s = this;
            if (s.mouseEnable == value)
                return;
            if (s.alignType != Style.FREE) {
                s.mouseEnable = value;
                if (s.mouseEnable) {
                    s.addMouseEvent();
                }
                else {
                    s.removeMouseEvent();
                }
            }
        }
        addMouseEvent() {
            let s = this;
            s.addCanvasEventListener("mousewheel", s.onMouseWheel, s);
        }
        removeMouseEvent() {
            let s = this;
            if (s.canvas && s.mouseWheelFun) {
                s.canvas.removeEventListener("mousewheel", s.mouseWheelFun);
            }
        }
        addCanvasEventListener(type, fun, funObj) {
            let s = this;
            if (!s.canvas) {
                s.canvas = document.getElementById("layaCanvas");
            }
            s.mouseWheelFun = fun.bind(funObj);
            s.canvas.addEventListener(type, s.mouseWheelFun);
        }
        onMouseWheel(evt) {
            let s = this;
            let pos = s.globalToLocal(new Point(evt.x, evt.y), false);
            if (pos.x >= s.viewPort.x && pos.x <= s.viewPort.x + s.viewPort.width && pos.y >= s.viewPort.y && pos.y <= s.viewPort.y + s.viewPort.height) {
                s.mouseWheelMove(evt.deltaY);
                s.hideShow(1);
            }
            else {
                s.hideShow(0);
            }
        }
        timeMove(x, y) {
            let s = this;
            if (s.alignType == Style.FREE)
                return;
            var time = Date.now() - s.startTime;
            if (time < 500) {
                var target = s._contentPos;
                Tween.clearTween(target);
                var dx = x - s.stPos.x;
                var dy = y - s.stPos.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                var value = (distance / time) * 100;
                if (s.alignType == Style.VERTICAL) {
                    var sign = dy > 0 ? 1 : -1;
                    value *= sign;
                    var h = target.y + value;
                    if (h > 0 && target.y + value > 0)
                        h = 0;
                    if (h < 0 && target.y + value < (s.viewPort.height - s._content.height))
                        h = s.viewPort.height - s._content.height;
                    var tw = Tween.to(target, { y: h }, 400, Ease.sineOut, Laya.Handler.create(s, s.setBarPos));
                    tw.update = Laya.Handler.create(s, s.onChangeUpdate, null, false);
                }
                else if (s.alignType == Style.HORIZONTAL) {
                    var sign = dx > 0 ? 1 : -1;
                    value *= sign;
                    var w = target.x + value;
                    if (w > 0 && target.x + value > 0)
                        w = 0;
                    if (w < 0 && target.x + value < (s.viewPort.width - s._content.width))
                        w = s.viewPort.width - s._content.width;
                    var tw = Tween.to(target, { x: w }, 400, Ease.sineOut, Laya.Handler.create(s, s.setBarPos));
                    tw.update = Laya.Handler.create(s, s.onChangeUpdate, null, false);
                }
            }
        }
        onChangeUpdate() {
            let s = this;
            let rect = s._content.scrollRect;
            rect.x = -s._contentPos.x;
            rect.y = -s._contentPos.y;
            s._content.scrollRect = rect;
        }
        setBarPos() {
            let s = this;
            if (!s.barVisible)
                return;
            if (s.alignType == Style.VERTICAL)
                s.sliderBarV.y = -s._contentPos.y / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
            else if (s.alignType == Style.HORIZONTAL)
                s.sliderBarH.x = -s._contentPos.x / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
            else {
                s.sliderBarV.y = -s._contentPos.y / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
                s.sliderBarH.x = -s._contentPos.x / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
            }
        }
        hideShow(alpha, time = 1000) {
        }
        moveDo(x, y) {
            let s = this;
            if (s.alignType == Style.VERTICAL) {
                s.canMoveY(y);
            }
            else if (s.alignType == Style.HORIZONTAL) {
                s.canMoveX(x);
            }
            else {
                s.canMoveX(x);
                s.canMoveY(y);
            }
        }
        canMoveX(stageX) {
            let s = this;
            var deltaWidth = s.viewPort.width - s._content.width;
            var xx = stageX - s.startPos.x;
            if (xx > deltaWidth && xx < 0) {
                s._contentPos.x = xx;
                let rect = s._content.scrollRect;
                rect.x = -xx;
                s._content.scrollRect = rect;
                s.sliderBarH.x = -xx / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
            }
        }
        canMoveY(stageY) {
            let s = this;
            var deltaHeight = s.viewPort.height - s._content.height;
            var yy = stageY - s.startPos.y;
            if (yy > deltaHeight && yy < 0) {
                s._contentPos.y = yy;
                let rect = s._content.scrollRect;
                rect.y = -yy;
                s._content.scrollRect = rect;
                s.sliderBarV.y = -yy / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
            }
        }
        mouseWheelMove(deltaY) {
            let s = this;
            if (s.alignType == Style.VERTICAL) {
                let deltaHeight = s.viewPort.height - s._content.height;
                if (deltaHeight < 0) {
                    let yy = s._contentPos.y;
                    yy -= deltaY;
                    if (yy < deltaHeight) {
                        yy = deltaHeight;
                    }
                    else if (yy > 0) {
                        yy = 0;
                    }
                    s._contentPos.y = yy;
                    let rect = s._content.scrollRect;
                    rect.y = -yy;
                    s._content.scrollRect = rect;
                    s.sliderBarV.y = -yy / (s._content.height - s.viewPort.height) * (s.viewPort.height - s.sliderBarV.height);
                }
            }
            else if (s.alignType == Style.HORIZONTAL) {
                let deltaWidth = s.viewPort.width - s._content.width;
                if (deltaWidth < 0) {
                    let xx = s._contentPos.x;
                    xx -= deltaY;
                    if (xx < deltaWidth) {
                        xx = deltaWidth;
                    }
                    else if (xx > 0) {
                        xx = 0;
                    }
                    s._contentPos.x = xx;
                    let rect = s._content.scrollRect;
                    rect.x = -xx;
                    s._content.scrollRect = rect;
                    s.sliderBarH.x = -xx / (s._content.width - s.viewPort.width) * (s.viewPort.width - s.sliderBarH.width);
                }
            }
        }
        layout(type = Style.VERTICAL, interval = 0) {
            let s = this;
            s.alignType = type;
            if (s.alignType == Style.FREE) {
                s.setMouseWheelEnable(false);
            }
            if (s.content) {
                s.content.x = s.content.y = 0;
            }
        }
        reset() {
            let s = this;
            s.layout(s.alignType);
        }
        set content(value) {
            let s = this;
            if (s._content == value)
                return;
            if (s._content && s._content.parent) {
                if (s._content instanceof BasicGroup)
                    s._content.removeFromParent(true);
                else
                    s._content.parent.removeChild(s._content);
            }
            s._content = value;
            s._content.scrollRect = new Rectangle(0, 0, s.width, s.height);
            s.addChild(s._content);
        }
        get content() {
            return this._content;
        }
        setSliderBarSkins(barV = null, barH = null) {
            let s = this;
            if (s.sliderBarV && s.sliderBarV != barV) {
                if (s.contains(s.sliderBarV))
                    s.removeChild(s.sliderBarV);
            }
            s.sliderBarV = barV || UISkin.scrollBarV;
            if (s.sliderBarV) {
                s.addChild(s.sliderBarV);
            }
            if (s.sliderBarH && s.sliderBarH != barH) {
                if (s.contains(s.sliderBarV))
                    s.removeChild(s.sliderBarH);
            }
            s.sliderBarH = barH || UISkin.scrollBarH;
            if (s.sliderBarH) {
                s.addChild(s.sliderBarH);
            }
            s.barVisible = true;
            if (s.alignType == Style.VERTICAL) {
                s.removeChild(s.sliderBarH);
            }
            else if (s.alignType == Style.HORIZONTAL) {
                s.removeChild(s.sliderBarV);
            }
            s.setSliderBarPos();
        }
        setSliderBarPos() {
            let s = this;
            if (s.alignType == Style.VERTICAL) {
                s.sliderBarV.x = s.viewPort.width - s.sliderBarV.width;
                s.sliderBarV.y = 0;
            }
            else if (s.alignType == Style.HORIZONTAL) {
                s.sliderBarH.x = 0;
                s.sliderBarH.y = s.viewPort.height - s.sliderBarH.height;
            }
            else {
                s.sliderBarV.x = s.viewPort.width - s.sliderBarV.width;
                s.sliderBarV.y = 0;
                s.sliderBarH.x = 0;
                s.sliderBarH.y = s.viewPort.height - s.sliderBarH.height;
            }
        }
    }

    class ListGroup extends BasicGroup {
        constructor(w, h, type = Style.VERTICAL, interval = 10, itemList = []) {
            super();
            this.itemInterval = 0;
            this.items = [];
            let s = this;
            s.alignType = type;
            s.itemInterval = interval;
            s.contentView = new BasicGroup();
            s.scrollBar = new Scroller(w, h, s.contentView, type);
            s.addChild(s.scrollBar);
            s.width = w;
            s.height = h;
            s.initItem(itemList);
        }
        initItem(items) {
            let s = this;
            if (items.length <= 0)
                return;
            items.forEach(element => {
                s.addItem(element);
            });
            s.invalidate();
        }
        addItem(item) {
            let s = this;
            s.contentView.addChild(item);
            item.on(BasicUIEvent.TOUCH_BEGIN, s, s.onTouch);
            item.on(BasicUIEvent.TOUCH_END, s, s.onTouch);
            s.items.push(item);
        }
        removeItem(item) {
            let s = this;
            if (s.contentView.contains(item)) {
                s.contentView.removeChild(item);
                item.off(BasicUIEvent.TOUCH_BEGIN, s, s.onTouch);
                item.off(BasicUIEvent.TOUCH_END, s, s.onTouch);
                if (item instanceof BasicGroup) {
                    item.dispose();
                }
                s.invalidate();
            }
        }
        layout(type, interval) {
            let s = this;
            let w = 0;
            let h = 0;
            if (type == Style.VERTICAL) {
                w = s.width;
                s.items.forEach((element, index) => {
                    element.x = 0;
                    element.y = 0 + index * (element.height + interval);
                    h = element.y + element.height + interval;
                });
            }
            else if (type == Style.HORIZONTAL) {
                h = s.height;
                s.items.forEach((element, index) => {
                    element.x = 0 + index * (element.width + interval);
                    element.y = 0;
                    w = element.x + element.width + interval;
                });
            }
            s.contentView.width = w;
            s.contentView.height = h;
        }
        renderList(renderer, data = [], executeSelected = true) {
            let s = this;
            if (renderer && data) {
                s.clear();
                s.executeSelected = executeSelected;
                s.itemRenderer = renderer;
                s.dataProvider = data.concat();
                for (let i = 0; i < data.length; ++i) {
                    let displayItemUI = new renderer();
                    displayItemUI.data = data[i];
                    displayItemUI.dataIndex = i;
                    displayItemUI.list = s;
                    displayItemUI.validateNow();
                    s.addItem(displayItemUI);
                }
                s.invalidate();
            }
        }
        setItemList(itemList = []) {
            let s = this;
            s.clear();
            s.initItem(itemList);
        }
        clear() {
            let s = this;
            s.itemRenderer = null;
            if (s.dataProvider && s.dataProvider instanceof Array) {
                s.dataProvider.length = 0;
                s.dataProvider = null;
            }
            s.items.forEach(element => {
                s.removeItem(element);
            });
            s.items.length = 0;
        }
        setMouseWheelEnable(value) {
            let s = this;
            s.scrollBar.setMouseWheelEnable(value);
        }
        twoDistance(a, b) {
            var x = a.x - b.x;
            var y = a.y - b.y;
            return Math.sqrt(x * x + y * y);
        }
        onTouch(e) {
            let s = this;
            if (e.type == BasicUIEvent.TOUCH_BEGIN) {
                s.posStart = new Point(e.stageX, e.stageY);
            }
            else {
                var posEnd = new Point(e.stageX, e.stageY);
                if (s.posStart && s.twoDistance(s.posStart, posEnd) < 20) {
                    s.onClick(e.currentTarget);
                }
                s.posStart = null;
            }
        }
        onClick(item) {
            let s = this;
            if (s.itemRenderer) {
                if (s.itemSelected && s.executeSelected)
                    s.itemSelected.setSelected(false);
                s.itemSelected = item;
                s.itemSelected.setSelected(true);
            }
            else {
                s.itemSelected = item;
            }
            var param = { item: item, index: s.items.indexOf(item) };
            s.dispatchEventWith(BasicUIEvent.ITEM_SELECTED, false, param);
        }
        draw() {
            let s = this;
            s.layout(s.alignType, s.itemInterval);
        }
    }

    class MainScene extends BaseScene {
        constructor() {
            super();
        }
        onEnable() {
            super.onEnable();
        }
        init() {
            let s = this;
            let bg = new Image$1;
            bg.texture = Laya.loader.getRes("../laya/assets/img/bg.png");
            s.addChild(bg);
            bg.left = bg.right = bg.top = bg.bottom = 0;
            s.group_play = new Group;
            s.addChild(s.group_play);
            s.group_play.width = GameConfig.width;
            s.group_play.height = GameConfig.height;
            s.group_play.horizontalCenter = 0;
            s.group_play.verticalCenter = 0;
            s.group_play.clip = false;
            let buttonSkins = [Laya.loader.getRes("../laya/assets/img/A.png"), Laya.loader.getRes("../laya/assets/img/A点击.png")];
            UICreator.createImage(buttonSkins[0], s.group_play, 200, 300);
            UICreator.createImage(buttonSkins[1], s.group_play, 200, 800);
            let listItemDataArr = [
                {
                    res: "../laya/assets/img/A.png"
                },
                {
                    res: "../laya/assets/img/A点击.png"
                },
                {
                    res: "../laya/assets/img/A.png"
                },
                {
                    res: "../laya/assets/img/A点击.png"
                },
                {
                    res: "../laya/assets/img/A.png"
                },
                {
                    res: "../laya/assets/img/A点击.png"
                },
                {
                    res: "../laya/assets/img/A.png"
                },
                {
                    res: "../laya/assets/img/A点击.png"
                },
                {
                    res: "../laya/assets/img/A.png"
                },
                {
                    res: "../laya/assets/img/A点击.png"
                },
                {
                    res: "../laya/assets/img/A.png"
                },
                {
                    res: "../laya/assets/img/A点击.png"
                },
            ];
            let listGroup = new List;
            s.group_play.addChild(listGroup);
            listGroup.x = 1300;
            listGroup.y = 0;
            listGroup.width = 700;
            listGroup.height = 600;
            listGroup.itemRenderer = ListItemRenderer;
            listGroup.gap = 100;
            listGroup.line = 2;
            listGroup.lineGap = 20;
            listGroup.data = listItemDataArr;
            listGroup.addEventListener(BasicUIEvent.ITEM_SELECTED, (ev) => {
                console.log(ev);
            }, s);
            let listGroup2 = new ListGroup(350, 600, Style.VERTICAL, 20);
            listGroup2.renderList(ListItemRenderer, listItemDataArr, true);
            s.group_play.addChild(listGroup2);
            listGroup2.x = 600;
            listGroup2.y = 0;
            listGroup2.setMouseWheelEnable(true);
            let VBar = UICreator.createImage(Laya.loader.getRes("../laya/assets/img/slider_bar_v.png"));
            let hBar = UICreator.createImage(Laya.loader.getRes("../laya/assets/img/slider_bar_h.png"));
            listGroup2.scrollBar.setSliderBarSkins(VBar, hBar);
            listGroup2.addEventListener(BasicUIEvent.ITEM_SELECTED, (data) => {
                console.log(data);
            }, s);
            let scaleImage = UICreator.createImage(Laya.loader.getRes("../laya/assets/img/slider_bar_v.png"), s.group_play, 300, 300, [2, 2, 20, 20]);
            scaleImage.scale(2, 3);
            let res = ResLoader.getInstance().getRes("playSound", "resource/assets/comRes_1.png");
            UICreator.createImage(res.res, s.group_play, 100, 100);
        }
        onClickButton(e) {
            console.log(e);
        }
    }

    class SceneManager {
        constructor() {
            this.gameScale = 1;
            this.designWidth = GameConfig.width;
            this.designHeight = GameConfig.height;
            this.fixDisplayArr = [];
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new SceneManager();
                this._instance.Init();
            }
            return this._instance;
        }
        Init() {
            let s = this;
            s._stage = Laya.stage;
            s.gameLayer = new Laya.Sprite;
            s.gameLayer.width = s.designWidth;
            s.gameLayer.height = s.designHeight;
            s._stage.addChildAt(s.gameLayer, 0);
            s._stage.on(Laya.Event.RESIZE, s, s.contentSizeChanged);
            s.contentSizeChanged();
        }
        contentSizeChanged() {
            let s = this;
            let stageWidth = s._stage.width;
            let stageHeight = s._stage.height;
            let scaleX = stageWidth / s.designWidth;
            let scaleY = stageHeight / s.designHeight;
            if (scaleX < scaleY) {
                s.gameScale = scaleX;
            }
            else {
                s.gameScale = scaleY;
            }
            if (s.gameLayer) {
                s.gameLayer.width = s.designWidth;
                s.gameLayer.height = s.designHeight;
                s.gameLayer.scaleX = s.gameLayer.scaleY = s.gameScale;
                s.gameLayer.x = (stageWidth - s.gameLayer.width * s.gameScale) / 2;
                s.gameLayer.y = (stageHeight - s.gameLayer.height * s.gameScale) / 2;
            }
            s.fixLayout();
        }
        showScene(_scene) {
            let s = this;
            if (_scene) {
                s.gameLayer.addChild(_scene);
                s.setCurrentScene(_scene);
            }
        }
        setCurrentScene(scene) {
            let s = this;
            if (s.currentScene) {
                s.removeScene(s.currentScene);
                s.fixListen(s.currentScene, NaN, NaN, NaN, NaN);
            }
            s.currentScene = scene;
            s.fixListen(s.currentScene, 0, 0, 0, 0);
        }
        removeScene(scene) {
            let s = this;
            if (scene && scene.parent == s.gameLayer) {
                s.gameLayer.removeChild(scene);
                scene = null;
            }
        }
        dispose() {
            let s = this;
            let num = s.gameLayer.numChildren;
            while (num > 0) {
                let child = s.gameLayer.getChildAt(0);
                if (child instanceof BaseScene) {
                    s.removeScene(child);
                }
                else {
                    s.gameLayer.removeChild(child);
                }
                num -= 1;
            }
            if (s.gameLayer && s.gameLayer.parent == s._stage) {
                s._stage.removeChild(s.gameLayer);
                s.gameLayer = null;
            }
            s.currentScene = null;
            s._stage.off(Laya.Event.RESIZE, s, s.contentSizeChanged);
        }
        fixListen(obj, left = NaN, right = NaN, top = NaN, bottom = NaN, relativeParent = null) {
            let s = this;
            let fixObj;
            let index = -1;
            for (let i = 0; i < s.fixDisplayArr.length; ++i) {
                if (s.fixDisplayArr[i].display == obj) {
                    index = i;
                    fixObj = s.fixDisplayArr[i];
                    break;
                }
            }
            if (left != left && right != right && top != top && bottom != bottom) {
                if (fixObj) {
                    s.fixDisplayArr.splice(index, 1);
                    ObjectPool.recycleClass(fixObj);
                }
            }
            else {
                if (!fixObj) {
                    fixObj = ObjectPool.getByClass(FixDisplay);
                    s.fixDisplayArr.push(fixObj);
                }
                fixObj.display = obj;
                fixObj.left = left;
                fixObj.right = right;
                fixObj.top = top;
                fixObj.bottom = bottom;
                fixObj.relativeParent = relativeParent;
            }
            s.fixLayout();
        }
        fixLayout() {
            let s = this;
            let num = s.fixDisplayArr.length;
            let fixObj;
            let parentWidth;
            let parentHeight;
            let thisWidth;
            let thisHeight;
            let relativeObj;
            let newX, newY;
            let localPos;
            let globalPos;
            for (let i = 0; i < num; ++i) {
                fixObj = s.fixDisplayArr[i];
                relativeObj = fixObj.relativeParent ? fixObj.relativeParent : s._stage;
                parentWidth = relativeObj == s._stage ? s._stage.width : relativeObj.width;
                parentHeight = relativeObj == s._stage ? s._stage.height : relativeObj.height;
                thisWidth = fixObj.display.width;
                thisWidth = fixObj.display.height;
                if (isNaN(parentWidth) || parentHeight == undefined) {
                    parentWidth = 0;
                }
                if (isNaN(parentHeight) || parentHeight == undefined) {
                    parentHeight = 0;
                }
                if (isNaN(thisWidth) || thisWidth == undefined) {
                    thisWidth = 0;
                }
                if (isNaN(thisHeight) || thisHeight == undefined) {
                    thisWidth = 0;
                }
                if (!isNaN(fixObj.left) && isNaN(fixObj.right)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(fixObj.left, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newX = localPos.x;
                }
                else if (!isNaN(fixObj.right) && isNaN(fixObj.left)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(parentWidth - fixObj.right, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newX = localPos.x;
                }
                else if (!isNaN(fixObj.left) && !isNaN(fixObj.right)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(fixObj.left, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newX = localPos.x;
                    globalPos = relativeObj.localToGlobal(new Laya.Point(parentWidth - fixObj.right, 0));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    thisWidth = localPos.x - newX;
                }
                if (!isNaN(fixObj.top) && isNaN(fixObj.bottom)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, fixObj.top));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newY = localPos.y;
                }
                else if (!isNaN(fixObj.bottom) && isNaN(fixObj.top)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, parentHeight - fixObj.bottom));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newY = localPos.y;
                }
                else if (!isNaN(fixObj.top) && !isNaN(fixObj.bottom)) {
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, fixObj.top));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    newY = localPos.y;
                    globalPos = relativeObj.localToGlobal(new Laya.Point(0, parentHeight - fixObj.bottom));
                    localPos = fixObj.display.parent.globalToLocal(new Laya.Point(globalPos.x, globalPos.y));
                    thisHeight = localPos.y - newY;
                }
                fixObj.display.x = newX;
                fixObj.display.y = newY;
                if (fixObj.display.width != thisWidth) {
                    fixObj.display.width = thisWidth;
                }
                if (fixObj.display.height != thisHeight) {
                    fixObj.display.height = thisHeight;
                }
            }
        }
    }
    class FixDisplay {
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.stage.bgColor = "#00BFFF";
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.stage.frameRate = Global.FRAME_RATE.toString();
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
            this.showScene();
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
        showScene() {
            let resCount = 0;
            function onLoad() {
                resCount += 1;
                if (resCount == 2) {
                    HeartBeat.init();
                    SceneManager.instance.showScene(new MainScene);
                }
            }
            Laya.loader.load([
                "../laya/assets/img/bg.png",
                "../laya/assets/img/A.png",
                "../laya/assets/img/A点击.png",
                "../laya/assets/img/slider_bar_v.png",
                "../laya/assets/img/slider_bar_h.png",
                "../laya/assets/img/hand.png",
                "../laya/assets/img/playSound.png",
            ], Laya.Handler.create(this, () => {
                onLoad();
            }));
            ResLoader.getInstance().resLoad("http://dev4iandcode.oss-cn-shenzhen.aliyuncs.com/s/platform/interactive/common/interactiveTemplate/mainScratch/moduleRelease/resource.pkg", null, (data) => {
                console.log(data);
                onLoad();
            }, this, "get", "arraybuffer");
        }
    }
    new Main();

}());
