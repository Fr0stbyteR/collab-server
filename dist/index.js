var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let resumeOnReceiverDrain = true;
      let terminateOnDestroy = true;
      function receiverOnDrain() {
        if (resumeOnReceiverDrain)
          ws._socket.resume();
      }
      if (ws.readyState === ws.CONNECTING) {
        ws.once("open", function open() {
          ws._receiver.removeAllListeners("drain");
          ws._receiver.on("drain", receiverOnDrain);
        });
      } else {
        ws._receiver.removeAllListeners("drain");
        ws._receiver.on("drain", receiverOnDrain);
      }
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) {
          resumeOnReceiverDrain = false;
          ws._socket.pause();
        }
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy)
          ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null)
          return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.readyState === ws.OPEN && !resumeOnReceiverDrain) {
          resumeOnReceiverDrain = true;
          if (!ws._receiver._writableState.needDrain)
            ws._socket.resume();
        }
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength)
        return target.slice(0, offset);
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.byteLength === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = Buffer.from(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    try {
      const bufferUtil = require("bufferutil");
      module2.exports = {
        concat,
        mask(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        },
        toArrayBuffer,
        toBuffer,
        unmask(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        }
      };
    } catch (e) {
      module2.exports = {
        concat,
        mask: _mask,
        toArrayBuffer,
        toBuffer,
        unmask: _unmask
      };
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      static get extensionName() {
        return "permessage-deflate";
      }
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(new Error("The deflate stream was closed while data was being processed"));
          }
        }
      }
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
        }
        return params;
      }
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
          if (fin)
            data2 = data2.slice(0, data2.length - 4);
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    try {
      const isValidUTF8 = require("utf-8-validate");
      module2.exports = {
        isValidStatusCode,
        isValidUTF8(buf) {
          return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
        },
        tokenChars
      };
    } catch (e) {
      module2.exports = {
        isValidStatusCode,
        isValidUTF8: _isValidUTF8,
        tokenChars
      };
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var Receiver2 = class extends Writable {
      constructor(options = {}) {
        super();
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._state = GET_INFO;
        this._loop = false;
      }
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = buf.slice(n);
          return buf.slice(0, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = buf.slice(n);
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      startLoop(cb) {
        let err;
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              err = this.getInfo();
              break;
            case GET_PAYLOAD_LENGTH_16:
              err = this.getPayloadLength16();
              break;
            case GET_PAYLOAD_LENGTH_64:
              err = this.getPayloadLength64();
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              err = this.getData(cb);
              break;
            default:
              this._loop = false;
              return;
          }
        } while (this._loop);
        cb(err);
      }
      getInfo() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          this._loop = false;
          return error(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          this._loop = false;
          return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (!this._fragmented) {
            this._loop = false;
            return error(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            this._loop = false;
            return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            this._loop = false;
            return error(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
          }
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (this._payloadLength > 125) {
            this._loop = false;
            return error(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          }
        } else {
          this._loop = false;
          return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            this._loop = false;
            return error(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
          }
        } else if (this._masked) {
          this._loop = false;
          return error(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          return this.haveLength();
      }
      getPayloadLength16() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        return this.haveLength();
      }
      getPayloadLength64() {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          this._loop = false;
          return error(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        return this.haveLength();
      }
      haveLength() {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            this._loop = false;
            return error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked)
            unmask(data, this._mask);
        }
        if (this._opcode > 7)
          return this.controlMessage(data);
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        return this.dataMessage();
      }
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              return cb(error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
            }
            this._fragments.push(buf);
          }
          const er = this.dataMessage();
          if (er)
            return cb(er);
          this.startLoop(cb);
        });
      }
      dataMessage() {
        if (this._fin) {
          const messageLength = this._messageLength;
          const fragments = this._fragments;
          this._totalPayloadLength = 0;
          this._messageLength = 0;
          this._fragmented = 0;
          this._fragments = [];
          if (this._opcode === 2) {
            let data;
            if (this._binaryType === "nodebuffer") {
              data = concat(fragments, messageLength);
            } else if (this._binaryType === "arraybuffer") {
              data = toArrayBuffer(concat(fragments, messageLength));
            } else {
              data = fragments;
            }
            this.emit("message", data, true);
          } else {
            const buf = concat(fragments, messageLength);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              this._loop = false;
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("message", buf, false);
          }
        }
        this._state = GET_INFO;
      }
      controlMessage(data) {
        if (this._opcode === 8) {
          this._loop = false;
          if (data.length === 0) {
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else if (data.length === 1) {
            return error(RangeError, "invalid payload length 1", true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              return error(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
            }
            const buf = data.slice(2);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("conclude", code, buf);
            this.end();
          }
        } else if (this._opcode === 9) {
          this.emit("ping", data);
        } else {
          this.emit("pong", data);
        }
        this._state = GET_INFO;
      }
    };
    module2.exports = Receiver2;
    function error(ErrorCtor, message, prefix, statusCode, errorCode) {
      const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
      Error.captureStackTrace(err, error);
      err.code = errorCode;
      err[kStatusCode] = statusCode;
      return err;
    }
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var { randomFillSync } = require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER } = require_constants();
    var { isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var mask = Buffer.alloc(4);
    var Sender2 = class {
      constructor(socket, extensions) {
        this._extensions = extensions || {};
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._deflating = false;
        this._queue = [];
      }
      static frame(data, options) {
        const merge = options.mask && options.readOnly;
        let offset = options.mask ? 6 : 2;
        let payloadLength = data.length;
        if (data.length >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (data.length > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? data.length + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(data.length, 2);
        } else if (payloadLength === 127) {
          target.writeUInt32BE(0, 2);
          target.writeUInt32BE(data.length, 6);
        }
        if (!options.mask)
          return [target, data];
        randomFillSync(mask, 0, 4);
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (merge) {
          applyMask(data, mask, target, offset, data.length);
          return [target];
        }
        applyMask(data, mask, data, 0, data.length);
        return [target, data];
      }
      close(code, data, mask2, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        if (this._deflating) {
          this.enqueue([this.doClose, buf, mask2, cb]);
        } else {
          this.doClose(buf, mask2, cb);
        }
      }
      doClose(data, mask2, cb) {
        this.sendFrame(Sender2.frame(data, {
          fin: true,
          rsv1: false,
          opcode: 8,
          mask: mask2,
          readOnly: false
        }), cb);
      }
      ping(data, mask2, cb) {
        const buf = toBuffer(data);
        if (buf.length > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        if (this._deflating) {
          this.enqueue([this.doPing, buf, mask2, toBuffer.readOnly, cb]);
        } else {
          this.doPing(buf, mask2, toBuffer.readOnly, cb);
        }
      }
      doPing(data, mask2, readOnly, cb) {
        this.sendFrame(Sender2.frame(data, {
          fin: true,
          rsv1: false,
          opcode: 9,
          mask: mask2,
          readOnly
        }), cb);
      }
      pong(data, mask2, cb) {
        const buf = toBuffer(data);
        if (buf.length > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        if (this._deflating) {
          this.enqueue([this.doPong, buf, mask2, toBuffer.readOnly, cb]);
        } else {
          this.doPong(buf, mask2, toBuffer.readOnly, cb);
        }
      }
      doPong(data, mask2, readOnly, cb) {
        this.sendFrame(Sender2.frame(data, {
          fin: true,
          rsv1: false,
          opcode: 10,
          mask: mask2,
          readOnly
        }), cb);
      }
      send(data, options, cb) {
        const buf = toBuffer(data);
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = buf.length >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        if (perMessageDeflate) {
          const opts = {
            fin: options.fin,
            rsv1,
            opcode,
            mask: options.mask,
            readOnly: toBuffer.readOnly
          };
          if (this._deflating) {
            this.enqueue([this.dispatch, buf, this._compress, opts, cb]);
          } else {
            this.dispatch(buf, this._compress, opts, cb);
          }
        } else {
          this.sendFrame(Sender2.frame(buf, {
            fin: options.fin,
            rsv1: false,
            opcode,
            mask: options.mask,
            readOnly: toBuffer.readOnly
          }), cb);
        }
      }
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(Sender2.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += data.length;
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error("The socket was closed while data was being compressed");
            if (typeof cb === "function")
              cb(err);
            for (let i = 0; i < this._queue.length; i++) {
              const callback = this._queue[i][4];
              if (typeof callback === "function")
                callback(err);
            }
            return;
          }
          this._bufferedBytes -= data.length;
          this._deflating = false;
          options.readOnly = false;
          this.sendFrame(Sender2.frame(buf, options), cb);
          this.dequeue();
        });
      }
      dequeue() {
        while (!this._deflating && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[1].length;
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      enqueue(params) {
        this._bufferedBytes += params[1].length;
        this._queue.push(params);
      }
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      get target() {
        return this[kTarget];
      }
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      get code() {
        return this[kCode];
      }
      get reason() {
        return this[kReason];
      }
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      get error() {
        return this[kError];
      }
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      addEventListener(type, listener, options = {}) {
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = listener;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    function parse(header) {
      const offers = Object.create(null);
      let params = Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(Object.keys(params).map((k) => {
            let values = params[k];
            if (!Array.isArray(values))
              values = [values];
            return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var protocolVersions = [8, 13];
    var closeTimeout = 30 * 1e3;
    var WebSocket3 = class extends EventEmitter {
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._extensions = {};
        this._protocol = "";
        this._readyState = WebSocket3.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._isServer = true;
        }
      }
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      get onclose() {
        return null;
      }
      get onerror() {
        return null;
      }
      get onopen() {
        return null;
      }
      get onmessage() {
        return null;
      }
      get protocol() {
        return this._protocol;
      }
      get readyState() {
        return this._readyState;
      }
      get url() {
        return this._url;
      }
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        this._sender = new Sender2(socket, this._extensions);
        this._receiver = receiver;
        this._socket = socket;
        receiver[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        socket.setTimeout(0);
        socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = WebSocket3.OPEN;
        this.emit("open");
      }
      emitClose() {
        if (!this._socket) {
          this._readyState = WebSocket3.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = WebSocket3.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      close(code, data) {
        if (this.readyState === WebSocket3.CLOSED)
          return;
        if (this.readyState === WebSocket3.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this.readyState === WebSocket3.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = WebSocket3.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._closeTimer = setTimeout(this._socket.destroy.bind(this._socket), closeTimeout);
      }
      ping(data, mask, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      pong(data, mask, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      send(data, options, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      terminate() {
        if (this.readyState === WebSocket3.CLOSED)
          return;
        if (this.readyState === WebSocket3.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this._socket) {
          this._readyState = WebSocket3.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket3, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket3.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket3.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute])
              return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function")
            return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket3.prototype.addEventListener = addEventListener;
    WebSocket3.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket3;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        createConnection: void 0,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: void 0,
        host: void 0,
        path: void 0,
        port: void 0
      };
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
        websocket._url = address.href;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
        websocket._url = address;
      }
      const isSecure = parsedUrl.protocol === "wss:";
      const isUnixSocket = parsedUrl.protocol === "ws+unix:";
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isUnixSocket) {
        throw new SyntaxError(`The URL's protocol must be one of "ws:", "wss:", or "ws+unix:"`);
      }
      if (isUnixSocket && !parsedUrl.pathname) {
        throw new SyntaxError("The URL's pathname is empty");
      }
      if (parsedUrl.hash) {
        throw new SyntaxError("The URL contains a fragment identifier");
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const get = isSecure ? https.get : http.get;
      const protocolSet = new Set();
      let perMessageDeflate;
      opts.createConnection = isSecure ? tlsConnect : netConnect;
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket",
        ...opts.headers
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError("An invalid or duplicated subprotocol was specified");
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isUnixSocket) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req = websocket._req = get(opts);
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req.aborted)
          return;
        req = websocket._req = null;
        websocket._readyState = WebSocket3.CLOSING;
        websocket.emit("error", err);
        websocket.emitClose();
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          const addr = new URL(location, address);
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket3.CONNECTING)
          return;
        req = websocket._req = null;
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket3.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        stream.once("abort", websocket.emitClose.bind(websocket));
        websocket.emit("error", err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
        cb(err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    function receiverOnDrain() {
      this[kWebSocket]._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      websocket.emit("error", err);
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      websocket.pong(data, !websocket._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket3.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket3.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket3.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var https = require("https");
    var net = require("net");
    var tls = require("tls");
    var { createHash } = require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket3 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      constructor(options, callback) {
        super();
        options = {
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          server: null,
          host: null,
          path: null,
          port: null,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(options.port, options.host, options.backlog, callback);
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server2 = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server2.close(() => {
            emitClose(this);
          });
        }
      }
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"] !== void 0 ? req.headers["sec-websocket-key"] : false;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET" || req.headers.upgrade.toLowerCase() !== "websocket" || !key || !keyRegex.test(key) || version !== 8 && version !== 13 || !this.shouldHandle(req)) {
          return abortHandshake(socket, 400);
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            return abortHandshake(socket, 400);
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            return abortHandshake(socket, 400);
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new WebSocket3(null);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server2, map) {
      for (const event of Object.keys(map))
        server2.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server2.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server2) {
      server2._state = CLOSED;
      server2.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      if (socket.writable) {
        message = message || http.STATUS_CODES[code];
        headers = {
          Connection: "close",
          "Content-Type": "text/html",
          "Content-Length": Buffer.byteLength(message),
          ...headers
        };
        socket.write(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
      }
      socket.removeListener("error", socketOnError);
      socket.destroy();
    }
  }
});

// node_modules/bson/lib/error.js
var require_error = __commonJS({
  "node_modules/bson/lib/error.js"(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BSONTypeError = exports2.BSONError = void 0;
    var BSONError = function(_super) {
      __extends(BSONError2, _super);
      function BSONError2() {
        return _super !== null && _super.apply(this, arguments) || this;
      }
      Object.defineProperty(BSONError2.prototype, "name", {
        get: function() {
          return "BSONError";
        },
        enumerable: false,
        configurable: true
      });
      return BSONError2;
    }(Error);
    exports2.BSONError = BSONError;
    var BSONTypeError = function(_super) {
      __extends(BSONTypeError2, _super);
      function BSONTypeError2() {
        return _super !== null && _super.apply(this, arguments) || this;
      }
      Object.defineProperty(BSONTypeError2.prototype, "name", {
        get: function() {
          return "BSONTypeError";
        },
        enumerable: false,
        configurable: true
      });
      return BSONTypeError2;
    }(TypeError);
    exports2.BSONTypeError = BSONTypeError;
  }
});

// node_modules/bson/lib/utils/global.js
var require_global = __commonJS({
  "node_modules/bson/lib/utils/global.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getGlobal = void 0;
    function checkForMath(potentialGlobal) {
      return potentialGlobal && potentialGlobal.Math == Math && potentialGlobal;
    }
    function getGlobal() {
      return checkForMath(typeof globalThis === "object" && globalThis) || checkForMath(typeof window === "object" && window) || checkForMath(typeof self === "object" && self) || checkForMath(typeof global === "object" && global) || Function("return this")();
    }
    exports2.getGlobal = getGlobal;
  }
});

// node_modules/bson/lib/parser/utils.js
var require_utils = __commonJS({
  "node_modules/bson/lib/parser/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.deprecate = exports2.isObjectLike = exports2.isDate = exports2.haveBuffer = exports2.isMap = exports2.isRegExp = exports2.isBigUInt64Array = exports2.isBigInt64Array = exports2.isUint8Array = exports2.isAnyArrayBuffer = exports2.randomBytes = exports2.normalizedFunctionString = void 0;
    var buffer_1 = require("buffer");
    var global_1 = require_global();
    function normalizedFunctionString(fn) {
      return fn.toString().replace("function(", "function (");
    }
    exports2.normalizedFunctionString = normalizedFunctionString;
    function isReactNative() {
      var g = global_1.getGlobal();
      return typeof g.navigator === "object" && g.navigator.product === "ReactNative";
    }
    var insecureRandomBytes = function insecureRandomBytes2(size) {
      var insecureWarning = isReactNative() ? "BSON: For React Native please polyfill crypto.getRandomValues, e.g. using: https://www.npmjs.com/package/react-native-get-random-values." : "BSON: No cryptographic implementation for random bytes present, falling back to a less secure implementation.";
      console.warn(insecureWarning);
      var result = buffer_1.Buffer.alloc(size);
      for (var i = 0; i < size; ++i)
        result[i] = Math.floor(Math.random() * 256);
      return result;
    };
    var detectRandomBytes = function() {
      if (typeof window !== "undefined") {
        var target_1 = window.crypto || window.msCrypto;
        if (target_1 && target_1.getRandomValues) {
          return function(size) {
            return target_1.getRandomValues(buffer_1.Buffer.alloc(size));
          };
        }
      }
      if (typeof global !== "undefined" && global.crypto && global.crypto.getRandomValues) {
        return function(size) {
          return global.crypto.getRandomValues(buffer_1.Buffer.alloc(size));
        };
      }
      var requiredRandomBytes;
      try {
        requiredRandomBytes = require("crypto").randomBytes;
      } catch (e) {
      }
      return requiredRandomBytes || insecureRandomBytes;
    };
    exports2.randomBytes = detectRandomBytes();
    function isAnyArrayBuffer(value) {
      return ["[object ArrayBuffer]", "[object SharedArrayBuffer]"].includes(Object.prototype.toString.call(value));
    }
    exports2.isAnyArrayBuffer = isAnyArrayBuffer;
    function isUint8Array(value) {
      return Object.prototype.toString.call(value) === "[object Uint8Array]";
    }
    exports2.isUint8Array = isUint8Array;
    function isBigInt64Array(value) {
      return Object.prototype.toString.call(value) === "[object BigInt64Array]";
    }
    exports2.isBigInt64Array = isBigInt64Array;
    function isBigUInt64Array(value) {
      return Object.prototype.toString.call(value) === "[object BigUint64Array]";
    }
    exports2.isBigUInt64Array = isBigUInt64Array;
    function isRegExp(d) {
      return Object.prototype.toString.call(d) === "[object RegExp]";
    }
    exports2.isRegExp = isRegExp;
    function isMap(d) {
      return Object.prototype.toString.call(d) === "[object Map]";
    }
    exports2.isMap = isMap;
    function haveBuffer() {
      return typeof global !== "undefined" && typeof global.Buffer !== "undefined";
    }
    exports2.haveBuffer = haveBuffer;
    function isDate(d) {
      return isObjectLike(d) && Object.prototype.toString.call(d) === "[object Date]";
    }
    exports2.isDate = isDate;
    function isObjectLike(candidate) {
      return typeof candidate === "object" && candidate !== null;
    }
    exports2.isObjectLike = isObjectLike;
    function deprecate(fn, message) {
      var warned = false;
      function deprecated() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (!warned) {
          console.warn(message);
          warned = true;
        }
        return fn.apply(this, args);
      }
      return deprecated;
    }
    exports2.deprecate = deprecate;
  }
});

// node_modules/bson/lib/ensure_buffer.js
var require_ensure_buffer = __commonJS({
  "node_modules/bson/lib/ensure_buffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ensureBuffer = void 0;
    var buffer_1 = require("buffer");
    var error_1 = require_error();
    var utils_1 = require_utils();
    function ensureBuffer(potentialBuffer) {
      if (ArrayBuffer.isView(potentialBuffer)) {
        return buffer_1.Buffer.from(potentialBuffer.buffer, potentialBuffer.byteOffset, potentialBuffer.byteLength);
      }
      if (utils_1.isAnyArrayBuffer(potentialBuffer)) {
        return buffer_1.Buffer.from(potentialBuffer);
      }
      throw new error_1.BSONTypeError("Must use either Buffer or TypedArray");
    }
    exports2.ensureBuffer = ensureBuffer;
  }
});

// node_modules/bson/lib/uuid_utils.js
var require_uuid_utils = __commonJS({
  "node_modules/bson/lib/uuid_utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.bufferToUuidHexString = exports2.uuidHexStringToBuffer = exports2.uuidValidateString = void 0;
    var buffer_1 = require("buffer");
    var error_1 = require_error();
    var VALIDATION_REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15})$/i;
    var uuidValidateString = function(str) {
      return typeof str === "string" && VALIDATION_REGEX.test(str);
    };
    exports2.uuidValidateString = uuidValidateString;
    var uuidHexStringToBuffer = function(hexString) {
      if (!exports2.uuidValidateString(hexString)) {
        throw new error_1.BSONTypeError('UUID string representations must be a 32 or 36 character hex string (dashes excluded/included). Format: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" or "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".');
      }
      var sanitizedHexString = hexString.replace(/-/g, "");
      return buffer_1.Buffer.from(sanitizedHexString, "hex");
    };
    exports2.uuidHexStringToBuffer = uuidHexStringToBuffer;
    var bufferToUuidHexString = function(buffer, includeDashes) {
      if (includeDashes === void 0) {
        includeDashes = true;
      }
      return includeDashes ? buffer.toString("hex", 0, 4) + "-" + buffer.toString("hex", 4, 6) + "-" + buffer.toString("hex", 6, 8) + "-" + buffer.toString("hex", 8, 10) + "-" + buffer.toString("hex", 10, 16) : buffer.toString("hex");
    };
    exports2.bufferToUuidHexString = bufferToUuidHexString;
  }
});

// node_modules/bson/lib/uuid.js
var require_uuid = __commonJS({
  "node_modules/bson/lib/uuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UUID = void 0;
    var buffer_1 = require("buffer");
    var ensure_buffer_1 = require_ensure_buffer();
    var binary_1 = require_binary();
    var uuid_utils_1 = require_uuid_utils();
    var utils_1 = require_utils();
    var error_1 = require_error();
    var BYTE_LENGTH = 16;
    var kId = Symbol("id");
    var UUID = function() {
      function UUID2(input) {
        if (typeof input === "undefined") {
          this.id = UUID2.generate();
        } else if (input instanceof UUID2) {
          this[kId] = buffer_1.Buffer.from(input.id);
          this.__id = input.__id;
        } else if (ArrayBuffer.isView(input) && input.byteLength === BYTE_LENGTH) {
          this.id = ensure_buffer_1.ensureBuffer(input);
        } else if (typeof input === "string") {
          this.id = uuid_utils_1.uuidHexStringToBuffer(input);
        } else {
          throw new error_1.BSONTypeError("Argument passed in UUID constructor must be a UUID, a 16 byte Buffer or a 32/36 character hex string (dashes excluded/included, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).");
        }
      }
      Object.defineProperty(UUID2.prototype, "id", {
        get: function() {
          return this[kId];
        },
        set: function(value) {
          this[kId] = value;
          if (UUID2.cacheHexString) {
            this.__id = uuid_utils_1.bufferToUuidHexString(value);
          }
        },
        enumerable: false,
        configurable: true
      });
      UUID2.prototype.toHexString = function(includeDashes) {
        if (includeDashes === void 0) {
          includeDashes = true;
        }
        if (UUID2.cacheHexString && this.__id) {
          return this.__id;
        }
        var uuidHexString = uuid_utils_1.bufferToUuidHexString(this.id, includeDashes);
        if (UUID2.cacheHexString) {
          this.__id = uuidHexString;
        }
        return uuidHexString;
      };
      UUID2.prototype.toString = function(encoding) {
        return encoding ? this.id.toString(encoding) : this.toHexString();
      };
      UUID2.prototype.toJSON = function() {
        return this.toHexString();
      };
      UUID2.prototype.equals = function(otherId) {
        if (!otherId) {
          return false;
        }
        if (otherId instanceof UUID2) {
          return otherId.id.equals(this.id);
        }
        try {
          return new UUID2(otherId).id.equals(this.id);
        } catch (_a2) {
          return false;
        }
      };
      UUID2.prototype.toBinary = function() {
        return new binary_1.Binary(this.id, binary_1.Binary.SUBTYPE_UUID);
      };
      UUID2.generate = function() {
        var bytes = utils_1.randomBytes(BYTE_LENGTH);
        bytes[6] = bytes[6] & 15 | 64;
        bytes[8] = bytes[8] & 63 | 128;
        return buffer_1.Buffer.from(bytes);
      };
      UUID2.isValid = function(input) {
        if (!input) {
          return false;
        }
        if (input instanceof UUID2) {
          return true;
        }
        if (typeof input === "string") {
          return uuid_utils_1.uuidValidateString(input);
        }
        if (utils_1.isUint8Array(input)) {
          if (input.length !== BYTE_LENGTH) {
            return false;
          }
          try {
            return parseInt(input[6].toString(16)[0], 10) === binary_1.Binary.SUBTYPE_UUID;
          } catch (_a2) {
            return false;
          }
        }
        return false;
      };
      UUID2.createFromHexString = function(hexString) {
        var buffer = uuid_utils_1.uuidHexStringToBuffer(hexString);
        return new UUID2(buffer);
      };
      UUID2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      UUID2.prototype.inspect = function() {
        return 'new UUID("' + this.toHexString() + '")';
      };
      return UUID2;
    }();
    exports2.UUID = UUID;
    Object.defineProperty(UUID.prototype, "_bsontype", { value: "UUID" });
  }
});

// node_modules/bson/lib/binary.js
var require_binary = __commonJS({
  "node_modules/bson/lib/binary.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Binary = void 0;
    var buffer_1 = require("buffer");
    var ensure_buffer_1 = require_ensure_buffer();
    var uuid_utils_1 = require_uuid_utils();
    var uuid_1 = require_uuid();
    var error_1 = require_error();
    var Binary = function() {
      function Binary2(buffer, subType) {
        if (!(this instanceof Binary2))
          return new Binary2(buffer, subType);
        if (!(buffer == null) && !(typeof buffer === "string") && !ArrayBuffer.isView(buffer) && !(buffer instanceof ArrayBuffer) && !Array.isArray(buffer)) {
          throw new error_1.BSONTypeError("Binary can only be constructed from string, Buffer, TypedArray, or Array<number>");
        }
        this.sub_type = subType !== null && subType !== void 0 ? subType : Binary2.BSON_BINARY_SUBTYPE_DEFAULT;
        if (buffer == null) {
          this.buffer = buffer_1.Buffer.alloc(Binary2.BUFFER_SIZE);
          this.position = 0;
        } else {
          if (typeof buffer === "string") {
            this.buffer = buffer_1.Buffer.from(buffer, "binary");
          } else if (Array.isArray(buffer)) {
            this.buffer = buffer_1.Buffer.from(buffer);
          } else {
            this.buffer = ensure_buffer_1.ensureBuffer(buffer);
          }
          this.position = this.buffer.byteLength;
        }
      }
      Binary2.prototype.put = function(byteValue) {
        if (typeof byteValue === "string" && byteValue.length !== 1) {
          throw new error_1.BSONTypeError("only accepts single character String");
        } else if (typeof byteValue !== "number" && byteValue.length !== 1)
          throw new error_1.BSONTypeError("only accepts single character Uint8Array or Array");
        var decodedByte;
        if (typeof byteValue === "string") {
          decodedByte = byteValue.charCodeAt(0);
        } else if (typeof byteValue === "number") {
          decodedByte = byteValue;
        } else {
          decodedByte = byteValue[0];
        }
        if (decodedByte < 0 || decodedByte > 255) {
          throw new error_1.BSONTypeError("only accepts number in a valid unsigned byte range 0-255");
        }
        if (this.buffer.length > this.position) {
          this.buffer[this.position++] = decodedByte;
        } else {
          var buffer = buffer_1.Buffer.alloc(Binary2.BUFFER_SIZE + this.buffer.length);
          this.buffer.copy(buffer, 0, 0, this.buffer.length);
          this.buffer = buffer;
          this.buffer[this.position++] = decodedByte;
        }
      };
      Binary2.prototype.write = function(sequence, offset) {
        offset = typeof offset === "number" ? offset : this.position;
        if (this.buffer.length < offset + sequence.length) {
          var buffer = buffer_1.Buffer.alloc(this.buffer.length + sequence.length);
          this.buffer.copy(buffer, 0, 0, this.buffer.length);
          this.buffer = buffer;
        }
        if (ArrayBuffer.isView(sequence)) {
          this.buffer.set(ensure_buffer_1.ensureBuffer(sequence), offset);
          this.position = offset + sequence.byteLength > this.position ? offset + sequence.length : this.position;
        } else if (typeof sequence === "string") {
          this.buffer.write(sequence, offset, sequence.length, "binary");
          this.position = offset + sequence.length > this.position ? offset + sequence.length : this.position;
        }
      };
      Binary2.prototype.read = function(position, length) {
        length = length && length > 0 ? length : this.position;
        return this.buffer.slice(position, position + length);
      };
      Binary2.prototype.value = function(asRaw) {
        asRaw = !!asRaw;
        if (asRaw && this.buffer.length === this.position) {
          return this.buffer;
        }
        if (asRaw) {
          return this.buffer.slice(0, this.position);
        }
        return this.buffer.toString("binary", 0, this.position);
      };
      Binary2.prototype.length = function() {
        return this.position;
      };
      Binary2.prototype.toJSON = function() {
        return this.buffer.toString("base64");
      };
      Binary2.prototype.toString = function(format) {
        return this.buffer.toString(format);
      };
      Binary2.prototype.toExtendedJSON = function(options) {
        options = options || {};
        var base64String = this.buffer.toString("base64");
        var subType = Number(this.sub_type).toString(16);
        if (options.legacy) {
          return {
            $binary: base64String,
            $type: subType.length === 1 ? "0" + subType : subType
          };
        }
        return {
          $binary: {
            base64: base64String,
            subType: subType.length === 1 ? "0" + subType : subType
          }
        };
      };
      Binary2.prototype.toUUID = function() {
        if (this.sub_type === Binary2.SUBTYPE_UUID) {
          return new uuid_1.UUID(this.buffer.slice(0, this.position));
        }
        throw new error_1.BSONError('Binary sub_type "' + this.sub_type + '" is not supported for converting to UUID. Only "' + Binary2.SUBTYPE_UUID + '" is currently supported.');
      };
      Binary2.fromExtendedJSON = function(doc, options) {
        options = options || {};
        var data;
        var type;
        if ("$binary" in doc) {
          if (options.legacy && typeof doc.$binary === "string" && "$type" in doc) {
            type = doc.$type ? parseInt(doc.$type, 16) : 0;
            data = buffer_1.Buffer.from(doc.$binary, "base64");
          } else {
            if (typeof doc.$binary !== "string") {
              type = doc.$binary.subType ? parseInt(doc.$binary.subType, 16) : 0;
              data = buffer_1.Buffer.from(doc.$binary.base64, "base64");
            }
          }
        } else if ("$uuid" in doc) {
          type = 4;
          data = uuid_utils_1.uuidHexStringToBuffer(doc.$uuid);
        }
        if (!data) {
          throw new error_1.BSONTypeError("Unexpected Binary Extended JSON format " + JSON.stringify(doc));
        }
        return new Binary2(data, type);
      };
      Binary2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      Binary2.prototype.inspect = function() {
        var asBuffer = this.value(true);
        return 'new Binary(Buffer.from("' + asBuffer.toString("hex") + '", "hex"), ' + this.sub_type + ")";
      };
      Binary2.BSON_BINARY_SUBTYPE_DEFAULT = 0;
      Binary2.BUFFER_SIZE = 256;
      Binary2.SUBTYPE_DEFAULT = 0;
      Binary2.SUBTYPE_FUNCTION = 1;
      Binary2.SUBTYPE_BYTE_ARRAY = 2;
      Binary2.SUBTYPE_UUID_OLD = 3;
      Binary2.SUBTYPE_UUID = 4;
      Binary2.SUBTYPE_MD5 = 5;
      Binary2.SUBTYPE_ENCRYPTED = 6;
      Binary2.SUBTYPE_COLUMN = 7;
      Binary2.SUBTYPE_USER_DEFINED = 128;
      return Binary2;
    }();
    exports2.Binary = Binary;
    Object.defineProperty(Binary.prototype, "_bsontype", { value: "Binary" });
  }
});

// node_modules/bson/lib/code.js
var require_code = __commonJS({
  "node_modules/bson/lib/code.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Code = void 0;
    var Code = function() {
      function Code2(code, scope) {
        if (!(this instanceof Code2))
          return new Code2(code, scope);
        this.code = code;
        this.scope = scope;
      }
      Code2.prototype.toJSON = function() {
        return { code: this.code, scope: this.scope };
      };
      Code2.prototype.toExtendedJSON = function() {
        if (this.scope) {
          return { $code: this.code, $scope: this.scope };
        }
        return { $code: this.code };
      };
      Code2.fromExtendedJSON = function(doc) {
        return new Code2(doc.$code, doc.$scope);
      };
      Code2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      Code2.prototype.inspect = function() {
        var codeJson = this.toJSON();
        return 'new Code("' + codeJson.code + '"' + (codeJson.scope ? ", " + JSON.stringify(codeJson.scope) : "") + ")";
      };
      return Code2;
    }();
    exports2.Code = Code;
    Object.defineProperty(Code.prototype, "_bsontype", { value: "Code" });
  }
});

// node_modules/bson/lib/db_ref.js
var require_db_ref = __commonJS({
  "node_modules/bson/lib/db_ref.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DBRef = exports2.isDBRefLike = void 0;
    var utils_1 = require_utils();
    function isDBRefLike(value) {
      return utils_1.isObjectLike(value) && value.$id != null && typeof value.$ref === "string" && (value.$db == null || typeof value.$db === "string");
    }
    exports2.isDBRefLike = isDBRefLike;
    var DBRef = function() {
      function DBRef2(collection, oid, db, fields) {
        if (!(this instanceof DBRef2))
          return new DBRef2(collection, oid, db, fields);
        var parts = collection.split(".");
        if (parts.length === 2) {
          db = parts.shift();
          collection = parts.shift();
        }
        this.collection = collection;
        this.oid = oid;
        this.db = db;
        this.fields = fields || {};
      }
      Object.defineProperty(DBRef2.prototype, "namespace", {
        get: function() {
          return this.collection;
        },
        set: function(value) {
          this.collection = value;
        },
        enumerable: false,
        configurable: true
      });
      DBRef2.prototype.toJSON = function() {
        var o = Object.assign({
          $ref: this.collection,
          $id: this.oid
        }, this.fields);
        if (this.db != null)
          o.$db = this.db;
        return o;
      };
      DBRef2.prototype.toExtendedJSON = function(options) {
        options = options || {};
        var o = {
          $ref: this.collection,
          $id: this.oid
        };
        if (options.legacy) {
          return o;
        }
        if (this.db)
          o.$db = this.db;
        o = Object.assign(o, this.fields);
        return o;
      };
      DBRef2.fromExtendedJSON = function(doc) {
        var copy = Object.assign({}, doc);
        delete copy.$ref;
        delete copy.$id;
        delete copy.$db;
        return new DBRef2(doc.$ref, doc.$id, doc.$db, copy);
      };
      DBRef2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      DBRef2.prototype.inspect = function() {
        var oid = this.oid === void 0 || this.oid.toString === void 0 ? this.oid : this.oid.toString();
        return 'new DBRef("' + this.namespace + '", new ObjectId("' + oid + '")' + (this.db ? ', "' + this.db + '"' : "") + ")";
      };
      return DBRef2;
    }();
    exports2.DBRef = DBRef;
    Object.defineProperty(DBRef.prototype, "_bsontype", { value: "DBRef" });
  }
});

// node_modules/bson/lib/long.js
var require_long = __commonJS({
  "node_modules/bson/lib/long.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Long = void 0;
    var utils_1 = require_utils();
    var wasm = void 0;
    try {
      wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
    } catch (_a2) {
    }
    var TWO_PWR_16_DBL = 1 << 16;
    var TWO_PWR_24_DBL = 1 << 24;
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
    var INT_CACHE = {};
    var UINT_CACHE = {};
    var Long = function() {
      function Long2(low, high, unsigned) {
        if (low === void 0) {
          low = 0;
        }
        if (!(this instanceof Long2))
          return new Long2(low, high, unsigned);
        if (typeof low === "bigint") {
          Object.assign(this, Long2.fromBigInt(low, !!high));
        } else if (typeof low === "string") {
          Object.assign(this, Long2.fromString(low, !!high));
        } else {
          this.low = low | 0;
          this.high = high | 0;
          this.unsigned = !!unsigned;
        }
        Object.defineProperty(this, "__isLong__", {
          value: true,
          configurable: false,
          writable: false,
          enumerable: false
        });
      }
      Long2.fromBits = function(lowBits, highBits, unsigned) {
        return new Long2(lowBits, highBits, unsigned);
      };
      Long2.fromInt = function(value, unsigned) {
        var obj, cachedObj, cache;
        if (unsigned) {
          value >>>= 0;
          if (cache = 0 <= value && value < 256) {
            cachedObj = UINT_CACHE[value];
            if (cachedObj)
              return cachedObj;
          }
          obj = Long2.fromBits(value, (value | 0) < 0 ? -1 : 0, true);
          if (cache)
            UINT_CACHE[value] = obj;
          return obj;
        } else {
          value |= 0;
          if (cache = -128 <= value && value < 128) {
            cachedObj = INT_CACHE[value];
            if (cachedObj)
              return cachedObj;
          }
          obj = Long2.fromBits(value, value < 0 ? -1 : 0, false);
          if (cache)
            INT_CACHE[value] = obj;
          return obj;
        }
      };
      Long2.fromNumber = function(value, unsigned) {
        if (isNaN(value))
          return unsigned ? Long2.UZERO : Long2.ZERO;
        if (unsigned) {
          if (value < 0)
            return Long2.UZERO;
          if (value >= TWO_PWR_64_DBL)
            return Long2.MAX_UNSIGNED_VALUE;
        } else {
          if (value <= -TWO_PWR_63_DBL)
            return Long2.MIN_VALUE;
          if (value + 1 >= TWO_PWR_63_DBL)
            return Long2.MAX_VALUE;
        }
        if (value < 0)
          return Long2.fromNumber(-value, unsigned).neg();
        return Long2.fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
      };
      Long2.fromBigInt = function(value, unsigned) {
        return Long2.fromString(value.toString(), unsigned);
      };
      Long2.fromString = function(str, unsigned, radix) {
        if (str.length === 0)
          throw Error("empty string");
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
          return Long2.ZERO;
        if (typeof unsigned === "number") {
          radix = unsigned, unsigned = false;
        } else {
          unsigned = !!unsigned;
        }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
          throw RangeError("radix");
        var p;
        if ((p = str.indexOf("-")) > 0)
          throw Error("interior hyphen");
        else if (p === 0) {
          return Long2.fromString(str.substring(1), unsigned, radix).neg();
        }
        var radixToPower = Long2.fromNumber(Math.pow(radix, 8));
        var result = Long2.ZERO;
        for (var i = 0; i < str.length; i += 8) {
          var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
          if (size < 8) {
            var power = Long2.fromNumber(Math.pow(radix, size));
            result = result.mul(power).add(Long2.fromNumber(value));
          } else {
            result = result.mul(radixToPower);
            result = result.add(Long2.fromNumber(value));
          }
        }
        result.unsigned = unsigned;
        return result;
      };
      Long2.fromBytes = function(bytes, unsigned, le) {
        return le ? Long2.fromBytesLE(bytes, unsigned) : Long2.fromBytesBE(bytes, unsigned);
      };
      Long2.fromBytesLE = function(bytes, unsigned) {
        return new Long2(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
      };
      Long2.fromBytesBE = function(bytes, unsigned) {
        return new Long2(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
      };
      Long2.isLong = function(value) {
        return utils_1.isObjectLike(value) && value["__isLong__"] === true;
      };
      Long2.fromValue = function(val, unsigned) {
        if (typeof val === "number")
          return Long2.fromNumber(val, unsigned);
        if (typeof val === "string")
          return Long2.fromString(val, unsigned);
        return Long2.fromBits(val.low, val.high, typeof unsigned === "boolean" ? unsigned : val.unsigned);
      };
      Long2.prototype.add = function(addend) {
        if (!Long2.isLong(addend))
          addend = Long2.fromValue(addend);
        var a48 = this.high >>> 16;
        var a32 = this.high & 65535;
        var a16 = this.low >>> 16;
        var a00 = this.low & 65535;
        var b48 = addend.high >>> 16;
        var b32 = addend.high & 65535;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 65535;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 65535;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c48 += a48 + b48;
        c48 &= 65535;
        return Long2.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
      };
      Long2.prototype.and = function(other) {
        if (!Long2.isLong(other))
          other = Long2.fromValue(other);
        return Long2.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
      };
      Long2.prototype.compare = function(other) {
        if (!Long2.isLong(other))
          other = Long2.fromValue(other);
        if (this.eq(other))
          return 0;
        var thisNeg = this.isNegative(), otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
          return -1;
        if (!thisNeg && otherNeg)
          return 1;
        if (!this.unsigned)
          return this.sub(other).isNegative() ? -1 : 1;
        return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
      };
      Long2.prototype.comp = function(other) {
        return this.compare(other);
      };
      Long2.prototype.divide = function(divisor) {
        if (!Long2.isLong(divisor))
          divisor = Long2.fromValue(divisor);
        if (divisor.isZero())
          throw Error("division by zero");
        if (wasm) {
          if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
            return this;
          }
          var low = (this.unsigned ? wasm.div_u : wasm.div_s)(this.low, this.high, divisor.low, divisor.high);
          return Long2.fromBits(low, wasm.get_high(), this.unsigned);
        }
        if (this.isZero())
          return this.unsigned ? Long2.UZERO : Long2.ZERO;
        var approx, rem, res;
        if (!this.unsigned) {
          if (this.eq(Long2.MIN_VALUE)) {
            if (divisor.eq(Long2.ONE) || divisor.eq(Long2.NEG_ONE))
              return Long2.MIN_VALUE;
            else if (divisor.eq(Long2.MIN_VALUE))
              return Long2.ONE;
            else {
              var halfThis = this.shr(1);
              approx = halfThis.div(divisor).shl(1);
              if (approx.eq(Long2.ZERO)) {
                return divisor.isNegative() ? Long2.ONE : Long2.NEG_ONE;
              } else {
                rem = this.sub(divisor.mul(approx));
                res = approx.add(rem.div(divisor));
                return res;
              }
            }
          } else if (divisor.eq(Long2.MIN_VALUE))
            return this.unsigned ? Long2.UZERO : Long2.ZERO;
          if (this.isNegative()) {
            if (divisor.isNegative())
              return this.neg().div(divisor.neg());
            return this.neg().div(divisor).neg();
          } else if (divisor.isNegative())
            return this.div(divisor.neg()).neg();
          res = Long2.ZERO;
        } else {
          if (!divisor.unsigned)
            divisor = divisor.toUnsigned();
          if (divisor.gt(this))
            return Long2.UZERO;
          if (divisor.gt(this.shru(1)))
            return Long2.UONE;
          res = Long2.UZERO;
        }
        rem = this;
        while (rem.gte(divisor)) {
          approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
          var log2 = Math.ceil(Math.log(approx) / Math.LN2);
          var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
          var approxRes = Long2.fromNumber(approx);
          var approxRem = approxRes.mul(divisor);
          while (approxRem.isNegative() || approxRem.gt(rem)) {
            approx -= delta;
            approxRes = Long2.fromNumber(approx, this.unsigned);
            approxRem = approxRes.mul(divisor);
          }
          if (approxRes.isZero())
            approxRes = Long2.ONE;
          res = res.add(approxRes);
          rem = rem.sub(approxRem);
        }
        return res;
      };
      Long2.prototype.div = function(divisor) {
        return this.divide(divisor);
      };
      Long2.prototype.equals = function(other) {
        if (!Long2.isLong(other))
          other = Long2.fromValue(other);
        if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
          return false;
        return this.high === other.high && this.low === other.low;
      };
      Long2.prototype.eq = function(other) {
        return this.equals(other);
      };
      Long2.prototype.getHighBits = function() {
        return this.high;
      };
      Long2.prototype.getHighBitsUnsigned = function() {
        return this.high >>> 0;
      };
      Long2.prototype.getLowBits = function() {
        return this.low;
      };
      Long2.prototype.getLowBitsUnsigned = function() {
        return this.low >>> 0;
      };
      Long2.prototype.getNumBitsAbs = function() {
        if (this.isNegative()) {
          return this.eq(Long2.MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        }
        var val = this.high !== 0 ? this.high : this.low;
        var bit;
        for (bit = 31; bit > 0; bit--)
          if ((val & 1 << bit) !== 0)
            break;
        return this.high !== 0 ? bit + 33 : bit + 1;
      };
      Long2.prototype.greaterThan = function(other) {
        return this.comp(other) > 0;
      };
      Long2.prototype.gt = function(other) {
        return this.greaterThan(other);
      };
      Long2.prototype.greaterThanOrEqual = function(other) {
        return this.comp(other) >= 0;
      };
      Long2.prototype.gte = function(other) {
        return this.greaterThanOrEqual(other);
      };
      Long2.prototype.ge = function(other) {
        return this.greaterThanOrEqual(other);
      };
      Long2.prototype.isEven = function() {
        return (this.low & 1) === 0;
      };
      Long2.prototype.isNegative = function() {
        return !this.unsigned && this.high < 0;
      };
      Long2.prototype.isOdd = function() {
        return (this.low & 1) === 1;
      };
      Long2.prototype.isPositive = function() {
        return this.unsigned || this.high >= 0;
      };
      Long2.prototype.isZero = function() {
        return this.high === 0 && this.low === 0;
      };
      Long2.prototype.lessThan = function(other) {
        return this.comp(other) < 0;
      };
      Long2.prototype.lt = function(other) {
        return this.lessThan(other);
      };
      Long2.prototype.lessThanOrEqual = function(other) {
        return this.comp(other) <= 0;
      };
      Long2.prototype.lte = function(other) {
        return this.lessThanOrEqual(other);
      };
      Long2.prototype.modulo = function(divisor) {
        if (!Long2.isLong(divisor))
          divisor = Long2.fromValue(divisor);
        if (wasm) {
          var low = (this.unsigned ? wasm.rem_u : wasm.rem_s)(this.low, this.high, divisor.low, divisor.high);
          return Long2.fromBits(low, wasm.get_high(), this.unsigned);
        }
        return this.sub(this.div(divisor).mul(divisor));
      };
      Long2.prototype.mod = function(divisor) {
        return this.modulo(divisor);
      };
      Long2.prototype.rem = function(divisor) {
        return this.modulo(divisor);
      };
      Long2.prototype.multiply = function(multiplier) {
        if (this.isZero())
          return Long2.ZERO;
        if (!Long2.isLong(multiplier))
          multiplier = Long2.fromValue(multiplier);
        if (wasm) {
          var low = wasm.mul(this.low, this.high, multiplier.low, multiplier.high);
          return Long2.fromBits(low, wasm.get_high(), this.unsigned);
        }
        if (multiplier.isZero())
          return Long2.ZERO;
        if (this.eq(Long2.MIN_VALUE))
          return multiplier.isOdd() ? Long2.MIN_VALUE : Long2.ZERO;
        if (multiplier.eq(Long2.MIN_VALUE))
          return this.isOdd() ? Long2.MIN_VALUE : Long2.ZERO;
        if (this.isNegative()) {
          if (multiplier.isNegative())
            return this.neg().mul(multiplier.neg());
          else
            return this.neg().mul(multiplier).neg();
        } else if (multiplier.isNegative())
          return this.mul(multiplier.neg()).neg();
        if (this.lt(Long2.TWO_PWR_24) && multiplier.lt(Long2.TWO_PWR_24))
          return Long2.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
        var a48 = this.high >>> 16;
        var a32 = this.high & 65535;
        var a16 = this.low >>> 16;
        var a00 = this.low & 65535;
        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 65535;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 65535;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 65535;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 65535;
        return Long2.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
      };
      Long2.prototype.mul = function(multiplier) {
        return this.multiply(multiplier);
      };
      Long2.prototype.negate = function() {
        if (!this.unsigned && this.eq(Long2.MIN_VALUE))
          return Long2.MIN_VALUE;
        return this.not().add(Long2.ONE);
      };
      Long2.prototype.neg = function() {
        return this.negate();
      };
      Long2.prototype.not = function() {
        return Long2.fromBits(~this.low, ~this.high, this.unsigned);
      };
      Long2.prototype.notEquals = function(other) {
        return !this.equals(other);
      };
      Long2.prototype.neq = function(other) {
        return this.notEquals(other);
      };
      Long2.prototype.ne = function(other) {
        return this.notEquals(other);
      };
      Long2.prototype.or = function(other) {
        if (!Long2.isLong(other))
          other = Long2.fromValue(other);
        return Long2.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
      };
      Long2.prototype.shiftLeft = function(numBits) {
        if (Long2.isLong(numBits))
          numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
          return this;
        else if (numBits < 32)
          return Long2.fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);
        else
          return Long2.fromBits(0, this.low << numBits - 32, this.unsigned);
      };
      Long2.prototype.shl = function(numBits) {
        return this.shiftLeft(numBits);
      };
      Long2.prototype.shiftRight = function(numBits) {
        if (Long2.isLong(numBits))
          numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
          return this;
        else if (numBits < 32)
          return Long2.fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);
        else
          return Long2.fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
      };
      Long2.prototype.shr = function(numBits) {
        return this.shiftRight(numBits);
      };
      Long2.prototype.shiftRightUnsigned = function(numBits) {
        if (Long2.isLong(numBits))
          numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0)
          return this;
        else {
          var high = this.high;
          if (numBits < 32) {
            var low = this.low;
            return Long2.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits, this.unsigned);
          } else if (numBits === 32)
            return Long2.fromBits(high, 0, this.unsigned);
          else
            return Long2.fromBits(high >>> numBits - 32, 0, this.unsigned);
        }
      };
      Long2.prototype.shr_u = function(numBits) {
        return this.shiftRightUnsigned(numBits);
      };
      Long2.prototype.shru = function(numBits) {
        return this.shiftRightUnsigned(numBits);
      };
      Long2.prototype.subtract = function(subtrahend) {
        if (!Long2.isLong(subtrahend))
          subtrahend = Long2.fromValue(subtrahend);
        return this.add(subtrahend.neg());
      };
      Long2.prototype.sub = function(subtrahend) {
        return this.subtract(subtrahend);
      };
      Long2.prototype.toInt = function() {
        return this.unsigned ? this.low >>> 0 : this.low;
      };
      Long2.prototype.toNumber = function() {
        if (this.unsigned)
          return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
      };
      Long2.prototype.toBigInt = function() {
        return BigInt(this.toString());
      };
      Long2.prototype.toBytes = function(le) {
        return le ? this.toBytesLE() : this.toBytesBE();
      };
      Long2.prototype.toBytesLE = function() {
        var hi = this.high, lo = this.low;
        return [
          lo & 255,
          lo >>> 8 & 255,
          lo >>> 16 & 255,
          lo >>> 24,
          hi & 255,
          hi >>> 8 & 255,
          hi >>> 16 & 255,
          hi >>> 24
        ];
      };
      Long2.prototype.toBytesBE = function() {
        var hi = this.high, lo = this.low;
        return [
          hi >>> 24,
          hi >>> 16 & 255,
          hi >>> 8 & 255,
          hi & 255,
          lo >>> 24,
          lo >>> 16 & 255,
          lo >>> 8 & 255,
          lo & 255
        ];
      };
      Long2.prototype.toSigned = function() {
        if (!this.unsigned)
          return this;
        return Long2.fromBits(this.low, this.high, false);
      };
      Long2.prototype.toString = function(radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
          throw RangeError("radix");
        if (this.isZero())
          return "0";
        if (this.isNegative()) {
          if (this.eq(Long2.MIN_VALUE)) {
            var radixLong = Long2.fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
            return div.toString(radix) + rem1.toInt().toString(radix);
          } else
            return "-" + this.neg().toString(radix);
        }
        var radixToPower = Long2.fromNumber(Math.pow(radix, 6), this.unsigned);
        var rem = this;
        var result = "";
        while (true) {
          var remDiv = rem.div(radixToPower);
          var intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0;
          var digits = intval.toString(radix);
          rem = remDiv;
          if (rem.isZero()) {
            return digits + result;
          } else {
            while (digits.length < 6)
              digits = "0" + digits;
            result = "" + digits + result;
          }
        }
      };
      Long2.prototype.toUnsigned = function() {
        if (this.unsigned)
          return this;
        return Long2.fromBits(this.low, this.high, true);
      };
      Long2.prototype.xor = function(other) {
        if (!Long2.isLong(other))
          other = Long2.fromValue(other);
        return Long2.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
      };
      Long2.prototype.eqz = function() {
        return this.isZero();
      };
      Long2.prototype.le = function(other) {
        return this.lessThanOrEqual(other);
      };
      Long2.prototype.toExtendedJSON = function(options) {
        if (options && options.relaxed)
          return this.toNumber();
        return { $numberLong: this.toString() };
      };
      Long2.fromExtendedJSON = function(doc, options) {
        var result = Long2.fromString(doc.$numberLong);
        return options && options.relaxed ? result.toNumber() : result;
      };
      Long2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      Long2.prototype.inspect = function() {
        return 'new Long("' + this.toString() + '"' + (this.unsigned ? ", true" : "") + ")";
      };
      Long2.TWO_PWR_24 = Long2.fromInt(TWO_PWR_24_DBL);
      Long2.MAX_UNSIGNED_VALUE = Long2.fromBits(4294967295 | 0, 4294967295 | 0, true);
      Long2.ZERO = Long2.fromInt(0);
      Long2.UZERO = Long2.fromInt(0, true);
      Long2.ONE = Long2.fromInt(1);
      Long2.UONE = Long2.fromInt(1, true);
      Long2.NEG_ONE = Long2.fromInt(-1);
      Long2.MAX_VALUE = Long2.fromBits(4294967295 | 0, 2147483647 | 0, false);
      Long2.MIN_VALUE = Long2.fromBits(0, 2147483648 | 0, false);
      return Long2;
    }();
    exports2.Long = Long;
    Object.defineProperty(Long.prototype, "__isLong__", { value: true });
    Object.defineProperty(Long.prototype, "_bsontype", { value: "Long" });
  }
});

// node_modules/bson/lib/decimal128.js
var require_decimal128 = __commonJS({
  "node_modules/bson/lib/decimal128.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Decimal128 = void 0;
    var buffer_1 = require("buffer");
    var error_1 = require_error();
    var long_1 = require_long();
    var PARSE_STRING_REGEXP = /^(\+|-)?(\d+|(\d*\.\d*))?(E|e)?([-+])?(\d+)?$/;
    var PARSE_INF_REGEXP = /^(\+|-)?(Infinity|inf)$/i;
    var PARSE_NAN_REGEXP = /^(\+|-)?NaN$/i;
    var EXPONENT_MAX = 6111;
    var EXPONENT_MIN = -6176;
    var EXPONENT_BIAS = 6176;
    var MAX_DIGITS = 34;
    var NAN_BUFFER = [
      124,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ].reverse();
    var INF_NEGATIVE_BUFFER = [
      248,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ].reverse();
    var INF_POSITIVE_BUFFER = [
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ].reverse();
    var EXPONENT_REGEX = /^([-+])?(\d+)?$/;
    var COMBINATION_MASK = 31;
    var EXPONENT_MASK = 16383;
    var COMBINATION_INFINITY = 30;
    var COMBINATION_NAN = 31;
    function isDigit(value) {
      return !isNaN(parseInt(value, 10));
    }
    function divideu128(value) {
      var DIVISOR = long_1.Long.fromNumber(1e3 * 1e3 * 1e3);
      var _rem = long_1.Long.fromNumber(0);
      if (!value.parts[0] && !value.parts[1] && !value.parts[2] && !value.parts[3]) {
        return { quotient: value, rem: _rem };
      }
      for (var i = 0; i <= 3; i++) {
        _rem = _rem.shiftLeft(32);
        _rem = _rem.add(new long_1.Long(value.parts[i], 0));
        value.parts[i] = _rem.div(DIVISOR).low;
        _rem = _rem.modulo(DIVISOR);
      }
      return { quotient: value, rem: _rem };
    }
    function multiply64x2(left, right) {
      if (!left && !right) {
        return { high: long_1.Long.fromNumber(0), low: long_1.Long.fromNumber(0) };
      }
      var leftHigh = left.shiftRightUnsigned(32);
      var leftLow = new long_1.Long(left.getLowBits(), 0);
      var rightHigh = right.shiftRightUnsigned(32);
      var rightLow = new long_1.Long(right.getLowBits(), 0);
      var productHigh = leftHigh.multiply(rightHigh);
      var productMid = leftHigh.multiply(rightLow);
      var productMid2 = leftLow.multiply(rightHigh);
      var productLow = leftLow.multiply(rightLow);
      productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
      productMid = new long_1.Long(productMid.getLowBits(), 0).add(productMid2).add(productLow.shiftRightUnsigned(32));
      productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
      productLow = productMid.shiftLeft(32).add(new long_1.Long(productLow.getLowBits(), 0));
      return { high: productHigh, low: productLow };
    }
    function lessThan(left, right) {
      var uhleft = left.high >>> 0;
      var uhright = right.high >>> 0;
      if (uhleft < uhright) {
        return true;
      } else if (uhleft === uhright) {
        var ulleft = left.low >>> 0;
        var ulright = right.low >>> 0;
        if (ulleft < ulright)
          return true;
      }
      return false;
    }
    function invalidErr(string, message) {
      throw new error_1.BSONTypeError('"' + string + '" is not a valid Decimal128 string - ' + message);
    }
    var Decimal128 = function() {
      function Decimal1282(bytes) {
        if (!(this instanceof Decimal1282))
          return new Decimal1282(bytes);
        if (typeof bytes === "string") {
          this.bytes = Decimal1282.fromString(bytes).bytes;
        } else {
          this.bytes = bytes;
        }
      }
      Decimal1282.fromString = function(representation) {
        var isNegative = false;
        var sawRadix = false;
        var foundNonZero = false;
        var significantDigits = 0;
        var nDigitsRead = 0;
        var nDigits = 0;
        var radixPosition = 0;
        var firstNonZero = 0;
        var digits = [0];
        var nDigitsStored = 0;
        var digitsInsert = 0;
        var firstDigit = 0;
        var lastDigit = 0;
        var exponent = 0;
        var i = 0;
        var significandHigh = new long_1.Long(0, 0);
        var significandLow = new long_1.Long(0, 0);
        var biasedExponent = 0;
        var index = 0;
        if (representation.length >= 7e3) {
          throw new error_1.BSONTypeError("" + representation + " not a valid Decimal128 string");
        }
        var stringMatch = representation.match(PARSE_STRING_REGEXP);
        var infMatch = representation.match(PARSE_INF_REGEXP);
        var nanMatch = representation.match(PARSE_NAN_REGEXP);
        if (!stringMatch && !infMatch && !nanMatch || representation.length === 0) {
          throw new error_1.BSONTypeError("" + representation + " not a valid Decimal128 string");
        }
        if (stringMatch) {
          var unsignedNumber = stringMatch[2];
          var e = stringMatch[4];
          var expSign = stringMatch[5];
          var expNumber = stringMatch[6];
          if (e && expNumber === void 0)
            invalidErr(representation, "missing exponent power");
          if (e && unsignedNumber === void 0)
            invalidErr(representation, "missing exponent base");
          if (e === void 0 && (expSign || expNumber)) {
            invalidErr(representation, "missing e before exponent");
          }
        }
        if (representation[index] === "+" || representation[index] === "-") {
          isNegative = representation[index++] === "-";
        }
        if (!isDigit(representation[index]) && representation[index] !== ".") {
          if (representation[index] === "i" || representation[index] === "I") {
            return new Decimal1282(buffer_1.Buffer.from(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
          } else if (representation[index] === "N") {
            return new Decimal1282(buffer_1.Buffer.from(NAN_BUFFER));
          }
        }
        while (isDigit(representation[index]) || representation[index] === ".") {
          if (representation[index] === ".") {
            if (sawRadix)
              invalidErr(representation, "contains multiple periods");
            sawRadix = true;
            index = index + 1;
            continue;
          }
          if (nDigitsStored < 34) {
            if (representation[index] !== "0" || foundNonZero) {
              if (!foundNonZero) {
                firstNonZero = nDigitsRead;
              }
              foundNonZero = true;
              digits[digitsInsert++] = parseInt(representation[index], 10);
              nDigitsStored = nDigitsStored + 1;
            }
          }
          if (foundNonZero)
            nDigits = nDigits + 1;
          if (sawRadix)
            radixPosition = radixPosition + 1;
          nDigitsRead = nDigitsRead + 1;
          index = index + 1;
        }
        if (sawRadix && !nDigitsRead)
          throw new error_1.BSONTypeError("" + representation + " not a valid Decimal128 string");
        if (representation[index] === "e" || representation[index] === "E") {
          var match = representation.substr(++index).match(EXPONENT_REGEX);
          if (!match || !match[2])
            return new Decimal1282(buffer_1.Buffer.from(NAN_BUFFER));
          exponent = parseInt(match[0], 10);
          index = index + match[0].length;
        }
        if (representation[index])
          return new Decimal1282(buffer_1.Buffer.from(NAN_BUFFER));
        firstDigit = 0;
        if (!nDigitsStored) {
          firstDigit = 0;
          lastDigit = 0;
          digits[0] = 0;
          nDigits = 1;
          nDigitsStored = 1;
          significantDigits = 0;
        } else {
          lastDigit = nDigitsStored - 1;
          significantDigits = nDigits;
          if (significantDigits !== 1) {
            while (digits[firstNonZero + significantDigits - 1] === 0) {
              significantDigits = significantDigits - 1;
            }
          }
        }
        if (exponent <= radixPosition && radixPosition - exponent > 1 << 14) {
          exponent = EXPONENT_MIN;
        } else {
          exponent = exponent - radixPosition;
        }
        while (exponent > EXPONENT_MAX) {
          lastDigit = lastDigit + 1;
          if (lastDigit - firstDigit > MAX_DIGITS) {
            var digitsString = digits.join("");
            if (digitsString.match(/^0+$/)) {
              exponent = EXPONENT_MAX;
              break;
            }
            invalidErr(representation, "overflow");
          }
          exponent = exponent - 1;
        }
        while (exponent < EXPONENT_MIN || nDigitsStored < nDigits) {
          if (lastDigit === 0 && significantDigits < nDigitsStored) {
            exponent = EXPONENT_MIN;
            significantDigits = 0;
            break;
          }
          if (nDigitsStored < nDigits) {
            nDigits = nDigits - 1;
          } else {
            lastDigit = lastDigit - 1;
          }
          if (exponent < EXPONENT_MAX) {
            exponent = exponent + 1;
          } else {
            var digitsString = digits.join("");
            if (digitsString.match(/^0+$/)) {
              exponent = EXPONENT_MAX;
              break;
            }
            invalidErr(representation, "overflow");
          }
        }
        if (lastDigit - firstDigit + 1 < significantDigits) {
          var endOfString = nDigitsRead;
          if (sawRadix) {
            firstNonZero = firstNonZero + 1;
            endOfString = endOfString + 1;
          }
          if (isNegative) {
            firstNonZero = firstNonZero + 1;
            endOfString = endOfString + 1;
          }
          var roundDigit = parseInt(representation[firstNonZero + lastDigit + 1], 10);
          var roundBit = 0;
          if (roundDigit >= 5) {
            roundBit = 1;
            if (roundDigit === 5) {
              roundBit = digits[lastDigit] % 2 === 1 ? 1 : 0;
              for (i = firstNonZero + lastDigit + 2; i < endOfString; i++) {
                if (parseInt(representation[i], 10)) {
                  roundBit = 1;
                  break;
                }
              }
            }
          }
          if (roundBit) {
            var dIdx = lastDigit;
            for (; dIdx >= 0; dIdx--) {
              if (++digits[dIdx] > 9) {
                digits[dIdx] = 0;
                if (dIdx === 0) {
                  if (exponent < EXPONENT_MAX) {
                    exponent = exponent + 1;
                    digits[dIdx] = 1;
                  } else {
                    return new Decimal1282(buffer_1.Buffer.from(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
                  }
                }
              }
            }
          }
        }
        significandHigh = long_1.Long.fromNumber(0);
        significandLow = long_1.Long.fromNumber(0);
        if (significantDigits === 0) {
          significandHigh = long_1.Long.fromNumber(0);
          significandLow = long_1.Long.fromNumber(0);
        } else if (lastDigit - firstDigit < 17) {
          var dIdx = firstDigit;
          significandLow = long_1.Long.fromNumber(digits[dIdx++]);
          significandHigh = new long_1.Long(0, 0);
          for (; dIdx <= lastDigit; dIdx++) {
            significandLow = significandLow.multiply(long_1.Long.fromNumber(10));
            significandLow = significandLow.add(long_1.Long.fromNumber(digits[dIdx]));
          }
        } else {
          var dIdx = firstDigit;
          significandHigh = long_1.Long.fromNumber(digits[dIdx++]);
          for (; dIdx <= lastDigit - 17; dIdx++) {
            significandHigh = significandHigh.multiply(long_1.Long.fromNumber(10));
            significandHigh = significandHigh.add(long_1.Long.fromNumber(digits[dIdx]));
          }
          significandLow = long_1.Long.fromNumber(digits[dIdx++]);
          for (; dIdx <= lastDigit; dIdx++) {
            significandLow = significandLow.multiply(long_1.Long.fromNumber(10));
            significandLow = significandLow.add(long_1.Long.fromNumber(digits[dIdx]));
          }
        }
        var significand = multiply64x2(significandHigh, long_1.Long.fromString("100000000000000000"));
        significand.low = significand.low.add(significandLow);
        if (lessThan(significand.low, significandLow)) {
          significand.high = significand.high.add(long_1.Long.fromNumber(1));
        }
        biasedExponent = exponent + EXPONENT_BIAS;
        var dec = { low: long_1.Long.fromNumber(0), high: long_1.Long.fromNumber(0) };
        if (significand.high.shiftRightUnsigned(49).and(long_1.Long.fromNumber(1)).equals(long_1.Long.fromNumber(1))) {
          dec.high = dec.high.or(long_1.Long.fromNumber(3).shiftLeft(61));
          dec.high = dec.high.or(long_1.Long.fromNumber(biasedExponent).and(long_1.Long.fromNumber(16383).shiftLeft(47)));
          dec.high = dec.high.or(significand.high.and(long_1.Long.fromNumber(140737488355327)));
        } else {
          dec.high = dec.high.or(long_1.Long.fromNumber(biasedExponent & 16383).shiftLeft(49));
          dec.high = dec.high.or(significand.high.and(long_1.Long.fromNumber(562949953421311)));
        }
        dec.low = significand.low;
        if (isNegative) {
          dec.high = dec.high.or(long_1.Long.fromString("9223372036854775808"));
        }
        var buffer = buffer_1.Buffer.alloc(16);
        index = 0;
        buffer[index++] = dec.low.low & 255;
        buffer[index++] = dec.low.low >> 8 & 255;
        buffer[index++] = dec.low.low >> 16 & 255;
        buffer[index++] = dec.low.low >> 24 & 255;
        buffer[index++] = dec.low.high & 255;
        buffer[index++] = dec.low.high >> 8 & 255;
        buffer[index++] = dec.low.high >> 16 & 255;
        buffer[index++] = dec.low.high >> 24 & 255;
        buffer[index++] = dec.high.low & 255;
        buffer[index++] = dec.high.low >> 8 & 255;
        buffer[index++] = dec.high.low >> 16 & 255;
        buffer[index++] = dec.high.low >> 24 & 255;
        buffer[index++] = dec.high.high & 255;
        buffer[index++] = dec.high.high >> 8 & 255;
        buffer[index++] = dec.high.high >> 16 & 255;
        buffer[index++] = dec.high.high >> 24 & 255;
        return new Decimal1282(buffer);
      };
      Decimal1282.prototype.toString = function() {
        var biased_exponent;
        var significand_digits = 0;
        var significand = new Array(36);
        for (var i = 0; i < significand.length; i++)
          significand[i] = 0;
        var index = 0;
        var is_zero = false;
        var significand_msb;
        var significand128 = { parts: [0, 0, 0, 0] };
        var j, k;
        var string = [];
        index = 0;
        var buffer = this.bytes;
        var low = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
        var midl = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
        var midh = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
        var high = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
        index = 0;
        var dec = {
          low: new long_1.Long(low, midl),
          high: new long_1.Long(midh, high)
        };
        if (dec.high.lessThan(long_1.Long.ZERO)) {
          string.push("-");
        }
        var combination = high >> 26 & COMBINATION_MASK;
        if (combination >> 3 === 3) {
          if (combination === COMBINATION_INFINITY) {
            return string.join("") + "Infinity";
          } else if (combination === COMBINATION_NAN) {
            return "NaN";
          } else {
            biased_exponent = high >> 15 & EXPONENT_MASK;
            significand_msb = 8 + (high >> 14 & 1);
          }
        } else {
          significand_msb = high >> 14 & 7;
          biased_exponent = high >> 17 & EXPONENT_MASK;
        }
        var exponent = biased_exponent - EXPONENT_BIAS;
        significand128.parts[0] = (high & 16383) + ((significand_msb & 15) << 14);
        significand128.parts[1] = midh;
        significand128.parts[2] = midl;
        significand128.parts[3] = low;
        if (significand128.parts[0] === 0 && significand128.parts[1] === 0 && significand128.parts[2] === 0 && significand128.parts[3] === 0) {
          is_zero = true;
        } else {
          for (k = 3; k >= 0; k--) {
            var least_digits = 0;
            var result = divideu128(significand128);
            significand128 = result.quotient;
            least_digits = result.rem.low;
            if (!least_digits)
              continue;
            for (j = 8; j >= 0; j--) {
              significand[k * 9 + j] = least_digits % 10;
              least_digits = Math.floor(least_digits / 10);
            }
          }
        }
        if (is_zero) {
          significand_digits = 1;
          significand[index] = 0;
        } else {
          significand_digits = 36;
          while (!significand[index]) {
            significand_digits = significand_digits - 1;
            index = index + 1;
          }
        }
        var scientific_exponent = significand_digits - 1 + exponent;
        if (scientific_exponent >= 34 || scientific_exponent <= -7 || exponent > 0) {
          if (significand_digits > 34) {
            string.push("" + 0);
            if (exponent > 0)
              string.push("E+" + exponent);
            else if (exponent < 0)
              string.push("E" + exponent);
            return string.join("");
          }
          string.push("" + significand[index++]);
          significand_digits = significand_digits - 1;
          if (significand_digits) {
            string.push(".");
          }
          for (var i = 0; i < significand_digits; i++) {
            string.push("" + significand[index++]);
          }
          string.push("E");
          if (scientific_exponent > 0) {
            string.push("+" + scientific_exponent);
          } else {
            string.push("" + scientific_exponent);
          }
        } else {
          if (exponent >= 0) {
            for (var i = 0; i < significand_digits; i++) {
              string.push("" + significand[index++]);
            }
          } else {
            var radix_position = significand_digits + exponent;
            if (radix_position > 0) {
              for (var i = 0; i < radix_position; i++) {
                string.push("" + significand[index++]);
              }
            } else {
              string.push("0");
            }
            string.push(".");
            while (radix_position++ < 0) {
              string.push("0");
            }
            for (var i = 0; i < significand_digits - Math.max(radix_position - 1, 0); i++) {
              string.push("" + significand[index++]);
            }
          }
        }
        return string.join("");
      };
      Decimal1282.prototype.toJSON = function() {
        return { $numberDecimal: this.toString() };
      };
      Decimal1282.prototype.toExtendedJSON = function() {
        return { $numberDecimal: this.toString() };
      };
      Decimal1282.fromExtendedJSON = function(doc) {
        return Decimal1282.fromString(doc.$numberDecimal);
      };
      Decimal1282.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      Decimal1282.prototype.inspect = function() {
        return 'new Decimal128("' + this.toString() + '")';
      };
      return Decimal1282;
    }();
    exports2.Decimal128 = Decimal128;
    Object.defineProperty(Decimal128.prototype, "_bsontype", { value: "Decimal128" });
  }
});

// node_modules/bson/lib/double.js
var require_double = __commonJS({
  "node_modules/bson/lib/double.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Double = void 0;
    var Double = function() {
      function Double2(value) {
        if (!(this instanceof Double2))
          return new Double2(value);
        if (value instanceof Number) {
          value = value.valueOf();
        }
        this.value = +value;
      }
      Double2.prototype.valueOf = function() {
        return this.value;
      };
      Double2.prototype.toJSON = function() {
        return this.value;
      };
      Double2.prototype.toString = function(radix) {
        return this.value.toString(radix);
      };
      Double2.prototype.toExtendedJSON = function(options) {
        if (options && (options.legacy || options.relaxed && isFinite(this.value))) {
          return this.value;
        }
        if (Object.is(Math.sign(this.value), -0)) {
          return { $numberDouble: "-" + this.value.toFixed(1) };
        }
        var $numberDouble;
        if (Number.isInteger(this.value)) {
          $numberDouble = this.value.toFixed(1);
          if ($numberDouble.length >= 13) {
            $numberDouble = this.value.toExponential(13).toUpperCase();
          }
        } else {
          $numberDouble = this.value.toString();
        }
        return { $numberDouble };
      };
      Double2.fromExtendedJSON = function(doc, options) {
        var doubleValue = parseFloat(doc.$numberDouble);
        return options && options.relaxed ? doubleValue : new Double2(doubleValue);
      };
      Double2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      Double2.prototype.inspect = function() {
        var eJSON = this.toExtendedJSON();
        return "new Double(" + eJSON.$numberDouble + ")";
      };
      return Double2;
    }();
    exports2.Double = Double;
    Object.defineProperty(Double.prototype, "_bsontype", { value: "Double" });
  }
});

// node_modules/bson/lib/int_32.js
var require_int_32 = __commonJS({
  "node_modules/bson/lib/int_32.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Int32 = void 0;
    var Int32 = function() {
      function Int322(value) {
        if (!(this instanceof Int322))
          return new Int322(value);
        if (value instanceof Number) {
          value = value.valueOf();
        }
        this.value = +value;
      }
      Int322.prototype.valueOf = function() {
        return this.value;
      };
      Int322.prototype.toString = function(radix) {
        return this.value.toString(radix);
      };
      Int322.prototype.toJSON = function() {
        return this.value;
      };
      Int322.prototype.toExtendedJSON = function(options) {
        if (options && (options.relaxed || options.legacy))
          return this.value;
        return { $numberInt: this.value.toString() };
      };
      Int322.fromExtendedJSON = function(doc, options) {
        return options && options.relaxed ? parseInt(doc.$numberInt, 10) : new Int322(doc.$numberInt);
      };
      Int322.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      Int322.prototype.inspect = function() {
        return "new Int32(" + this.valueOf() + ")";
      };
      return Int322;
    }();
    exports2.Int32 = Int32;
    Object.defineProperty(Int32.prototype, "_bsontype", { value: "Int32" });
  }
});

// node_modules/bson/lib/max_key.js
var require_max_key = __commonJS({
  "node_modules/bson/lib/max_key.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MaxKey = void 0;
    var MaxKey = function() {
      function MaxKey2() {
        if (!(this instanceof MaxKey2))
          return new MaxKey2();
      }
      MaxKey2.prototype.toExtendedJSON = function() {
        return { $maxKey: 1 };
      };
      MaxKey2.fromExtendedJSON = function() {
        return new MaxKey2();
      };
      MaxKey2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      MaxKey2.prototype.inspect = function() {
        return "new MaxKey()";
      };
      return MaxKey2;
    }();
    exports2.MaxKey = MaxKey;
    Object.defineProperty(MaxKey.prototype, "_bsontype", { value: "MaxKey" });
  }
});

// node_modules/bson/lib/min_key.js
var require_min_key = __commonJS({
  "node_modules/bson/lib/min_key.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MinKey = void 0;
    var MinKey = function() {
      function MinKey2() {
        if (!(this instanceof MinKey2))
          return new MinKey2();
      }
      MinKey2.prototype.toExtendedJSON = function() {
        return { $minKey: 1 };
      };
      MinKey2.fromExtendedJSON = function() {
        return new MinKey2();
      };
      MinKey2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      MinKey2.prototype.inspect = function() {
        return "new MinKey()";
      };
      return MinKey2;
    }();
    exports2.MinKey = MinKey;
    Object.defineProperty(MinKey.prototype, "_bsontype", { value: "MinKey" });
  }
});

// node_modules/bson/lib/objectid.js
var require_objectid = __commonJS({
  "node_modules/bson/lib/objectid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectId = void 0;
    var buffer_1 = require("buffer");
    var ensure_buffer_1 = require_ensure_buffer();
    var error_1 = require_error();
    var utils_1 = require_utils();
    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    var PROCESS_UNIQUE = null;
    var kId = Symbol("id");
    var ObjectId = function() {
      function ObjectId2(id) {
        if (!(this instanceof ObjectId2))
          return new ObjectId2(id);
        if (id instanceof ObjectId2) {
          this[kId] = id.id;
          this.__id = id.__id;
        }
        if (typeof id === "object" && id && "id" in id) {
          if ("toHexString" in id && typeof id.toHexString === "function") {
            this[kId] = buffer_1.Buffer.from(id.toHexString(), "hex");
          } else {
            this[kId] = typeof id.id === "string" ? buffer_1.Buffer.from(id.id) : id.id;
          }
        }
        if (id == null || typeof id === "number") {
          this[kId] = ObjectId2.generate(typeof id === "number" ? id : void 0);
          if (ObjectId2.cacheHexString) {
            this.__id = this.id.toString("hex");
          }
        }
        if (ArrayBuffer.isView(id) && id.byteLength === 12) {
          this[kId] = ensure_buffer_1.ensureBuffer(id);
        }
        if (typeof id === "string") {
          if (id.length === 12) {
            var bytes = buffer_1.Buffer.from(id);
            if (bytes.byteLength === 12) {
              this[kId] = bytes;
            }
          } else if (id.length === 24 && checkForHexRegExp.test(id)) {
            this[kId] = buffer_1.Buffer.from(id, "hex");
          } else {
            throw new error_1.BSONTypeError("Argument passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters");
          }
        }
        if (ObjectId2.cacheHexString) {
          this.__id = this.id.toString("hex");
        }
      }
      Object.defineProperty(ObjectId2.prototype, "id", {
        get: function() {
          return this[kId];
        },
        set: function(value) {
          this[kId] = value;
          if (ObjectId2.cacheHexString) {
            this.__id = value.toString("hex");
          }
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(ObjectId2.prototype, "generationTime", {
        get: function() {
          return this.id.readInt32BE(0);
        },
        set: function(value) {
          this.id.writeUInt32BE(value, 0);
        },
        enumerable: false,
        configurable: true
      });
      ObjectId2.prototype.toHexString = function() {
        if (ObjectId2.cacheHexString && this.__id) {
          return this.__id;
        }
        var hexString = this.id.toString("hex");
        if (ObjectId2.cacheHexString && !this.__id) {
          this.__id = hexString;
        }
        return hexString;
      };
      ObjectId2.getInc = function() {
        return ObjectId2.index = (ObjectId2.index + 1) % 16777215;
      };
      ObjectId2.generate = function(time) {
        if (typeof time !== "number") {
          time = ~~(Date.now() / 1e3);
        }
        var inc = ObjectId2.getInc();
        var buffer = buffer_1.Buffer.alloc(12);
        buffer.writeUInt32BE(time, 0);
        if (PROCESS_UNIQUE === null) {
          PROCESS_UNIQUE = utils_1.randomBytes(5);
        }
        buffer[4] = PROCESS_UNIQUE[0];
        buffer[5] = PROCESS_UNIQUE[1];
        buffer[6] = PROCESS_UNIQUE[2];
        buffer[7] = PROCESS_UNIQUE[3];
        buffer[8] = PROCESS_UNIQUE[4];
        buffer[11] = inc & 255;
        buffer[10] = inc >> 8 & 255;
        buffer[9] = inc >> 16 & 255;
        return buffer;
      };
      ObjectId2.prototype.toString = function(format) {
        if (format)
          return this.id.toString(format);
        return this.toHexString();
      };
      ObjectId2.prototype.toJSON = function() {
        return this.toHexString();
      };
      ObjectId2.prototype.equals = function(otherId) {
        if (otherId === void 0 || otherId === null) {
          return false;
        }
        if (otherId instanceof ObjectId2) {
          return this.toString() === otherId.toString();
        }
        if (typeof otherId === "string" && ObjectId2.isValid(otherId) && otherId.length === 12 && utils_1.isUint8Array(this.id)) {
          return otherId === buffer_1.Buffer.prototype.toString.call(this.id, "latin1");
        }
        if (typeof otherId === "string" && ObjectId2.isValid(otherId) && otherId.length === 24) {
          return otherId.toLowerCase() === this.toHexString();
        }
        if (typeof otherId === "string" && ObjectId2.isValid(otherId) && otherId.length === 12) {
          return buffer_1.Buffer.from(otherId).equals(this.id);
        }
        if (typeof otherId === "object" && "toHexString" in otherId && typeof otherId.toHexString === "function") {
          return otherId.toHexString() === this.toHexString();
        }
        return false;
      };
      ObjectId2.prototype.getTimestamp = function() {
        var timestamp = new Date();
        var time = this.id.readUInt32BE(0);
        timestamp.setTime(Math.floor(time) * 1e3);
        return timestamp;
      };
      ObjectId2.createPk = function() {
        return new ObjectId2();
      };
      ObjectId2.createFromTime = function(time) {
        var buffer = buffer_1.Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        buffer.writeUInt32BE(time, 0);
        return new ObjectId2(buffer);
      };
      ObjectId2.createFromHexString = function(hexString) {
        if (typeof hexString === "undefined" || hexString != null && hexString.length !== 24) {
          throw new error_1.BSONTypeError("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        }
        return new ObjectId2(buffer_1.Buffer.from(hexString, "hex"));
      };
      ObjectId2.isValid = function(id) {
        if (id == null)
          return false;
        if (typeof id === "number") {
          return true;
        }
        if (typeof id === "string") {
          return id.length === 12 || id.length === 24 && checkForHexRegExp.test(id);
        }
        if (id instanceof ObjectId2) {
          return true;
        }
        if (utils_1.isUint8Array(id) && id.length === 12) {
          return true;
        }
        if (typeof id === "object" && "toHexString" in id && typeof id.toHexString === "function") {
          if (typeof id.id === "string") {
            return id.id.length === 12;
          }
          return id.toHexString().length === 24 && checkForHexRegExp.test(id.id.toString("hex"));
        }
        return false;
      };
      ObjectId2.prototype.toExtendedJSON = function() {
        if (this.toHexString)
          return { $oid: this.toHexString() };
        return { $oid: this.toString("hex") };
      };
      ObjectId2.fromExtendedJSON = function(doc) {
        return new ObjectId2(doc.$oid);
      };
      ObjectId2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      ObjectId2.prototype.inspect = function() {
        return 'new ObjectId("' + this.toHexString() + '")';
      };
      ObjectId2.index = ~~(Math.random() * 16777215);
      return ObjectId2;
    }();
    exports2.ObjectId = ObjectId;
    Object.defineProperty(ObjectId.prototype, "generate", {
      value: utils_1.deprecate(function(time) {
        return ObjectId.generate(time);
      }, "Please use the static `ObjectId.generate(time)` instead")
    });
    Object.defineProperty(ObjectId.prototype, "getInc", {
      value: utils_1.deprecate(function() {
        return ObjectId.getInc();
      }, "Please use the static `ObjectId.getInc()` instead")
    });
    Object.defineProperty(ObjectId.prototype, "get_inc", {
      value: utils_1.deprecate(function() {
        return ObjectId.getInc();
      }, "Please use the static `ObjectId.getInc()` instead")
    });
    Object.defineProperty(ObjectId, "get_inc", {
      value: utils_1.deprecate(function() {
        return ObjectId.getInc();
      }, "Please use the static `ObjectId.getInc()` instead")
    });
    Object.defineProperty(ObjectId.prototype, "_bsontype", { value: "ObjectID" });
  }
});

// node_modules/bson/lib/regexp.js
var require_regexp = __commonJS({
  "node_modules/bson/lib/regexp.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BSONRegExp = void 0;
    var error_1 = require_error();
    function alphabetize(str) {
      return str.split("").sort().join("");
    }
    var BSONRegExp = function() {
      function BSONRegExp2(pattern, options) {
        if (!(this instanceof BSONRegExp2))
          return new BSONRegExp2(pattern, options);
        this.pattern = pattern;
        this.options = alphabetize(options !== null && options !== void 0 ? options : "");
        if (this.pattern.indexOf("\0") !== -1) {
          throw new error_1.BSONError("BSON Regex patterns cannot contain null bytes, found: " + JSON.stringify(this.pattern));
        }
        if (this.options.indexOf("\0") !== -1) {
          throw new error_1.BSONError("BSON Regex options cannot contain null bytes, found: " + JSON.stringify(this.options));
        }
        for (var i = 0; i < this.options.length; i++) {
          if (!(this.options[i] === "i" || this.options[i] === "m" || this.options[i] === "x" || this.options[i] === "l" || this.options[i] === "s" || this.options[i] === "u")) {
            throw new error_1.BSONError("The regular expression option [" + this.options[i] + "] is not supported");
          }
        }
      }
      BSONRegExp2.parseOptions = function(options) {
        return options ? options.split("").sort().join("") : "";
      };
      BSONRegExp2.prototype.toExtendedJSON = function(options) {
        options = options || {};
        if (options.legacy) {
          return { $regex: this.pattern, $options: this.options };
        }
        return { $regularExpression: { pattern: this.pattern, options: this.options } };
      };
      BSONRegExp2.fromExtendedJSON = function(doc) {
        if ("$regex" in doc) {
          if (typeof doc.$regex !== "string") {
            if (doc.$regex._bsontype === "BSONRegExp") {
              return doc;
            }
          } else {
            return new BSONRegExp2(doc.$regex, BSONRegExp2.parseOptions(doc.$options));
          }
        }
        if ("$regularExpression" in doc) {
          return new BSONRegExp2(doc.$regularExpression.pattern, BSONRegExp2.parseOptions(doc.$regularExpression.options));
        }
        throw new error_1.BSONTypeError("Unexpected BSONRegExp EJSON object form: " + JSON.stringify(doc));
      };
      return BSONRegExp2;
    }();
    exports2.BSONRegExp = BSONRegExp;
    Object.defineProperty(BSONRegExp.prototype, "_bsontype", { value: "BSONRegExp" });
  }
});

// node_modules/bson/lib/symbol.js
var require_symbol = __commonJS({
  "node_modules/bson/lib/symbol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BSONSymbol = void 0;
    var BSONSymbol = function() {
      function BSONSymbol2(value) {
        if (!(this instanceof BSONSymbol2))
          return new BSONSymbol2(value);
        this.value = value;
      }
      BSONSymbol2.prototype.valueOf = function() {
        return this.value;
      };
      BSONSymbol2.prototype.toString = function() {
        return this.value;
      };
      BSONSymbol2.prototype.inspect = function() {
        return 'new BSONSymbol("' + this.value + '")';
      };
      BSONSymbol2.prototype.toJSON = function() {
        return this.value;
      };
      BSONSymbol2.prototype.toExtendedJSON = function() {
        return { $symbol: this.value };
      };
      BSONSymbol2.fromExtendedJSON = function(doc) {
        return new BSONSymbol2(doc.$symbol);
      };
      BSONSymbol2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      return BSONSymbol2;
    }();
    exports2.BSONSymbol = BSONSymbol;
    Object.defineProperty(BSONSymbol.prototype, "_bsontype", { value: "Symbol" });
  }
});

// node_modules/bson/lib/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/bson/lib/timestamp.js"(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Timestamp = exports2.LongWithoutOverridesClass = void 0;
    var long_1 = require_long();
    var utils_1 = require_utils();
    exports2.LongWithoutOverridesClass = long_1.Long;
    var Timestamp = function(_super) {
      __extends(Timestamp2, _super);
      function Timestamp2(low, high) {
        var _this = this;
        if (!(_this instanceof Timestamp2))
          return new Timestamp2(low, high);
        if (long_1.Long.isLong(low)) {
          _this = _super.call(this, low.low, low.high, true) || this;
        } else if (utils_1.isObjectLike(low) && typeof low.t !== "undefined" && typeof low.i !== "undefined") {
          _this = _super.call(this, low.i, low.t, true) || this;
        } else {
          _this = _super.call(this, low, high, true) || this;
        }
        Object.defineProperty(_this, "_bsontype", {
          value: "Timestamp",
          writable: false,
          configurable: false,
          enumerable: false
        });
        return _this;
      }
      Timestamp2.prototype.toJSON = function() {
        return {
          $timestamp: this.toString()
        };
      };
      Timestamp2.fromInt = function(value) {
        return new Timestamp2(long_1.Long.fromInt(value, true));
      };
      Timestamp2.fromNumber = function(value) {
        return new Timestamp2(long_1.Long.fromNumber(value, true));
      };
      Timestamp2.fromBits = function(lowBits, highBits) {
        return new Timestamp2(lowBits, highBits);
      };
      Timestamp2.fromString = function(str, optRadix) {
        return new Timestamp2(long_1.Long.fromString(str, true, optRadix));
      };
      Timestamp2.prototype.toExtendedJSON = function() {
        return { $timestamp: { t: this.high >>> 0, i: this.low >>> 0 } };
      };
      Timestamp2.fromExtendedJSON = function(doc) {
        return new Timestamp2(doc.$timestamp);
      };
      Timestamp2.prototype[Symbol.for("nodejs.util.inspect.custom")] = function() {
        return this.inspect();
      };
      Timestamp2.prototype.inspect = function() {
        return "new Timestamp({ t: " + this.getHighBits() + ", i: " + this.getLowBits() + " })";
      };
      Timestamp2.MAX_VALUE = long_1.Long.MAX_UNSIGNED_VALUE;
      return Timestamp2;
    }(exports2.LongWithoutOverridesClass);
    exports2.Timestamp = Timestamp;
  }
});

// node_modules/bson/lib/extended_json.js
var require_extended_json = __commonJS({
  "node_modules/bson/lib/extended_json.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EJSON = exports2.isBSONType = void 0;
    var binary_1 = require_binary();
    var code_1 = require_code();
    var db_ref_1 = require_db_ref();
    var decimal128_1 = require_decimal128();
    var double_1 = require_double();
    var error_1 = require_error();
    var int_32_1 = require_int_32();
    var long_1 = require_long();
    var max_key_1 = require_max_key();
    var min_key_1 = require_min_key();
    var objectid_1 = require_objectid();
    var utils_1 = require_utils();
    var regexp_1 = require_regexp();
    var symbol_1 = require_symbol();
    var timestamp_1 = require_timestamp();
    function isBSONType(value) {
      return utils_1.isObjectLike(value) && Reflect.has(value, "_bsontype") && typeof value._bsontype === "string";
    }
    exports2.isBSONType = isBSONType;
    var BSON_INT32_MAX = 2147483647;
    var BSON_INT32_MIN = -2147483648;
    var BSON_INT64_MAX = 9223372036854776e3;
    var BSON_INT64_MIN = -9223372036854776e3;
    var keysToCodecs = {
      $oid: objectid_1.ObjectId,
      $binary: binary_1.Binary,
      $uuid: binary_1.Binary,
      $symbol: symbol_1.BSONSymbol,
      $numberInt: int_32_1.Int32,
      $numberDecimal: decimal128_1.Decimal128,
      $numberDouble: double_1.Double,
      $numberLong: long_1.Long,
      $minKey: min_key_1.MinKey,
      $maxKey: max_key_1.MaxKey,
      $regex: regexp_1.BSONRegExp,
      $regularExpression: regexp_1.BSONRegExp,
      $timestamp: timestamp_1.Timestamp
    };
    function deserializeValue(value, options) {
      if (options === void 0) {
        options = {};
      }
      if (typeof value === "number") {
        if (options.relaxed || options.legacy) {
          return value;
        }
        if (Math.floor(value) === value) {
          if (value >= BSON_INT32_MIN && value <= BSON_INT32_MAX)
            return new int_32_1.Int32(value);
          if (value >= BSON_INT64_MIN && value <= BSON_INT64_MAX)
            return long_1.Long.fromNumber(value);
        }
        return new double_1.Double(value);
      }
      if (value == null || typeof value !== "object")
        return value;
      if (value.$undefined)
        return null;
      var keys = Object.keys(value).filter(function(k) {
        return k.startsWith("$") && value[k] != null;
      });
      for (var i = 0; i < keys.length; i++) {
        var c = keysToCodecs[keys[i]];
        if (c)
          return c.fromExtendedJSON(value, options);
      }
      if (value.$date != null) {
        var d = value.$date;
        var date = new Date();
        if (options.legacy) {
          if (typeof d === "number")
            date.setTime(d);
          else if (typeof d === "string")
            date.setTime(Date.parse(d));
        } else {
          if (typeof d === "string")
            date.setTime(Date.parse(d));
          else if (long_1.Long.isLong(d))
            date.setTime(d.toNumber());
          else if (typeof d === "number" && options.relaxed)
            date.setTime(d);
        }
        return date;
      }
      if (value.$code != null) {
        var copy = Object.assign({}, value);
        if (value.$scope) {
          copy.$scope = deserializeValue(value.$scope);
        }
        return code_1.Code.fromExtendedJSON(value);
      }
      if (db_ref_1.isDBRefLike(value) || value.$dbPointer) {
        var v = value.$ref ? value : value.$dbPointer;
        if (v instanceof db_ref_1.DBRef)
          return v;
        var dollarKeys = Object.keys(v).filter(function(k) {
          return k.startsWith("$");
        });
        var valid_1 = true;
        dollarKeys.forEach(function(k) {
          if (["$ref", "$id", "$db"].indexOf(k) === -1)
            valid_1 = false;
        });
        if (valid_1)
          return db_ref_1.DBRef.fromExtendedJSON(v);
      }
      return value;
    }
    function serializeArray(array, options) {
      return array.map(function(v, index) {
        options.seenObjects.push({ propertyName: "index " + index, obj: null });
        try {
          return serializeValue(v, options);
        } finally {
          options.seenObjects.pop();
        }
      });
    }
    function getISOString(date) {
      var isoStr = date.toISOString();
      return date.getUTCMilliseconds() !== 0 ? isoStr : isoStr.slice(0, -5) + "Z";
    }
    function serializeValue(value, options) {
      if ((typeof value === "object" || typeof value === "function") && value !== null) {
        var index = options.seenObjects.findIndex(function(entry) {
          return entry.obj === value;
        });
        if (index !== -1) {
          var props = options.seenObjects.map(function(entry) {
            return entry.propertyName;
          });
          var leadingPart = props.slice(0, index).map(function(prop) {
            return prop + " -> ";
          }).join("");
          var alreadySeen = props[index];
          var circularPart = " -> " + props.slice(index + 1, props.length - 1).map(function(prop) {
            return prop + " -> ";
          }).join("");
          var current = props[props.length - 1];
          var leadingSpace = " ".repeat(leadingPart.length + alreadySeen.length / 2);
          var dashes = "-".repeat(circularPart.length + (alreadySeen.length + current.length) / 2 - 1);
          throw new error_1.BSONTypeError("Converting circular structure to EJSON:\n" + ("    " + leadingPart + alreadySeen + circularPart + current + "\n") + ("    " + leadingSpace + "\\" + dashes + "/"));
        }
        options.seenObjects[options.seenObjects.length - 1].obj = value;
      }
      if (Array.isArray(value))
        return serializeArray(value, options);
      if (value === void 0)
        return null;
      if (value instanceof Date || utils_1.isDate(value)) {
        var dateNum = value.getTime(), inRange = dateNum > -1 && dateNum < 2534023188e5;
        if (options.legacy) {
          return options.relaxed && inRange ? { $date: value.getTime() } : { $date: getISOString(value) };
        }
        return options.relaxed && inRange ? { $date: getISOString(value) } : { $date: { $numberLong: value.getTime().toString() } };
      }
      if (typeof value === "number" && (!options.relaxed || !isFinite(value))) {
        if (Math.floor(value) === value) {
          var int32Range = value >= BSON_INT32_MIN && value <= BSON_INT32_MAX, int64Range = value >= BSON_INT64_MIN && value <= BSON_INT64_MAX;
          if (int32Range)
            return { $numberInt: value.toString() };
          if (int64Range)
            return { $numberLong: value.toString() };
        }
        return { $numberDouble: value.toString() };
      }
      if (value instanceof RegExp || utils_1.isRegExp(value)) {
        var flags = value.flags;
        if (flags === void 0) {
          var match = value.toString().match(/[gimuy]*$/);
          if (match) {
            flags = match[0];
          }
        }
        var rx = new regexp_1.BSONRegExp(value.source, flags);
        return rx.toExtendedJSON(options);
      }
      if (value != null && typeof value === "object")
        return serializeDocument(value, options);
      return value;
    }
    var BSON_TYPE_MAPPINGS = {
      Binary: function(o) {
        return new binary_1.Binary(o.value(), o.sub_type);
      },
      Code: function(o) {
        return new code_1.Code(o.code, o.scope);
      },
      DBRef: function(o) {
        return new db_ref_1.DBRef(o.collection || o.namespace, o.oid, o.db, o.fields);
      },
      Decimal128: function(o) {
        return new decimal128_1.Decimal128(o.bytes);
      },
      Double: function(o) {
        return new double_1.Double(o.value);
      },
      Int32: function(o) {
        return new int_32_1.Int32(o.value);
      },
      Long: function(o) {
        return long_1.Long.fromBits(o.low != null ? o.low : o.low_, o.low != null ? o.high : o.high_, o.low != null ? o.unsigned : o.unsigned_);
      },
      MaxKey: function() {
        return new max_key_1.MaxKey();
      },
      MinKey: function() {
        return new min_key_1.MinKey();
      },
      ObjectID: function(o) {
        return new objectid_1.ObjectId(o);
      },
      ObjectId: function(o) {
        return new objectid_1.ObjectId(o);
      },
      BSONRegExp: function(o) {
        return new regexp_1.BSONRegExp(o.pattern, o.options);
      },
      Symbol: function(o) {
        return new symbol_1.BSONSymbol(o.value);
      },
      Timestamp: function(o) {
        return timestamp_1.Timestamp.fromBits(o.low, o.high);
      }
    };
    function serializeDocument(doc, options) {
      if (doc == null || typeof doc !== "object")
        throw new error_1.BSONError("not an object instance");
      var bsontype = doc._bsontype;
      if (typeof bsontype === "undefined") {
        var _doc = {};
        for (var name in doc) {
          options.seenObjects.push({ propertyName: name, obj: null });
          try {
            _doc[name] = serializeValue(doc[name], options);
          } finally {
            options.seenObjects.pop();
          }
        }
        return _doc;
      } else if (isBSONType(doc)) {
        var outDoc = doc;
        if (typeof outDoc.toExtendedJSON !== "function") {
          var mapper = BSON_TYPE_MAPPINGS[doc._bsontype];
          if (!mapper) {
            throw new error_1.BSONTypeError("Unrecognized or invalid _bsontype: " + doc._bsontype);
          }
          outDoc = mapper(outDoc);
        }
        if (bsontype === "Code" && outDoc.scope) {
          outDoc = new code_1.Code(outDoc.code, serializeValue(outDoc.scope, options));
        } else if (bsontype === "DBRef" && outDoc.oid) {
          outDoc = new db_ref_1.DBRef(serializeValue(outDoc.collection, options), serializeValue(outDoc.oid, options), serializeValue(outDoc.db, options), serializeValue(outDoc.fields, options));
        }
        return outDoc.toExtendedJSON(options);
      } else {
        throw new error_1.BSONError("_bsontype must be a string, but was: " + typeof bsontype);
      }
    }
    var EJSON;
    (function(EJSON2) {
      function parse(text, options) {
        var finalOptions = Object.assign({}, { relaxed: true, legacy: false }, options);
        if (typeof finalOptions.relaxed === "boolean")
          finalOptions.strict = !finalOptions.relaxed;
        if (typeof finalOptions.strict === "boolean")
          finalOptions.relaxed = !finalOptions.strict;
        return JSON.parse(text, function(key, value) {
          if (key.indexOf("\0") !== -1) {
            throw new error_1.BSONError("BSON Document field names cannot contain null bytes, found: " + JSON.stringify(key));
          }
          return deserializeValue(value, finalOptions);
        });
      }
      EJSON2.parse = parse;
      function stringify(value, replacer, space, options) {
        if (space != null && typeof space === "object") {
          options = space;
          space = 0;
        }
        if (replacer != null && typeof replacer === "object" && !Array.isArray(replacer)) {
          options = replacer;
          replacer = void 0;
          space = 0;
        }
        var serializeOptions = Object.assign({ relaxed: true, legacy: false }, options, {
          seenObjects: [{ propertyName: "(root)", obj: null }]
        });
        var doc = serializeValue(value, serializeOptions);
        return JSON.stringify(doc, replacer, space);
      }
      EJSON2.stringify = stringify;
      function serialize2(value, options) {
        options = options || {};
        return JSON.parse(stringify(value, options));
      }
      EJSON2.serialize = serialize2;
      function deserialize2(ejson, options) {
        options = options || {};
        return parse(JSON.stringify(ejson), options);
      }
      EJSON2.deserialize = deserialize2;
    })(EJSON = exports2.EJSON || (exports2.EJSON = {}));
  }
});

// node_modules/bson/lib/map.js
var require_map = __commonJS({
  "node_modules/bson/lib/map.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Map = void 0;
    var global_1 = require_global();
    var bsonMap;
    exports2.Map = bsonMap;
    var bsonGlobal = global_1.getGlobal();
    if (bsonGlobal.Map) {
      exports2.Map = bsonMap = bsonGlobal.Map;
    } else {
      exports2.Map = bsonMap = function() {
        function Map2(array) {
          if (array === void 0) {
            array = [];
          }
          this._keys = [];
          this._values = {};
          for (var i = 0; i < array.length; i++) {
            if (array[i] == null)
              continue;
            var entry = array[i];
            var key = entry[0];
            var value = entry[1];
            this._keys.push(key);
            this._values[key] = { v: value, i: this._keys.length - 1 };
          }
        }
        Map2.prototype.clear = function() {
          this._keys = [];
          this._values = {};
        };
        Map2.prototype.delete = function(key) {
          var value = this._values[key];
          if (value == null)
            return false;
          delete this._values[key];
          this._keys.splice(value.i, 1);
          return true;
        };
        Map2.prototype.entries = function() {
          var _this = this;
          var index = 0;
          return {
            next: function() {
              var key = _this._keys[index++];
              return {
                value: key !== void 0 ? [key, _this._values[key].v] : void 0,
                done: key !== void 0 ? false : true
              };
            }
          };
        };
        Map2.prototype.forEach = function(callback, self2) {
          self2 = self2 || this;
          for (var i = 0; i < this._keys.length; i++) {
            var key = this._keys[i];
            callback.call(self2, this._values[key].v, key, self2);
          }
        };
        Map2.prototype.get = function(key) {
          return this._values[key] ? this._values[key].v : void 0;
        };
        Map2.prototype.has = function(key) {
          return this._values[key] != null;
        };
        Map2.prototype.keys = function() {
          var _this = this;
          var index = 0;
          return {
            next: function() {
              var key = _this._keys[index++];
              return {
                value: key !== void 0 ? key : void 0,
                done: key !== void 0 ? false : true
              };
            }
          };
        };
        Map2.prototype.set = function(key, value) {
          if (this._values[key]) {
            this._values[key].v = value;
            return this;
          }
          this._keys.push(key);
          this._values[key] = { v: value, i: this._keys.length - 1 };
          return this;
        };
        Map2.prototype.values = function() {
          var _this = this;
          var index = 0;
          return {
            next: function() {
              var key = _this._keys[index++];
              return {
                value: key !== void 0 ? _this._values[key].v : void 0,
                done: key !== void 0 ? false : true
              };
            }
          };
        };
        Object.defineProperty(Map2.prototype, "size", {
          get: function() {
            return this._keys.length;
          },
          enumerable: false,
          configurable: true
        });
        return Map2;
      }();
    }
  }
});

// node_modules/bson/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/bson/lib/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BSON_BINARY_SUBTYPE_USER_DEFINED = exports2.BSON_BINARY_SUBTYPE_COLUMN = exports2.BSON_BINARY_SUBTYPE_ENCRYPTED = exports2.BSON_BINARY_SUBTYPE_MD5 = exports2.BSON_BINARY_SUBTYPE_UUID_NEW = exports2.BSON_BINARY_SUBTYPE_UUID = exports2.BSON_BINARY_SUBTYPE_BYTE_ARRAY = exports2.BSON_BINARY_SUBTYPE_FUNCTION = exports2.BSON_BINARY_SUBTYPE_DEFAULT = exports2.BSON_DATA_MAX_KEY = exports2.BSON_DATA_MIN_KEY = exports2.BSON_DATA_DECIMAL128 = exports2.BSON_DATA_LONG = exports2.BSON_DATA_TIMESTAMP = exports2.BSON_DATA_INT = exports2.BSON_DATA_CODE_W_SCOPE = exports2.BSON_DATA_SYMBOL = exports2.BSON_DATA_CODE = exports2.BSON_DATA_DBPOINTER = exports2.BSON_DATA_REGEXP = exports2.BSON_DATA_NULL = exports2.BSON_DATA_DATE = exports2.BSON_DATA_BOOLEAN = exports2.BSON_DATA_OID = exports2.BSON_DATA_UNDEFINED = exports2.BSON_DATA_BINARY = exports2.BSON_DATA_ARRAY = exports2.BSON_DATA_OBJECT = exports2.BSON_DATA_STRING = exports2.BSON_DATA_NUMBER = exports2.JS_INT_MIN = exports2.JS_INT_MAX = exports2.BSON_INT64_MIN = exports2.BSON_INT64_MAX = exports2.BSON_INT32_MIN = exports2.BSON_INT32_MAX = void 0;
    exports2.BSON_INT32_MAX = 2147483647;
    exports2.BSON_INT32_MIN = -2147483648;
    exports2.BSON_INT64_MAX = Math.pow(2, 63) - 1;
    exports2.BSON_INT64_MIN = -Math.pow(2, 63);
    exports2.JS_INT_MAX = Math.pow(2, 53);
    exports2.JS_INT_MIN = -Math.pow(2, 53);
    exports2.BSON_DATA_NUMBER = 1;
    exports2.BSON_DATA_STRING = 2;
    exports2.BSON_DATA_OBJECT = 3;
    exports2.BSON_DATA_ARRAY = 4;
    exports2.BSON_DATA_BINARY = 5;
    exports2.BSON_DATA_UNDEFINED = 6;
    exports2.BSON_DATA_OID = 7;
    exports2.BSON_DATA_BOOLEAN = 8;
    exports2.BSON_DATA_DATE = 9;
    exports2.BSON_DATA_NULL = 10;
    exports2.BSON_DATA_REGEXP = 11;
    exports2.BSON_DATA_DBPOINTER = 12;
    exports2.BSON_DATA_CODE = 13;
    exports2.BSON_DATA_SYMBOL = 14;
    exports2.BSON_DATA_CODE_W_SCOPE = 15;
    exports2.BSON_DATA_INT = 16;
    exports2.BSON_DATA_TIMESTAMP = 17;
    exports2.BSON_DATA_LONG = 18;
    exports2.BSON_DATA_DECIMAL128 = 19;
    exports2.BSON_DATA_MIN_KEY = 255;
    exports2.BSON_DATA_MAX_KEY = 127;
    exports2.BSON_BINARY_SUBTYPE_DEFAULT = 0;
    exports2.BSON_BINARY_SUBTYPE_FUNCTION = 1;
    exports2.BSON_BINARY_SUBTYPE_BYTE_ARRAY = 2;
    exports2.BSON_BINARY_SUBTYPE_UUID = 3;
    exports2.BSON_BINARY_SUBTYPE_UUID_NEW = 4;
    exports2.BSON_BINARY_SUBTYPE_MD5 = 5;
    exports2.BSON_BINARY_SUBTYPE_ENCRYPTED = 6;
    exports2.BSON_BINARY_SUBTYPE_COLUMN = 7;
    exports2.BSON_BINARY_SUBTYPE_USER_DEFINED = 128;
  }
});

// node_modules/bson/lib/parser/calculate_size.js
var require_calculate_size = __commonJS({
  "node_modules/bson/lib/parser/calculate_size.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.calculateObjectSize = void 0;
    var buffer_1 = require("buffer");
    var binary_1 = require_binary();
    var constants = require_constants2();
    var utils_1 = require_utils();
    function calculateObjectSize(object, serializeFunctions, ignoreUndefined) {
      var totalLength = 4 + 1;
      if (Array.isArray(object)) {
        for (var i = 0; i < object.length; i++) {
          totalLength += calculateElement(i.toString(), object[i], serializeFunctions, true, ignoreUndefined);
        }
      } else {
        if (object.toBSON) {
          object = object.toBSON();
        }
        for (var key in object) {
          totalLength += calculateElement(key, object[key], serializeFunctions, false, ignoreUndefined);
        }
      }
      return totalLength;
    }
    exports2.calculateObjectSize = calculateObjectSize;
    function calculateElement(name, value, serializeFunctions, isArray, ignoreUndefined) {
      if (serializeFunctions === void 0) {
        serializeFunctions = false;
      }
      if (isArray === void 0) {
        isArray = false;
      }
      if (ignoreUndefined === void 0) {
        ignoreUndefined = false;
      }
      if (value && value.toBSON) {
        value = value.toBSON();
      }
      switch (typeof value) {
        case "string":
          return 1 + buffer_1.Buffer.byteLength(name, "utf8") + 1 + 4 + buffer_1.Buffer.byteLength(value, "utf8") + 1;
        case "number":
          if (Math.floor(value) === value && value >= constants.JS_INT_MIN && value <= constants.JS_INT_MAX) {
            if (value >= constants.BSON_INT32_MIN && value <= constants.BSON_INT32_MAX) {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (4 + 1);
            } else {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
            }
          } else {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
          }
        case "undefined":
          if (isArray || !ignoreUndefined)
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1;
          return 0;
        case "boolean":
          return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (1 + 1);
        case "object":
          if (value == null || value["_bsontype"] === "MinKey" || value["_bsontype"] === "MaxKey") {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1;
          } else if (value["_bsontype"] === "ObjectId" || value["_bsontype"] === "ObjectID") {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (12 + 1);
          } else if (value instanceof Date || utils_1.isDate(value)) {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
          } else if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer || utils_1.isAnyArrayBuffer(value)) {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (1 + 4 + 1) + value.byteLength;
          } else if (value["_bsontype"] === "Long" || value["_bsontype"] === "Double" || value["_bsontype"] === "Timestamp") {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (8 + 1);
          } else if (value["_bsontype"] === "Decimal128") {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (16 + 1);
          } else if (value["_bsontype"] === "Code") {
            if (value.scope != null && Object.keys(value.scope).length > 0) {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + 4 + buffer_1.Buffer.byteLength(value.code.toString(), "utf8") + 1 + calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined);
            } else {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + buffer_1.Buffer.byteLength(value.code.toString(), "utf8") + 1;
            }
          } else if (value["_bsontype"] === "Binary") {
            if (value.sub_type === binary_1.Binary.SUBTYPE_BYTE_ARRAY) {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (value.position + 1 + 4 + 1 + 4);
            } else {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + (value.position + 1 + 4 + 1);
            }
          } else if (value["_bsontype"] === "Symbol") {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + buffer_1.Buffer.byteLength(value.value, "utf8") + 4 + 1 + 1;
          } else if (value["_bsontype"] === "DBRef") {
            var ordered_values = Object.assign({
              $ref: value.collection,
              $id: value.oid
            }, value.fields);
            if (value.db != null) {
              ordered_values["$db"] = value.db;
            }
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + calculateObjectSize(ordered_values, serializeFunctions, ignoreUndefined);
          } else if (value instanceof RegExp || utils_1.isRegExp(value)) {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + buffer_1.Buffer.byteLength(value.source, "utf8") + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
          } else if (value["_bsontype"] === "BSONRegExp") {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + buffer_1.Buffer.byteLength(value.pattern, "utf8") + 1 + buffer_1.Buffer.byteLength(value.options, "utf8") + 1;
          } else {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + calculateObjectSize(value, serializeFunctions, ignoreUndefined) + 1;
          }
        case "function":
          if (value instanceof RegExp || utils_1.isRegExp(value) || String.call(value) === "[object RegExp]") {
            return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + buffer_1.Buffer.byteLength(value.source, "utf8") + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
          } else {
            if (serializeFunctions && value.scope != null && Object.keys(value.scope).length > 0) {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + 4 + buffer_1.Buffer.byteLength(utils_1.normalizedFunctionString(value), "utf8") + 1 + calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined);
            } else if (serializeFunctions) {
              return (name != null ? buffer_1.Buffer.byteLength(name, "utf8") + 1 : 0) + 1 + 4 + buffer_1.Buffer.byteLength(utils_1.normalizedFunctionString(value), "utf8") + 1;
            }
          }
      }
      return 0;
    }
  }
});

// node_modules/bson/lib/validate_utf8.js
var require_validate_utf8 = __commonJS({
  "node_modules/bson/lib/validate_utf8.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateUtf8 = void 0;
    var FIRST_BIT = 128;
    var FIRST_TWO_BITS = 192;
    var FIRST_THREE_BITS = 224;
    var FIRST_FOUR_BITS = 240;
    var FIRST_FIVE_BITS = 248;
    var TWO_BIT_CHAR = 192;
    var THREE_BIT_CHAR = 224;
    var FOUR_BIT_CHAR = 240;
    var CONTINUING_CHAR = 128;
    function validateUtf8(bytes, start, end) {
      var continuation = 0;
      for (var i = start; i < end; i += 1) {
        var byte = bytes[i];
        if (continuation) {
          if ((byte & FIRST_TWO_BITS) !== CONTINUING_CHAR) {
            return false;
          }
          continuation -= 1;
        } else if (byte & FIRST_BIT) {
          if ((byte & FIRST_THREE_BITS) === TWO_BIT_CHAR) {
            continuation = 1;
          } else if ((byte & FIRST_FOUR_BITS) === THREE_BIT_CHAR) {
            continuation = 2;
          } else if ((byte & FIRST_FIVE_BITS) === FOUR_BIT_CHAR) {
            continuation = 3;
          } else {
            return false;
          }
        }
      }
      return !continuation;
    }
    exports2.validateUtf8 = validateUtf8;
  }
});

// node_modules/bson/lib/parser/deserializer.js
var require_deserializer = __commonJS({
  "node_modules/bson/lib/parser/deserializer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.deserialize = void 0;
    var buffer_1 = require("buffer");
    var binary_1 = require_binary();
    var code_1 = require_code();
    var constants = require_constants2();
    var db_ref_1 = require_db_ref();
    var decimal128_1 = require_decimal128();
    var double_1 = require_double();
    var error_1 = require_error();
    var int_32_1 = require_int_32();
    var long_1 = require_long();
    var max_key_1 = require_max_key();
    var min_key_1 = require_min_key();
    var objectid_1 = require_objectid();
    var regexp_1 = require_regexp();
    var symbol_1 = require_symbol();
    var timestamp_1 = require_timestamp();
    var validate_utf8_1 = require_validate_utf8();
    var JS_INT_MAX_LONG = long_1.Long.fromNumber(constants.JS_INT_MAX);
    var JS_INT_MIN_LONG = long_1.Long.fromNumber(constants.JS_INT_MIN);
    var functionCache = {};
    function deserialize2(buffer, options, isArray) {
      options = options == null ? {} : options;
      var index = options && options.index ? options.index : 0;
      var size = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
      if (size < 5) {
        throw new error_1.BSONError("bson size must be >= 5, is " + size);
      }
      if (options.allowObjectSmallerThanBufferSize && buffer.length < size) {
        throw new error_1.BSONError("buffer length " + buffer.length + " must be >= bson size " + size);
      }
      if (!options.allowObjectSmallerThanBufferSize && buffer.length !== size) {
        throw new error_1.BSONError("buffer length " + buffer.length + " must === bson size " + size);
      }
      if (size + index > buffer.byteLength) {
        throw new error_1.BSONError("(bson size " + size + " + options.index " + index + " must be <= buffer length " + buffer.byteLength + ")");
      }
      if (buffer[index + size - 1] !== 0) {
        throw new error_1.BSONError("One object, sized correctly, with a spot for an EOO, but the EOO isn't 0x00");
      }
      return deserializeObject(buffer, index, options, isArray);
    }
    exports2.deserialize = deserialize2;
    var allowedDBRefKeys = /^\$ref$|^\$id$|^\$db$/;
    function deserializeObject(buffer, index, options, isArray) {
      if (isArray === void 0) {
        isArray = false;
      }
      var evalFunctions = options["evalFunctions"] == null ? false : options["evalFunctions"];
      var cacheFunctions = options["cacheFunctions"] == null ? false : options["cacheFunctions"];
      var fieldsAsRaw = options["fieldsAsRaw"] == null ? null : options["fieldsAsRaw"];
      var raw = options["raw"] == null ? false : options["raw"];
      var bsonRegExp = typeof options["bsonRegExp"] === "boolean" ? options["bsonRegExp"] : false;
      var promoteBuffers = options["promoteBuffers"] == null ? false : options["promoteBuffers"];
      var promoteLongs = options["promoteLongs"] == null ? true : options["promoteLongs"];
      var promoteValues = options["promoteValues"] == null ? true : options["promoteValues"];
      var startIndex = index;
      if (buffer.length < 5)
        throw new error_1.BSONError("corrupt bson message < 5 bytes long");
      var size = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
      if (size < 5 || size > buffer.length)
        throw new error_1.BSONError("corrupt bson message");
      var object = isArray ? [] : {};
      var arrayIndex = 0;
      var done = false;
      var isPossibleDBRef = isArray ? false : null;
      while (!done) {
        var elementType = buffer[index++];
        if (elementType === 0)
          break;
        var i = index;
        while (buffer[i] !== 0 && i < buffer.length) {
          i++;
        }
        if (i >= buffer.byteLength)
          throw new error_1.BSONError("Bad BSON Document: illegal CString");
        var name = isArray ? arrayIndex++ : buffer.toString("utf8", index, i);
        if (isPossibleDBRef !== false && name[0] === "$") {
          isPossibleDBRef = allowedDBRefKeys.test(name);
        }
        var value = void 0;
        index = i + 1;
        if (elementType === constants.BSON_DATA_STRING) {
          var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] !== 0) {
            throw new error_1.BSONError("bad string length in bson");
          }
          value = getValidatedString(buffer, index, index + stringSize - 1);
          index = index + stringSize;
        } else if (elementType === constants.BSON_DATA_OID) {
          var oid = buffer_1.Buffer.alloc(12);
          buffer.copy(oid, 0, index, index + 12);
          value = new objectid_1.ObjectId(oid);
          index = index + 12;
        } else if (elementType === constants.BSON_DATA_INT && promoteValues === false) {
          value = new int_32_1.Int32(buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24);
        } else if (elementType === constants.BSON_DATA_INT) {
          value = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
        } else if (elementType === constants.BSON_DATA_NUMBER && promoteValues === false) {
          value = new double_1.Double(buffer.readDoubleLE(index));
          index = index + 8;
        } else if (elementType === constants.BSON_DATA_NUMBER) {
          value = buffer.readDoubleLE(index);
          index = index + 8;
        } else if (elementType === constants.BSON_DATA_DATE) {
          var lowBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          var highBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          value = new Date(new long_1.Long(lowBits, highBits).toNumber());
        } else if (elementType === constants.BSON_DATA_BOOLEAN) {
          if (buffer[index] !== 0 && buffer[index] !== 1)
            throw new error_1.BSONError("illegal boolean type value");
          value = buffer[index++] === 1;
        } else if (elementType === constants.BSON_DATA_OBJECT) {
          var _index = index;
          var objectSize = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
          if (objectSize <= 0 || objectSize > buffer.length - index)
            throw new error_1.BSONError("bad embedded document length in bson");
          if (raw) {
            value = buffer.slice(index, index + objectSize);
          } else {
            value = deserializeObject(buffer, _index, options, false);
          }
          index = index + objectSize;
        } else if (elementType === constants.BSON_DATA_ARRAY) {
          var _index = index;
          var objectSize = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
          var arrayOptions = options;
          var stopIndex = index + objectSize;
          if (fieldsAsRaw && fieldsAsRaw[name]) {
            arrayOptions = {};
            for (var n in options) {
              arrayOptions[n] = options[n];
            }
            arrayOptions["raw"] = true;
          }
          value = deserializeObject(buffer, _index, arrayOptions, true);
          index = index + objectSize;
          if (buffer[index - 1] !== 0)
            throw new error_1.BSONError("invalid array terminator byte");
          if (index !== stopIndex)
            throw new error_1.BSONError("corrupted array bson");
        } else if (elementType === constants.BSON_DATA_UNDEFINED) {
          value = void 0;
        } else if (elementType === constants.BSON_DATA_NULL) {
          value = null;
        } else if (elementType === constants.BSON_DATA_LONG) {
          var lowBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          var highBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          var long = new long_1.Long(lowBits, highBits);
          if (promoteLongs && promoteValues === true) {
            value = long.lessThanOrEqual(JS_INT_MAX_LONG) && long.greaterThanOrEqual(JS_INT_MIN_LONG) ? long.toNumber() : long;
          } else {
            value = long;
          }
        } else if (elementType === constants.BSON_DATA_DECIMAL128) {
          var bytes = buffer_1.Buffer.alloc(16);
          buffer.copy(bytes, 0, index, index + 16);
          index = index + 16;
          var decimal128 = new decimal128_1.Decimal128(bytes);
          if ("toObject" in decimal128 && typeof decimal128.toObject === "function") {
            value = decimal128.toObject();
          } else {
            value = decimal128;
          }
        } else if (elementType === constants.BSON_DATA_BINARY) {
          var binarySize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          var totalBinarySize = binarySize;
          var subType = buffer[index++];
          if (binarySize < 0)
            throw new error_1.BSONError("Negative binary type element size found");
          if (binarySize > buffer.byteLength)
            throw new error_1.BSONError("Binary type size larger than document size");
          if (buffer["slice"] != null) {
            if (subType === binary_1.Binary.SUBTYPE_BYTE_ARRAY) {
              binarySize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
              if (binarySize < 0)
                throw new error_1.BSONError("Negative binary type element size found for subtype 0x02");
              if (binarySize > totalBinarySize - 4)
                throw new error_1.BSONError("Binary type with subtype 0x02 contains too long binary size");
              if (binarySize < totalBinarySize - 4)
                throw new error_1.BSONError("Binary type with subtype 0x02 contains too short binary size");
            }
            if (promoteBuffers && promoteValues) {
              value = buffer.slice(index, index + binarySize);
            } else {
              value = new binary_1.Binary(buffer.slice(index, index + binarySize), subType);
            }
          } else {
            var _buffer = buffer_1.Buffer.alloc(binarySize);
            if (subType === binary_1.Binary.SUBTYPE_BYTE_ARRAY) {
              binarySize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
              if (binarySize < 0)
                throw new error_1.BSONError("Negative binary type element size found for subtype 0x02");
              if (binarySize > totalBinarySize - 4)
                throw new error_1.BSONError("Binary type with subtype 0x02 contains too long binary size");
              if (binarySize < totalBinarySize - 4)
                throw new error_1.BSONError("Binary type with subtype 0x02 contains too short binary size");
            }
            for (i = 0; i < binarySize; i++) {
              _buffer[i] = buffer[index + i];
            }
            if (promoteBuffers && promoteValues) {
              value = _buffer;
            } else {
              value = new binary_1.Binary(_buffer, subType);
            }
          }
          index = index + binarySize;
        } else if (elementType === constants.BSON_DATA_REGEXP && bsonRegExp === false) {
          i = index;
          while (buffer[i] !== 0 && i < buffer.length) {
            i++;
          }
          if (i >= buffer.length)
            throw new error_1.BSONError("Bad BSON Document: illegal CString");
          var source = buffer.toString("utf8", index, i);
          index = i + 1;
          i = index;
          while (buffer[i] !== 0 && i < buffer.length) {
            i++;
          }
          if (i >= buffer.length)
            throw new error_1.BSONError("Bad BSON Document: illegal CString");
          var regExpOptions = buffer.toString("utf8", index, i);
          index = i + 1;
          var optionsArray = new Array(regExpOptions.length);
          for (i = 0; i < regExpOptions.length; i++) {
            switch (regExpOptions[i]) {
              case "m":
                optionsArray[i] = "m";
                break;
              case "s":
                optionsArray[i] = "g";
                break;
              case "i":
                optionsArray[i] = "i";
                break;
            }
          }
          value = new RegExp(source, optionsArray.join(""));
        } else if (elementType === constants.BSON_DATA_REGEXP && bsonRegExp === true) {
          i = index;
          while (buffer[i] !== 0 && i < buffer.length) {
            i++;
          }
          if (i >= buffer.length)
            throw new error_1.BSONError("Bad BSON Document: illegal CString");
          var source = buffer.toString("utf8", index, i);
          index = i + 1;
          i = index;
          while (buffer[i] !== 0 && i < buffer.length) {
            i++;
          }
          if (i >= buffer.length)
            throw new error_1.BSONError("Bad BSON Document: illegal CString");
          var regExpOptions = buffer.toString("utf8", index, i);
          index = i + 1;
          value = new regexp_1.BSONRegExp(source, regExpOptions);
        } else if (elementType === constants.BSON_DATA_SYMBOL) {
          var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] !== 0) {
            throw new error_1.BSONError("bad string length in bson");
          }
          var symbol = getValidatedString(buffer, index, index + stringSize - 1);
          value = promoteValues ? symbol : new symbol_1.BSONSymbol(symbol);
          index = index + stringSize;
        } else if (elementType === constants.BSON_DATA_TIMESTAMP) {
          var lowBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          var highBits = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          value = new timestamp_1.Timestamp(lowBits, highBits);
        } else if (elementType === constants.BSON_DATA_MIN_KEY) {
          value = new min_key_1.MinKey();
        } else if (elementType === constants.BSON_DATA_MAX_KEY) {
          value = new max_key_1.MaxKey();
        } else if (elementType === constants.BSON_DATA_CODE) {
          var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] !== 0) {
            throw new error_1.BSONError("bad string length in bson");
          }
          var functionString = getValidatedString(buffer, index, index + stringSize - 1);
          if (evalFunctions) {
            if (cacheFunctions) {
              value = isolateEval(functionString, functionCache, object);
            } else {
              value = isolateEval(functionString);
            }
          } else {
            value = new code_1.Code(functionString);
          }
          index = index + stringSize;
        } else if (elementType === constants.BSON_DATA_CODE_W_SCOPE) {
          var totalSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          if (totalSize < 4 + 4 + 4 + 1) {
            throw new error_1.BSONError("code_w_scope total size shorter minimum expected length");
          }
          var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] !== 0) {
            throw new error_1.BSONError("bad string length in bson");
          }
          var functionString = getValidatedString(buffer, index, index + stringSize - 1);
          index = index + stringSize;
          var _index = index;
          var objectSize = buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16 | buffer[index + 3] << 24;
          var scopeObject = deserializeObject(buffer, _index, options, false);
          index = index + objectSize;
          if (totalSize < 4 + 4 + objectSize + stringSize) {
            throw new error_1.BSONError("code_w_scope total size is too short, truncating scope");
          }
          if (totalSize > 4 + 4 + objectSize + stringSize) {
            throw new error_1.BSONError("code_w_scope total size is too long, clips outer document");
          }
          if (evalFunctions) {
            if (cacheFunctions) {
              value = isolateEval(functionString, functionCache, object);
            } else {
              value = isolateEval(functionString);
            }
            value.scope = scopeObject;
          } else {
            value = new code_1.Code(functionString, scopeObject);
          }
        } else if (elementType === constants.BSON_DATA_DBPOINTER) {
          var stringSize = buffer[index++] | buffer[index++] << 8 | buffer[index++] << 16 | buffer[index++] << 24;
          if (stringSize <= 0 || stringSize > buffer.length - index || buffer[index + stringSize - 1] !== 0)
            throw new error_1.BSONError("bad string length in bson");
          if (!validate_utf8_1.validateUtf8(buffer, index, index + stringSize - 1)) {
            throw new error_1.BSONError("Invalid UTF-8 string in BSON document");
          }
          var namespace = buffer.toString("utf8", index, index + stringSize - 1);
          index = index + stringSize;
          var oidBuffer = buffer_1.Buffer.alloc(12);
          buffer.copy(oidBuffer, 0, index, index + 12);
          var oid = new objectid_1.ObjectId(oidBuffer);
          index = index + 12;
          value = new db_ref_1.DBRef(namespace, oid);
        } else {
          throw new error_1.BSONError("Detected unknown BSON type " + elementType.toString(16) + ' for fieldname "' + name + '"');
        }
        if (name === "__proto__") {
          Object.defineProperty(object, name, {
            value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        } else {
          object[name] = value;
        }
      }
      if (size !== index - startIndex) {
        if (isArray)
          throw new error_1.BSONError("corrupt array bson");
        throw new error_1.BSONError("corrupt object bson");
      }
      if (!isPossibleDBRef)
        return object;
      if (db_ref_1.isDBRefLike(object)) {
        var copy = Object.assign({}, object);
        delete copy.$ref;
        delete copy.$id;
        delete copy.$db;
        return new db_ref_1.DBRef(object.$ref, object.$id, object.$db, copy);
      }
      return object;
    }
    function isolateEval(functionString, functionCache2, object) {
      if (!functionCache2)
        return new Function(functionString);
      if (functionCache2[functionString] == null) {
        functionCache2[functionString] = new Function(functionString);
      }
      return functionCache2[functionString].bind(object);
    }
    function getValidatedString(buffer, start, end) {
      var value = buffer.toString("utf8", start, end);
      for (var i = 0; i < value.length; i++) {
        if (value.charCodeAt(i) === 65533) {
          if (!validate_utf8_1.validateUtf8(buffer, start, end)) {
            throw new error_1.BSONError("Invalid UTF-8 string in BSON document");
          }
          break;
        }
      }
      return value;
    }
  }
});

// node_modules/bson/lib/float_parser.js
var require_float_parser = __commonJS({
  "node_modules/bson/lib/float_parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.writeIEEE754 = exports2.readIEEE754 = void 0;
    function readIEEE754(buffer, offset, endian, mLen, nBytes) {
      var e;
      var m;
      var bBE = endian === "big";
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = bBE ? 0 : nBytes - 1;
      var d = bBE ? 1 : -1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8)
        ;
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8)
        ;
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    }
    exports2.readIEEE754 = readIEEE754;
    function writeIEEE754(buffer, value, offset, endian, mLen, nBytes) {
      var e;
      var m;
      var c;
      var bBE = endian === "big";
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = bBE ? nBytes - 1 : 0;
      var d = bBE ? -1 : 1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      if (isNaN(value))
        m = 0;
      while (mLen >= 8) {
        buffer[offset + i] = m & 255;
        i += d;
        m /= 256;
        mLen -= 8;
      }
      e = e << mLen | m;
      if (isNaN(value))
        e += 8;
      eLen += mLen;
      while (eLen > 0) {
        buffer[offset + i] = e & 255;
        i += d;
        e /= 256;
        eLen -= 8;
      }
      buffer[offset + i - d] |= s * 128;
    }
    exports2.writeIEEE754 = writeIEEE754;
  }
});

// node_modules/bson/lib/parser/serializer.js
var require_serializer = __commonJS({
  "node_modules/bson/lib/parser/serializer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.serializeInto = void 0;
    var binary_1 = require_binary();
    var constants = require_constants2();
    var ensure_buffer_1 = require_ensure_buffer();
    var error_1 = require_error();
    var extended_json_1 = require_extended_json();
    var float_parser_1 = require_float_parser();
    var long_1 = require_long();
    var map_1 = require_map();
    var utils_1 = require_utils();
    var regexp = /\x00/;
    var ignoreKeys = new Set(["$db", "$ref", "$id", "$clusterTime"]);
    function serializeString(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_STRING;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes + 1;
      buffer[index - 1] = 0;
      var size = buffer.write(value, index + 4, void 0, "utf8");
      buffer[index + 3] = size + 1 >> 24 & 255;
      buffer[index + 2] = size + 1 >> 16 & 255;
      buffer[index + 1] = size + 1 >> 8 & 255;
      buffer[index] = size + 1 & 255;
      index = index + 4 + size;
      buffer[index++] = 0;
      return index;
    }
    function serializeNumber(buffer, key, value, index, isArray) {
      if (Number.isInteger(value) && value >= constants.BSON_INT32_MIN && value <= constants.BSON_INT32_MAX) {
        buffer[index++] = constants.BSON_DATA_INT;
        var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        buffer[index++] = value & 255;
        buffer[index++] = value >> 8 & 255;
        buffer[index++] = value >> 16 & 255;
        buffer[index++] = value >> 24 & 255;
      } else {
        buffer[index++] = constants.BSON_DATA_NUMBER;
        var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        float_parser_1.writeIEEE754(buffer, value, index, "little", 52, 8);
        index = index + 8;
      }
      return index;
    }
    function serializeNull(buffer, key, _, index, isArray) {
      buffer[index++] = constants.BSON_DATA_NULL;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      return index;
    }
    function serializeBoolean(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_BOOLEAN;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      buffer[index++] = value ? 1 : 0;
      return index;
    }
    function serializeDate(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_DATE;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var dateInMilis = long_1.Long.fromNumber(value.getTime());
      var lowBits = dateInMilis.getLowBits();
      var highBits = dateInMilis.getHighBits();
      buffer[index++] = lowBits & 255;
      buffer[index++] = lowBits >> 8 & 255;
      buffer[index++] = lowBits >> 16 & 255;
      buffer[index++] = lowBits >> 24 & 255;
      buffer[index++] = highBits & 255;
      buffer[index++] = highBits >> 8 & 255;
      buffer[index++] = highBits >> 16 & 255;
      buffer[index++] = highBits >> 24 & 255;
      return index;
    }
    function serializeRegExp(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_REGEXP;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      if (value.source && value.source.match(regexp) != null) {
        throw Error("value " + value.source + " must not contain null bytes");
      }
      index = index + buffer.write(value.source, index, void 0, "utf8");
      buffer[index++] = 0;
      if (value.ignoreCase)
        buffer[index++] = 105;
      if (value.global)
        buffer[index++] = 115;
      if (value.multiline)
        buffer[index++] = 109;
      buffer[index++] = 0;
      return index;
    }
    function serializeBSONRegExp(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_REGEXP;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      if (value.pattern.match(regexp) != null) {
        throw Error("pattern " + value.pattern + " must not contain null bytes");
      }
      index = index + buffer.write(value.pattern, index, void 0, "utf8");
      buffer[index++] = 0;
      index = index + buffer.write(value.options.split("").sort().join(""), index, void 0, "utf8");
      buffer[index++] = 0;
      return index;
    }
    function serializeMinMax(buffer, key, value, index, isArray) {
      if (value === null) {
        buffer[index++] = constants.BSON_DATA_NULL;
      } else if (value._bsontype === "MinKey") {
        buffer[index++] = constants.BSON_DATA_MIN_KEY;
      } else {
        buffer[index++] = constants.BSON_DATA_MAX_KEY;
      }
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      return index;
    }
    function serializeObjectId(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_OID;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      if (typeof value.id === "string") {
        buffer.write(value.id, index, void 0, "binary");
      } else if (utils_1.isUint8Array(value.id)) {
        buffer.set(value.id.subarray(0, 12), index);
      } else {
        throw new error_1.BSONTypeError("object [" + JSON.stringify(value) + "] is not a valid ObjectId");
      }
      return index + 12;
    }
    function serializeBuffer(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_BINARY;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var size = value.length;
      buffer[index++] = size & 255;
      buffer[index++] = size >> 8 & 255;
      buffer[index++] = size >> 16 & 255;
      buffer[index++] = size >> 24 & 255;
      buffer[index++] = constants.BSON_BINARY_SUBTYPE_DEFAULT;
      buffer.set(ensure_buffer_1.ensureBuffer(value), index);
      index = index + size;
      return index;
    }
    function serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, isArray, path) {
      if (checkKeys === void 0) {
        checkKeys = false;
      }
      if (depth === void 0) {
        depth = 0;
      }
      if (serializeFunctions === void 0) {
        serializeFunctions = false;
      }
      if (ignoreUndefined === void 0) {
        ignoreUndefined = true;
      }
      if (isArray === void 0) {
        isArray = false;
      }
      if (path === void 0) {
        path = [];
      }
      for (var i = 0; i < path.length; i++) {
        if (path[i] === value)
          throw new error_1.BSONError("cyclic dependency detected");
      }
      path.push(value);
      buffer[index++] = Array.isArray(value) ? constants.BSON_DATA_ARRAY : constants.BSON_DATA_OBJECT;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var endIndex = serializeInto(buffer, value, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined, path);
      path.pop();
      return endIndex;
    }
    function serializeDecimal128(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_DECIMAL128;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      buffer.set(value.bytes.subarray(0, 16), index);
      return index + 16;
    }
    function serializeLong(buffer, key, value, index, isArray) {
      buffer[index++] = value._bsontype === "Long" ? constants.BSON_DATA_LONG : constants.BSON_DATA_TIMESTAMP;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var lowBits = value.getLowBits();
      var highBits = value.getHighBits();
      buffer[index++] = lowBits & 255;
      buffer[index++] = lowBits >> 8 & 255;
      buffer[index++] = lowBits >> 16 & 255;
      buffer[index++] = lowBits >> 24 & 255;
      buffer[index++] = highBits & 255;
      buffer[index++] = highBits >> 8 & 255;
      buffer[index++] = highBits >> 16 & 255;
      buffer[index++] = highBits >> 24 & 255;
      return index;
    }
    function serializeInt32(buffer, key, value, index, isArray) {
      value = value.valueOf();
      buffer[index++] = constants.BSON_DATA_INT;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      buffer[index++] = value & 255;
      buffer[index++] = value >> 8 & 255;
      buffer[index++] = value >> 16 & 255;
      buffer[index++] = value >> 24 & 255;
      return index;
    }
    function serializeDouble(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_NUMBER;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      float_parser_1.writeIEEE754(buffer, value.value, index, "little", 52, 8);
      index = index + 8;
      return index;
    }
    function serializeFunction(buffer, key, value, index, _checkKeys, _depth, isArray) {
      if (_checkKeys === void 0) {
        _checkKeys = false;
      }
      if (_depth === void 0) {
        _depth = 0;
      }
      buffer[index++] = constants.BSON_DATA_CODE;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var functionString = utils_1.normalizedFunctionString(value);
      var size = buffer.write(functionString, index + 4, void 0, "utf8") + 1;
      buffer[index] = size & 255;
      buffer[index + 1] = size >> 8 & 255;
      buffer[index + 2] = size >> 16 & 255;
      buffer[index + 3] = size >> 24 & 255;
      index = index + 4 + size - 1;
      buffer[index++] = 0;
      return index;
    }
    function serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, isArray) {
      if (checkKeys === void 0) {
        checkKeys = false;
      }
      if (depth === void 0) {
        depth = 0;
      }
      if (serializeFunctions === void 0) {
        serializeFunctions = false;
      }
      if (ignoreUndefined === void 0) {
        ignoreUndefined = true;
      }
      if (isArray === void 0) {
        isArray = false;
      }
      if (value.scope && typeof value.scope === "object") {
        buffer[index++] = constants.BSON_DATA_CODE_W_SCOPE;
        var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        var startIndex = index;
        var functionString = typeof value.code === "string" ? value.code : value.code.toString();
        index = index + 4;
        var codeSize = buffer.write(functionString, index + 4, void 0, "utf8") + 1;
        buffer[index] = codeSize & 255;
        buffer[index + 1] = codeSize >> 8 & 255;
        buffer[index + 2] = codeSize >> 16 & 255;
        buffer[index + 3] = codeSize >> 24 & 255;
        buffer[index + 4 + codeSize - 1] = 0;
        index = index + codeSize + 4;
        var endIndex = serializeInto(buffer, value.scope, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined);
        index = endIndex - 1;
        var totalSize = endIndex - startIndex;
        buffer[startIndex++] = totalSize & 255;
        buffer[startIndex++] = totalSize >> 8 & 255;
        buffer[startIndex++] = totalSize >> 16 & 255;
        buffer[startIndex++] = totalSize >> 24 & 255;
        buffer[index++] = 0;
      } else {
        buffer[index++] = constants.BSON_DATA_CODE;
        var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        var functionString = value.code.toString();
        var size = buffer.write(functionString, index + 4, void 0, "utf8") + 1;
        buffer[index] = size & 255;
        buffer[index + 1] = size >> 8 & 255;
        buffer[index + 2] = size >> 16 & 255;
        buffer[index + 3] = size >> 24 & 255;
        index = index + 4 + size - 1;
        buffer[index++] = 0;
      }
      return index;
    }
    function serializeBinary(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_BINARY;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var data = value.value(true);
      var size = value.position;
      if (value.sub_type === binary_1.Binary.SUBTYPE_BYTE_ARRAY)
        size = size + 4;
      buffer[index++] = size & 255;
      buffer[index++] = size >> 8 & 255;
      buffer[index++] = size >> 16 & 255;
      buffer[index++] = size >> 24 & 255;
      buffer[index++] = value.sub_type;
      if (value.sub_type === binary_1.Binary.SUBTYPE_BYTE_ARRAY) {
        size = size - 4;
        buffer[index++] = size & 255;
        buffer[index++] = size >> 8 & 255;
        buffer[index++] = size >> 16 & 255;
        buffer[index++] = size >> 24 & 255;
      }
      buffer.set(data, index);
      index = index + value.position;
      return index;
    }
    function serializeSymbol(buffer, key, value, index, isArray) {
      buffer[index++] = constants.BSON_DATA_SYMBOL;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var size = buffer.write(value.value, index + 4, void 0, "utf8") + 1;
      buffer[index] = size & 255;
      buffer[index + 1] = size >> 8 & 255;
      buffer[index + 2] = size >> 16 & 255;
      buffer[index + 3] = size >> 24 & 255;
      index = index + 4 + size - 1;
      buffer[index++] = 0;
      return index;
    }
    function serializeDBRef(buffer, key, value, index, depth, serializeFunctions, isArray) {
      buffer[index++] = constants.BSON_DATA_OBJECT;
      var numberOfWrittenBytes = !isArray ? buffer.write(key, index, void 0, "utf8") : buffer.write(key, index, void 0, "ascii");
      index = index + numberOfWrittenBytes;
      buffer[index++] = 0;
      var startIndex = index;
      var output = {
        $ref: value.collection || value.namespace,
        $id: value.oid
      };
      if (value.db != null) {
        output.$db = value.db;
      }
      output = Object.assign(output, value.fields);
      var endIndex = serializeInto(buffer, output, false, index, depth + 1, serializeFunctions);
      var size = endIndex - startIndex;
      buffer[startIndex++] = size & 255;
      buffer[startIndex++] = size >> 8 & 255;
      buffer[startIndex++] = size >> 16 & 255;
      buffer[startIndex++] = size >> 24 & 255;
      return endIndex;
    }
    function serializeInto(buffer, object, checkKeys, startingIndex, depth, serializeFunctions, ignoreUndefined, path) {
      if (checkKeys === void 0) {
        checkKeys = false;
      }
      if (startingIndex === void 0) {
        startingIndex = 0;
      }
      if (depth === void 0) {
        depth = 0;
      }
      if (serializeFunctions === void 0) {
        serializeFunctions = false;
      }
      if (ignoreUndefined === void 0) {
        ignoreUndefined = true;
      }
      if (path === void 0) {
        path = [];
      }
      startingIndex = startingIndex || 0;
      path = path || [];
      path.push(object);
      var index = startingIndex + 4;
      if (Array.isArray(object)) {
        for (var i = 0; i < object.length; i++) {
          var key = "" + i;
          var value = object[i];
          if (value && value.toBSON) {
            if (typeof value.toBSON !== "function")
              throw new error_1.BSONTypeError("toBSON is not a function");
            value = value.toBSON();
          }
          if (typeof value === "string") {
            index = serializeString(buffer, key, value, index, true);
          } else if (typeof value === "number") {
            index = serializeNumber(buffer, key, value, index, true);
          } else if (typeof value === "bigint") {
            throw new error_1.BSONTypeError("Unsupported type BigInt, please use Decimal128");
          } else if (typeof value === "boolean") {
            index = serializeBoolean(buffer, key, value, index, true);
          } else if (value instanceof Date || utils_1.isDate(value)) {
            index = serializeDate(buffer, key, value, index, true);
          } else if (value === void 0) {
            index = serializeNull(buffer, key, value, index, true);
          } else if (value === null) {
            index = serializeNull(buffer, key, value, index, true);
          } else if (value["_bsontype"] === "ObjectId" || value["_bsontype"] === "ObjectID") {
            index = serializeObjectId(buffer, key, value, index, true);
          } else if (utils_1.isUint8Array(value)) {
            index = serializeBuffer(buffer, key, value, index, true);
          } else if (value instanceof RegExp || utils_1.isRegExp(value)) {
            index = serializeRegExp(buffer, key, value, index, true);
          } else if (typeof value === "object" && value["_bsontype"] == null) {
            index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true, path);
          } else if (typeof value === "object" && extended_json_1.isBSONType(value) && value._bsontype === "Decimal128") {
            index = serializeDecimal128(buffer, key, value, index, true);
          } else if (value["_bsontype"] === "Long" || value["_bsontype"] === "Timestamp") {
            index = serializeLong(buffer, key, value, index, true);
          } else if (value["_bsontype"] === "Double") {
            index = serializeDouble(buffer, key, value, index, true);
          } else if (typeof value === "function" && serializeFunctions) {
            index = serializeFunction(buffer, key, value, index, checkKeys, depth, true);
          } else if (value["_bsontype"] === "Code") {
            index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true);
          } else if (value["_bsontype"] === "Binary") {
            index = serializeBinary(buffer, key, value, index, true);
          } else if (value["_bsontype"] === "Symbol") {
            index = serializeSymbol(buffer, key, value, index, true);
          } else if (value["_bsontype"] === "DBRef") {
            index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions, true);
          } else if (value["_bsontype"] === "BSONRegExp") {
            index = serializeBSONRegExp(buffer, key, value, index, true);
          } else if (value["_bsontype"] === "Int32") {
            index = serializeInt32(buffer, key, value, index, true);
          } else if (value["_bsontype"] === "MinKey" || value["_bsontype"] === "MaxKey") {
            index = serializeMinMax(buffer, key, value, index, true);
          } else if (typeof value["_bsontype"] !== "undefined") {
            throw new error_1.BSONTypeError("Unrecognized or invalid _bsontype: " + value["_bsontype"]);
          }
        }
      } else if (object instanceof map_1.Map || utils_1.isMap(object)) {
        var iterator = object.entries();
        var done = false;
        while (!done) {
          var entry = iterator.next();
          done = !!entry.done;
          if (done)
            continue;
          var key = entry.value[0];
          var value = entry.value[1];
          var type = typeof value;
          if (typeof key === "string" && !ignoreKeys.has(key)) {
            if (key.match(regexp) != null) {
              throw Error("key " + key + " must not contain null bytes");
            }
            if (checkKeys) {
              if (key[0] === "$") {
                throw Error("key " + key + " must not start with '$'");
              } else if (~key.indexOf(".")) {
                throw Error("key " + key + " must not contain '.'");
              }
            }
          }
          if (type === "string") {
            index = serializeString(buffer, key, value, index);
          } else if (type === "number") {
            index = serializeNumber(buffer, key, value, index);
          } else if (type === "bigint" || utils_1.isBigInt64Array(value) || utils_1.isBigUInt64Array(value)) {
            throw new error_1.BSONTypeError("Unsupported type BigInt, please use Decimal128");
          } else if (type === "boolean") {
            index = serializeBoolean(buffer, key, value, index);
          } else if (value instanceof Date || utils_1.isDate(value)) {
            index = serializeDate(buffer, key, value, index);
          } else if (value === null || value === void 0 && ignoreUndefined === false) {
            index = serializeNull(buffer, key, value, index);
          } else if (value["_bsontype"] === "ObjectId" || value["_bsontype"] === "ObjectID") {
            index = serializeObjectId(buffer, key, value, index);
          } else if (utils_1.isUint8Array(value)) {
            index = serializeBuffer(buffer, key, value, index);
          } else if (value instanceof RegExp || utils_1.isRegExp(value)) {
            index = serializeRegExp(buffer, key, value, index);
          } else if (type === "object" && value["_bsontype"] == null) {
            index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
          } else if (type === "object" && value["_bsontype"] === "Decimal128") {
            index = serializeDecimal128(buffer, key, value, index);
          } else if (value["_bsontype"] === "Long" || value["_bsontype"] === "Timestamp") {
            index = serializeLong(buffer, key, value, index);
          } else if (value["_bsontype"] === "Double") {
            index = serializeDouble(buffer, key, value, index);
          } else if (value["_bsontype"] === "Code") {
            index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
          } else if (typeof value === "function" && serializeFunctions) {
            index = serializeFunction(buffer, key, value, index, checkKeys, depth, serializeFunctions);
          } else if (value["_bsontype"] === "Binary") {
            index = serializeBinary(buffer, key, value, index);
          } else if (value["_bsontype"] === "Symbol") {
            index = serializeSymbol(buffer, key, value, index);
          } else if (value["_bsontype"] === "DBRef") {
            index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions);
          } else if (value["_bsontype"] === "BSONRegExp") {
            index = serializeBSONRegExp(buffer, key, value, index);
          } else if (value["_bsontype"] === "Int32") {
            index = serializeInt32(buffer, key, value, index);
          } else if (value["_bsontype"] === "MinKey" || value["_bsontype"] === "MaxKey") {
            index = serializeMinMax(buffer, key, value, index);
          } else if (typeof value["_bsontype"] !== "undefined") {
            throw new error_1.BSONTypeError("Unrecognized or invalid _bsontype: " + value["_bsontype"]);
          }
        }
      } else {
        if (object.toBSON) {
          if (typeof object.toBSON !== "function")
            throw new error_1.BSONTypeError("toBSON is not a function");
          object = object.toBSON();
          if (object != null && typeof object !== "object")
            throw new error_1.BSONTypeError("toBSON function did not return an object");
        }
        for (var key in object) {
          var value = object[key];
          if (value && value.toBSON) {
            if (typeof value.toBSON !== "function")
              throw new error_1.BSONTypeError("toBSON is not a function");
            value = value.toBSON();
          }
          var type = typeof value;
          if (typeof key === "string" && !ignoreKeys.has(key)) {
            if (key.match(regexp) != null) {
              throw Error("key " + key + " must not contain null bytes");
            }
            if (checkKeys) {
              if (key[0] === "$") {
                throw Error("key " + key + " must not start with '$'");
              } else if (~key.indexOf(".")) {
                throw Error("key " + key + " must not contain '.'");
              }
            }
          }
          if (type === "string") {
            index = serializeString(buffer, key, value, index);
          } else if (type === "number") {
            index = serializeNumber(buffer, key, value, index);
          } else if (type === "bigint") {
            throw new error_1.BSONTypeError("Unsupported type BigInt, please use Decimal128");
          } else if (type === "boolean") {
            index = serializeBoolean(buffer, key, value, index);
          } else if (value instanceof Date || utils_1.isDate(value)) {
            index = serializeDate(buffer, key, value, index);
          } else if (value === void 0) {
            if (ignoreUndefined === false)
              index = serializeNull(buffer, key, value, index);
          } else if (value === null) {
            index = serializeNull(buffer, key, value, index);
          } else if (value["_bsontype"] === "ObjectId" || value["_bsontype"] === "ObjectID") {
            index = serializeObjectId(buffer, key, value, index);
          } else if (utils_1.isUint8Array(value)) {
            index = serializeBuffer(buffer, key, value, index);
          } else if (value instanceof RegExp || utils_1.isRegExp(value)) {
            index = serializeRegExp(buffer, key, value, index);
          } else if (type === "object" && value["_bsontype"] == null) {
            index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
          } else if (type === "object" && value["_bsontype"] === "Decimal128") {
            index = serializeDecimal128(buffer, key, value, index);
          } else if (value["_bsontype"] === "Long" || value["_bsontype"] === "Timestamp") {
            index = serializeLong(buffer, key, value, index);
          } else if (value["_bsontype"] === "Double") {
            index = serializeDouble(buffer, key, value, index);
          } else if (value["_bsontype"] === "Code") {
            index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
          } else if (typeof value === "function" && serializeFunctions) {
            index = serializeFunction(buffer, key, value, index, checkKeys, depth, serializeFunctions);
          } else if (value["_bsontype"] === "Binary") {
            index = serializeBinary(buffer, key, value, index);
          } else if (value["_bsontype"] === "Symbol") {
            index = serializeSymbol(buffer, key, value, index);
          } else if (value["_bsontype"] === "DBRef") {
            index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions);
          } else if (value["_bsontype"] === "BSONRegExp") {
            index = serializeBSONRegExp(buffer, key, value, index);
          } else if (value["_bsontype"] === "Int32") {
            index = serializeInt32(buffer, key, value, index);
          } else if (value["_bsontype"] === "MinKey" || value["_bsontype"] === "MaxKey") {
            index = serializeMinMax(buffer, key, value, index);
          } else if (typeof value["_bsontype"] !== "undefined") {
            throw new error_1.BSONTypeError("Unrecognized or invalid _bsontype: " + value["_bsontype"]);
          }
        }
      }
      path.pop();
      buffer[index++] = 0;
      var size = index - startingIndex;
      buffer[startingIndex++] = size & 255;
      buffer[startingIndex++] = size >> 8 & 255;
      buffer[startingIndex++] = size >> 16 & 255;
      buffer[startingIndex++] = size >> 24 & 255;
      return index;
    }
    exports2.serializeInto = serializeInto;
  }
});

// node_modules/bson/lib/bson.js
var require_bson = __commonJS({
  "node_modules/bson/lib/bson.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BSONRegExp = exports2.MaxKey = exports2.MinKey = exports2.Int32 = exports2.Double = exports2.Timestamp = exports2.Long = exports2.UUID = exports2.ObjectId = exports2.Binary = exports2.DBRef = exports2.BSONSymbol = exports2.Map = exports2.Code = exports2.LongWithoutOverridesClass = exports2.EJSON = exports2.BSON_INT64_MIN = exports2.BSON_INT64_MAX = exports2.BSON_INT32_MIN = exports2.BSON_INT32_MAX = exports2.BSON_DATA_UNDEFINED = exports2.BSON_DATA_TIMESTAMP = exports2.BSON_DATA_SYMBOL = exports2.BSON_DATA_STRING = exports2.BSON_DATA_REGEXP = exports2.BSON_DATA_OID = exports2.BSON_DATA_OBJECT = exports2.BSON_DATA_NUMBER = exports2.BSON_DATA_NULL = exports2.BSON_DATA_MIN_KEY = exports2.BSON_DATA_MAX_KEY = exports2.BSON_DATA_LONG = exports2.BSON_DATA_INT = exports2.BSON_DATA_DECIMAL128 = exports2.BSON_DATA_DBPOINTER = exports2.BSON_DATA_DATE = exports2.BSON_DATA_CODE_W_SCOPE = exports2.BSON_DATA_CODE = exports2.BSON_DATA_BOOLEAN = exports2.BSON_DATA_BINARY = exports2.BSON_DATA_ARRAY = exports2.BSON_BINARY_SUBTYPE_COLUMN = exports2.BSON_BINARY_SUBTYPE_ENCRYPTED = exports2.BSON_BINARY_SUBTYPE_UUID_NEW = exports2.BSON_BINARY_SUBTYPE_UUID = exports2.BSON_BINARY_SUBTYPE_USER_DEFINED = exports2.BSON_BINARY_SUBTYPE_MD5 = exports2.BSON_BINARY_SUBTYPE_FUNCTION = exports2.BSON_BINARY_SUBTYPE_DEFAULT = exports2.BSON_BINARY_SUBTYPE_BYTE_ARRAY = void 0;
    exports2.deserializeStream = exports2.calculateObjectSize = exports2.deserialize = exports2.serializeWithBufferAndIndex = exports2.serialize = exports2.setInternalBufferSize = exports2.BSONTypeError = exports2.BSONError = exports2.ObjectID = exports2.Decimal128 = void 0;
    var buffer_1 = require("buffer");
    var binary_1 = require_binary();
    Object.defineProperty(exports2, "Binary", { enumerable: true, get: function() {
      return binary_1.Binary;
    } });
    var code_1 = require_code();
    Object.defineProperty(exports2, "Code", { enumerable: true, get: function() {
      return code_1.Code;
    } });
    var db_ref_1 = require_db_ref();
    Object.defineProperty(exports2, "DBRef", { enumerable: true, get: function() {
      return db_ref_1.DBRef;
    } });
    var decimal128_1 = require_decimal128();
    Object.defineProperty(exports2, "Decimal128", { enumerable: true, get: function() {
      return decimal128_1.Decimal128;
    } });
    var double_1 = require_double();
    Object.defineProperty(exports2, "Double", { enumerable: true, get: function() {
      return double_1.Double;
    } });
    var ensure_buffer_1 = require_ensure_buffer();
    var extended_json_1 = require_extended_json();
    var int_32_1 = require_int_32();
    Object.defineProperty(exports2, "Int32", { enumerable: true, get: function() {
      return int_32_1.Int32;
    } });
    var long_1 = require_long();
    Object.defineProperty(exports2, "Long", { enumerable: true, get: function() {
      return long_1.Long;
    } });
    var map_1 = require_map();
    Object.defineProperty(exports2, "Map", { enumerable: true, get: function() {
      return map_1.Map;
    } });
    var max_key_1 = require_max_key();
    Object.defineProperty(exports2, "MaxKey", { enumerable: true, get: function() {
      return max_key_1.MaxKey;
    } });
    var min_key_1 = require_min_key();
    Object.defineProperty(exports2, "MinKey", { enumerable: true, get: function() {
      return min_key_1.MinKey;
    } });
    var objectid_1 = require_objectid();
    Object.defineProperty(exports2, "ObjectId", { enumerable: true, get: function() {
      return objectid_1.ObjectId;
    } });
    Object.defineProperty(exports2, "ObjectID", { enumerable: true, get: function() {
      return objectid_1.ObjectId;
    } });
    var error_1 = require_error();
    var calculate_size_1 = require_calculate_size();
    var deserializer_1 = require_deserializer();
    var serializer_1 = require_serializer();
    var regexp_1 = require_regexp();
    Object.defineProperty(exports2, "BSONRegExp", { enumerable: true, get: function() {
      return regexp_1.BSONRegExp;
    } });
    var symbol_1 = require_symbol();
    Object.defineProperty(exports2, "BSONSymbol", { enumerable: true, get: function() {
      return symbol_1.BSONSymbol;
    } });
    var timestamp_1 = require_timestamp();
    Object.defineProperty(exports2, "Timestamp", { enumerable: true, get: function() {
      return timestamp_1.Timestamp;
    } });
    var uuid_1 = require_uuid();
    Object.defineProperty(exports2, "UUID", { enumerable: true, get: function() {
      return uuid_1.UUID;
    } });
    var constants_1 = require_constants2();
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_BYTE_ARRAY", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_BYTE_ARRAY;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_DEFAULT", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_DEFAULT;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_FUNCTION", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_FUNCTION;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_MD5", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_MD5;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_USER_DEFINED", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_USER_DEFINED;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_UUID", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_UUID;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_UUID_NEW", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_UUID_NEW;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_ENCRYPTED", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_ENCRYPTED;
    } });
    Object.defineProperty(exports2, "BSON_BINARY_SUBTYPE_COLUMN", { enumerable: true, get: function() {
      return constants_1.BSON_BINARY_SUBTYPE_COLUMN;
    } });
    Object.defineProperty(exports2, "BSON_DATA_ARRAY", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_ARRAY;
    } });
    Object.defineProperty(exports2, "BSON_DATA_BINARY", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_BINARY;
    } });
    Object.defineProperty(exports2, "BSON_DATA_BOOLEAN", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_BOOLEAN;
    } });
    Object.defineProperty(exports2, "BSON_DATA_CODE", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_CODE;
    } });
    Object.defineProperty(exports2, "BSON_DATA_CODE_W_SCOPE", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_CODE_W_SCOPE;
    } });
    Object.defineProperty(exports2, "BSON_DATA_DATE", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_DATE;
    } });
    Object.defineProperty(exports2, "BSON_DATA_DBPOINTER", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_DBPOINTER;
    } });
    Object.defineProperty(exports2, "BSON_DATA_DECIMAL128", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_DECIMAL128;
    } });
    Object.defineProperty(exports2, "BSON_DATA_INT", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_INT;
    } });
    Object.defineProperty(exports2, "BSON_DATA_LONG", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_LONG;
    } });
    Object.defineProperty(exports2, "BSON_DATA_MAX_KEY", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_MAX_KEY;
    } });
    Object.defineProperty(exports2, "BSON_DATA_MIN_KEY", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_MIN_KEY;
    } });
    Object.defineProperty(exports2, "BSON_DATA_NULL", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_NULL;
    } });
    Object.defineProperty(exports2, "BSON_DATA_NUMBER", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_NUMBER;
    } });
    Object.defineProperty(exports2, "BSON_DATA_OBJECT", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_OBJECT;
    } });
    Object.defineProperty(exports2, "BSON_DATA_OID", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_OID;
    } });
    Object.defineProperty(exports2, "BSON_DATA_REGEXP", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_REGEXP;
    } });
    Object.defineProperty(exports2, "BSON_DATA_STRING", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_STRING;
    } });
    Object.defineProperty(exports2, "BSON_DATA_SYMBOL", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_SYMBOL;
    } });
    Object.defineProperty(exports2, "BSON_DATA_TIMESTAMP", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_TIMESTAMP;
    } });
    Object.defineProperty(exports2, "BSON_DATA_UNDEFINED", { enumerable: true, get: function() {
      return constants_1.BSON_DATA_UNDEFINED;
    } });
    Object.defineProperty(exports2, "BSON_INT32_MAX", { enumerable: true, get: function() {
      return constants_1.BSON_INT32_MAX;
    } });
    Object.defineProperty(exports2, "BSON_INT32_MIN", { enumerable: true, get: function() {
      return constants_1.BSON_INT32_MIN;
    } });
    Object.defineProperty(exports2, "BSON_INT64_MAX", { enumerable: true, get: function() {
      return constants_1.BSON_INT64_MAX;
    } });
    Object.defineProperty(exports2, "BSON_INT64_MIN", { enumerable: true, get: function() {
      return constants_1.BSON_INT64_MIN;
    } });
    var extended_json_2 = require_extended_json();
    Object.defineProperty(exports2, "EJSON", { enumerable: true, get: function() {
      return extended_json_2.EJSON;
    } });
    var timestamp_2 = require_timestamp();
    Object.defineProperty(exports2, "LongWithoutOverridesClass", { enumerable: true, get: function() {
      return timestamp_2.LongWithoutOverridesClass;
    } });
    var error_2 = require_error();
    Object.defineProperty(exports2, "BSONError", { enumerable: true, get: function() {
      return error_2.BSONError;
    } });
    Object.defineProperty(exports2, "BSONTypeError", { enumerable: true, get: function() {
      return error_2.BSONTypeError;
    } });
    var MAXSIZE = 1024 * 1024 * 17;
    var buffer = buffer_1.Buffer.alloc(MAXSIZE);
    function setInternalBufferSize(size) {
      if (buffer.length < size) {
        buffer = buffer_1.Buffer.alloc(size);
      }
    }
    exports2.setInternalBufferSize = setInternalBufferSize;
    function serialize2(object, options) {
      if (options === void 0) {
        options = {};
      }
      var checkKeys = typeof options.checkKeys === "boolean" ? options.checkKeys : false;
      var serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
      var ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
      var minInternalBufferSize = typeof options.minInternalBufferSize === "number" ? options.minInternalBufferSize : MAXSIZE;
      if (buffer.length < minInternalBufferSize) {
        buffer = buffer_1.Buffer.alloc(minInternalBufferSize);
      }
      var serializationIndex = serializer_1.serializeInto(buffer, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined, []);
      var finishedBuffer = buffer_1.Buffer.alloc(serializationIndex);
      buffer.copy(finishedBuffer, 0, 0, finishedBuffer.length);
      return finishedBuffer;
    }
    exports2.serialize = serialize2;
    function serializeWithBufferAndIndex(object, finalBuffer, options) {
      if (options === void 0) {
        options = {};
      }
      var checkKeys = typeof options.checkKeys === "boolean" ? options.checkKeys : false;
      var serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
      var ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
      var startIndex = typeof options.index === "number" ? options.index : 0;
      var serializationIndex = serializer_1.serializeInto(buffer, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined);
      buffer.copy(finalBuffer, startIndex, 0, serializationIndex);
      return startIndex + serializationIndex - 1;
    }
    exports2.serializeWithBufferAndIndex = serializeWithBufferAndIndex;
    function deserialize2(buffer2, options) {
      if (options === void 0) {
        options = {};
      }
      return deserializer_1.deserialize(buffer2 instanceof buffer_1.Buffer ? buffer2 : ensure_buffer_1.ensureBuffer(buffer2), options);
    }
    exports2.deserialize = deserialize2;
    function calculateObjectSize(object, options) {
      if (options === void 0) {
        options = {};
      }
      options = options || {};
      var serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
      var ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
      return calculate_size_1.calculateObjectSize(object, serializeFunctions, ignoreUndefined);
    }
    exports2.calculateObjectSize = calculateObjectSize;
    function deserializeStream(data, startIndex, numberOfDocuments, documents, docStartIndex, options) {
      var internalOptions = Object.assign({ allowObjectSmallerThanBufferSize: true, index: 0 }, options);
      var bufferData = ensure_buffer_1.ensureBuffer(data);
      var index = startIndex;
      for (var i = 0; i < numberOfDocuments; i++) {
        var size = bufferData[index] | bufferData[index + 1] << 8 | bufferData[index + 2] << 16 | bufferData[index + 3] << 24;
        internalOptions.index = index;
        documents[docStartIndex + i] = deserializer_1.deserialize(bufferData, internalOptions);
        index = index + size;
      }
      return index;
    }
    exports2.deserializeStream = deserializeStream;
    var BSON2 = {
      Binary: binary_1.Binary,
      Code: code_1.Code,
      DBRef: db_ref_1.DBRef,
      Decimal128: decimal128_1.Decimal128,
      Double: double_1.Double,
      Int32: int_32_1.Int32,
      Long: long_1.Long,
      UUID: uuid_1.UUID,
      Map: map_1.Map,
      MaxKey: max_key_1.MaxKey,
      MinKey: min_key_1.MinKey,
      ObjectId: objectid_1.ObjectId,
      ObjectID: objectid_1.ObjectId,
      BSONRegExp: regexp_1.BSONRegExp,
      BSONSymbol: symbol_1.BSONSymbol,
      Timestamp: timestamp_1.Timestamp,
      EJSON: extended_json_1.EJSON,
      setInternalBufferSize,
      serialize: serialize2,
      serializeWithBufferAndIndex,
      deserialize: deserialize2,
      calculateObjectSize,
      deserializeStream,
      BSONError: error_1.BSONError,
      BSONTypeError: error_1.BSONTypeError
    };
    exports2.default = BSON2;
  }
});

// node_modules/ws/wrapper.mjs
var import_stream = __toModule(require_stream());
var import_receiver = __toModule(require_receiver());
var import_sender = __toModule(require_sender());
var import_websocket = __toModule(require_websocket());
var import_websocket_server = __toModule(require_websocket_server());

// src/websocket/ProxyServer.ts
var BSON = __toModule(require_bson());

// src/utils.ts
var uuid = () => {
  var _a2;
  return ((_a2 = globalThis == null ? void 0 : globalThis.crypto) == null ? void 0 : _a2.randomUUID) ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};

// src/websocket/ProxyServer.ts
var _a;
var Server = (_a = class {
  constructor() {
    this._clients = {};
  }
  _connect() {
    var _a2, _b;
    const Ctor = this.constructor;
    const socketMap = new Map();
    const resolves = {};
    const rejects = {};
    const handleConnection = (client) => {
      var _a3;
      const clientId = uuid();
      this._clients[clientId] = client;
      socketMap.set(client, clientId);
      const handleOpen = (e) => {
        e.target.addEventListener("message", handleMessage);
        e.target.addEventListener("error", handleError);
        e.target.addEventListener("close", handleClose);
      };
      const handleError = (e) => {
        console.error(e.error);
      };
      const handleClose = (e) => {
        var _a4;
        e.target.removeEventListener("message", handleMessage);
        e.target.removeEventListener("error", handleError);
        e.target.removeEventListener("close", handleClose);
        e.target.removeEventListener("open", handleOpen);
        delete this._clients[clientId];
        socketMap.delete(client);
        if (!e.wasClean) {
          (_a4 = this._handleLog) == null ? void 0 : _a4.call(this, { error: true, clientId, msg: `Error from 	[${clientId}]: WebSocket closed: ${e.code} - ${e.reason}` });
          console.error(`WebSocket closed: ${e.code} - ${e.reason}`);
        }
      };
      const handleMessage = async (e) => {
        var _a4, _b2, _c, _d, _e;
        const { target, data } = e;
        (_a4 = this._handleLog) == null ? void 0 : _a4.call(this, { clientId, msg: `Received from 	[${clientId}]: 	${"".padEnd(20, " ")}	${data.byteLength} bytes` });
        const { id, call: call2, args, value, error } = BSON.deserialize(data, { promoteBuffers: true });
        if (call2) {
          const r = { id };
          try {
            r.value = await this[call2](clientId, ...args);
          } catch (e2) {
            r.error = e2.message;
            (_b2 = this._handleLog) == null ? void 0 : _b2.call(this, { clientId, msg: `Err to 	[${clientId}]: 	${call2.padEnd(20, " ")}	${e2.message}` });
          }
          const data2 = BSON.serialize(r);
          (_c = this._handleLog) == null ? void 0 : _c.call(this, { clientId, msg: `Return to 	[${clientId}]: 	${call2.padEnd(20, " ")}	${data2.byteLength} bytes` });
          target.send(data2);
        } else {
          if (error)
            (_d = this._handleLog) == null ? void 0 : _d.call(this, { clientId, msg: `Err from 	[${clientId}]: 	${error}` });
          else
            (_e = resolves[id]) == null ? void 0 : _e.call(resolves, value);
          delete resolves[id];
          delete rejects[id];
        }
      };
      handleOpen({ target: client });
      (_a3 = this._handleLog) == null ? void 0 : _a3.call(this, { clientId, msg: `Connect from 	[${clientId}]` });
    };
    const call = (client, call2, ...args) => {
      return new Promise((resolve, reject) => {
        var _a3;
        const id = uuid();
        resolves[id] = (arg) => {
          clearTimeout($timeout);
          resolve(arg);
        };
        rejects[id] = reject;
        const data = BSON.serialize({ id, call: call2, args });
        const clientId = socketMap.get(client);
        (_a3 = this._handleLog) == null ? void 0 : _a3.call(this, { clientId, msg: `Send to 	[${clientId}]: 	${call2.padEnd(20, " ")}	${data.byteLength} bytes` });
        client.send(data);
        const $timeout = setTimeout(() => {
          var _a4;
          delete resolves[id];
          delete rejects[id];
          (_a4 = this._handleLog) == null ? void 0 : _a4.call(this, { clientId, error: true, msg: `Err Return to 	[${clientId}]: 	${call2.padEnd(20, " ")}	Timeout: ${Ctor.timeout}ms.` });
        }, Ctor.timeout);
      });
    };
    (_a2 = this._handleLog) == null ? void 0 : _a2.call(this, { clientId: "", msg: `Initializing server on ${Ctor.port}` });
    const server2 = new import_websocket_server.default({ port: Ctor.port });
    (_b = this._handleLog) == null ? void 0 : _b.call(this, { clientId: "", msg: `Server on ws://localhost:${Ctor.port}` });
    Ctor.fnNames.forEach((name) => this[name] = (client, ...args) => call(client, name, ...args));
    server2.addListener("connection", handleConnection);
    this._timestamp = Date.now();
  }
}, _a.fnNames = [], _a.timeout = 5e3, _a);
var ProxyServer_default = Server;

// src/BackendServer.ts
var BackendServer = class extends ProxyServer_default {
  constructor() {
    super(...arguments);
    this.secret = "JSPatch37";
  }
  getInfo(clientId, secret) {
    if (this.secret !== secret)
      return null;
    if (!this.liveShareServer)
      return null;
    const upTime = Date.now() - this.liveShareServer._timestamp;
    const users = Object.keys(this.liveShareServer._clients).map((id) => ({
      id,
      nickname: this.liveShareServer.nicknames[id],
      ping: this.liveShareServer.pings[id],
      timeOffset: this.liveShareServer.timeOffset[id]
    }));
    const rooms = Object.entries(this.liveShareServer.rooms).map(([id, room]) => ({
      id,
      clients: [...room.clients],
      owner: room.owner,
      project: Object.entries(room.project.items).map(([fileId, item]) => __spreadValues({
        id: fileId,
        path: item.path
      }, item.isFolder === true ? {} : __spreadValues({
        size: item.data.length,
        states: room.project.objectState[fileId] ? Object.keys(room.project.objectState[fileId]).length : 0
      }, room.getHistoryInfo(fileId)))),
      permission: room.permission
    }));
    return { upTime, users, rooms };
  }
  ping(clientId, timestamp) {
    return timestamp;
  }
};
BackendServer.port = 18011;

// src/Room.ts
var Room = class {
  constructor(owner, id, password, server2, permission, project, projectHash) {
    this.clients = new Set();
    this.permission = "read";
    this.objectStateTimestamp = Date.now();
    this.id = id;
    this.password = password;
    this.owner = owner;
    this.server = server2;
    this.permission = permission;
    this.project = project;
    this.projectHash = projectHash;
    const ownerTimeOffset = +this.server.timeOffset[owner];
    for (const fileId in this.project.history) {
      const history = this.project.history[fileId];
      history.forEach((e) => e.timestamp += ownerTimeOffset);
    }
    this.objectStateTimestamp = Date.now();
    this.clients.add(owner);
  }
  getInfo(clientId) {
    return {
      roomId: this.id,
      permission: this.permission,
      clients: Array.from(this.clients).map((id) => ({
        clientId: id,
        nickname: this.server.nicknames[id],
        ping: this.server.pings[id],
        isOwner: id === this.owner,
        selection: {},
        cursor: null
      })),
      ownerId: this.owner
    };
  }
  getPings() {
    const pings = {};
    for (const clientId of this.clients) {
      pings[clientId] = this.server.pings[clientId];
    }
    return pings;
  }
  pushEvents(events) {
    const merged = [];
    const unmerged = [];
    for (const event of events) {
      const { fileId } = event;
      if (!(fileId in this.project.history)) {
        this.project.history[fileId] = [event];
        merged.push(event);
      } else {
        const history = this.project.history[fileId];
        const eventsToMerge = events.filter((e) => e.fileId === fileId).sort((a, b) => a.timestamp - b.timestamp);
        if (!eventsToMerge.length)
          continue;
        if (history.length && history[history.length - 1].timestamp > eventsToMerge[0].timestamp) {
          unmerged.push(...eventsToMerge);
          continue;
        }
        merged.push(...eventsToMerge);
        history.push(...eventsToMerge);
      }
    }
    return { unmerged, merged };
  }
  getHistoryInfo(fileId) {
    const history = this.project.history[fileId];
    if (!history)
      return null;
    const { length } = history;
    if (!length)
      return { $: -1, length };
    const $ = history[length - 1].nextHistoryIndex;
    return { $, length };
  }
  transferOwnership(clientId, toClientId) {
    if (this.owner !== clientId)
      throw new Error(`Room is not owned by: ${clientId}`);
    if (!this.clients.has(clientId))
      throw new Error(`Room does not have client: ${clientId}`);
    this.owner = toClientId;
    return this.getInfo(clientId);
  }
  updateState(timestamp, state) {
    for (const fileId in state) {
      if (!this.project.objectState[fileId])
        this.project.objectState[fileId] = state[fileId];
      else
        Object.assign(this.project.objectState[fileId], state[fileId]);
    }
    this.objectStateTimestamp = timestamp;
  }
};

// src/CollaborationServer.ts
var _CollaborationServer = class extends ProxyServer_default {
  constructor() {
    super(...arguments);
    this.rooms = {};
    this.nicknames = {};
    this.pings = {};
    this.timeOffset = {};
    this._handleLog = (log) => {
      const username = this.nicknames[log.clientId];
      if (log.error)
        console.error(`[${username || "Server"}] 	${log.msg}`);
      else
        console.log(`[${username || "Server"}] 	${log.msg}`);
    };
    this.logout = (clientId) => {
      for (const roomId in this.rooms) {
        const room = this.rooms[roomId];
        if (room.clients.has(clientId))
          this.leaveRoom(clientId, roomId);
      }
      delete this.nicknames[clientId];
      delete this.pings[clientId];
      delete this.timeOffset[clientId];
      setImmediate(() => {
        var _a2;
        return (_a2 = this._clients[clientId]) == null ? void 0 : _a2.close();
      });
    };
    this.hearbeat = async (clientId) => {
      const now = Date.now();
      const $ping = this.ping(this._clients[clientId], now, this.getRoomInfoOfClient(clientId));
      let rejected = false;
      const onfulfilled = () => {
        if (rejected)
          return;
        const ping = Date.now() - now;
        this.pings[clientId] = ping;
        clearTimeout($reject);
        setTimeout(this.hearbeat, _CollaborationServer.timeout, clientId);
      };
      const onrejected = (reason) => {
        rejected = true;
        this.logout(clientId);
        console.error(reason);
      };
      const $reject = setTimeout(onrejected, _CollaborationServer.timeout, new Error(`Hearbeat timeout for ${clientId}: ${this.nicknames[clientId]}`));
      try {
        await $ping;
        return onfulfilled();
      } catch (reason) {
        return onrejected(reason);
      }
    };
    this.pullRoomState = (roomId, clientId) => {
      const room = this.rooms[roomId];
      if (!room) {
        console.error(`No room ID: ${roomId}`);
        return;
      }
      const socket = this._clients[clientId];
      if (!socket) {
        console.error(`No user ID: ${clientId}`);
        return;
      }
      this.roomStateChanged(socket, room.getInfo(clientId));
    };
  }
  whichRoom(clientId) {
    for (const roomId in this.rooms) {
      if (this.rooms[roomId].clients.has(clientId))
        return roomId;
    }
    return null;
  }
  getRoomInfoOfClient(clientId) {
    for (const roomId in this.rooms) {
      const room = this.rooms[roomId];
      if (room.clients.has(clientId)) {
        return room.getInfo(clientId);
      }
    }
    return null;
  }
  pingServer(clientId, timestamp) {
    return Date.now();
  }
  reportPing(clientId, ping) {
    this.pings[clientId] = ping;
    for (const roomId in this.rooms) {
      const room = this.rooms[roomId];
      if (room.clients.has(clientId))
        return room.getPings();
    }
    return {};
  }
  login(clientId, timestamp, nickname, username, password) {
    this.timeOffset[clientId] = Date.now() - timestamp;
    this.nicknames[clientId] = nickname;
    const socket = this._clients[clientId];
    const handleClose = () => {
      this.logout(clientId);
      socket.removeEventListener("close", handleClose);
    };
    socket.removeEventListener("close", handleClose);
    socket.addEventListener("close", handleClose);
    return clientId;
  }
  hostRoom(clientId, roomId, password, timestamp, permission, project, currentProjectHash) {
    if (this.rooms[roomId])
      throw Error("Room ID already exist.");
    const room = new Room(clientId, roomId, password, this, permission, project, currentProjectHash);
    this.rooms[room.id] = room;
    return { roomInfo: room.getInfo(clientId) };
  }
  leaveRoom(clientId, roomId) {
    const room = this.rooms[roomId];
    if (!room)
      return;
    if (!room.clients.has(clientId))
      return;
    if (room.owner === clientId) {
      if (room.clients.size >= 2) {
        this.transferOwnership(clientId, roomId, room.clients.values().next().value);
        room.clients.delete(clientId);
        room.clients.forEach((id) => {
          if (id === clientId)
            return;
          const socket = this._clients[id];
          if (socket)
            this.roomStateChanged(socket, room.getInfo(id));
        });
      } else {
        this.closeRoom(clientId, roomId);
      }
    } else {
      room.clients.delete(clientId);
      room.clients.forEach((id) => {
        if (id === clientId)
          return;
        const socket = this._clients[id];
        if (socket)
          this.roomStateChanged(socket, room.getInfo(id));
      });
    }
  }
  transferOwnership(clientId, roomId, toClientId) {
    const room = this.rooms[roomId];
    if (!room)
      throw Error(`No room ID: ${roomId}`);
    if (!room.clients.has(clientId))
      throw Error(`User not in room ID: ${roomId}`);
    const roomInfo = room.transferOwnership(clientId, toClientId);
    room.clients.forEach((id) => {
      const socket = this._clients[id];
      if (socket)
        this.roomStateChanged(socket, room.getInfo(id));
    });
    return roomInfo;
  }
  joinRoom(clientId, roomId, username, password, timestamp, currentProjectHash) {
    const room = this.rooms[roomId];
    if (!room)
      throw new Error(`No room ID: ${roomId}`);
    if (password !== room.password)
      throw new Error("Room password incorrect.");
    room.clients.add(clientId);
    const roomInfo = room.getInfo(clientId);
    room.clients.forEach((id) => {
      if (id === clientId)
        return;
      const socket = this._clients[id];
      if (socket)
        this.roomStateChanged(socket, room.getInfo(id));
    });
    const resp = { roomInfo, project: __spreadValues({}, room.project) };
    if (currentProjectHash && currentProjectHash === room.projectHash)
      delete resp.project.items;
    return resp;
  }
  closeRoom(clientId, roomId) {
    const room = this.rooms[roomId];
    if (!room)
      throw new Error(`No room ID: ${roomId}`);
    if (clientId !== room.owner)
      throw new Error(`Client is not the owner of the room ${roomId}`);
    room.clients.forEach((clientId2) => {
      const socket = this._clients[clientId2];
      if (socket)
        this.roomClosedByOwner(socket, roomId);
    });
    delete this.rooms[roomId];
  }
  async requestChanges(clientId, roomId, ...events) {
    const room = this.rooms[roomId];
    if (!room)
      throw new Error(`No room ID: ${roomId}`);
    if (room.permission !== "write")
      throw new Error(`Room ${roomId} doesn't have write permission`);
    const timeOffset = this.timeOffset[clientId];
    if (typeof timeOffset !== "number")
      throw new Error(`User ${clientId} doesn't have a timeOffset`);
    const username = this.nicknames[clientId];
    if (typeof username !== "string")
      throw new Error(`No Username for ${clientId}`);
    const localEvents = events.map((e) => __spreadProps(__spreadValues({}, e), { timestamp: e.timestamp + timeOffset }));
    const { merged, unmerged } = room.pushEvents(localEvents);
    const sendbackEvents = unmerged.map((e) => __spreadProps(__spreadValues({}, e), { timestamp: e.timestamp - timeOffset }));
    room.clients.forEach((id) => {
      if (id === clientId)
        return;
      const socket = this._clients[id];
      if (!socket)
        return;
      const offset = this.timeOffset[id];
      if (typeof offset !== "number")
        return;
      const userEvents = merged.map((e) => __spreadProps(__spreadValues({}, e), { timestamp: e.timestamp - offset }));
      this.changesFrom(socket, username, ...userEvents);
    });
    return sendbackEvents;
  }
  updateState(clientId, roomId, timestamp, state) {
    const room = this.rooms[roomId];
    if (!room)
      throw new Error(`No room ID: ${roomId}`);
    const timeOffset = this.timeOffset[clientId];
    if (typeof timeOffset !== "number")
      throw new Error(`User ${clientId} doesn't have a timeOffset`);
    const username = this.nicknames[clientId];
    if (typeof username !== "string")
      throw new Error(`No Username for ${clientId}`);
    const t = timestamp + timeOffset;
    if (t < room.objectStateTimestamp)
      return;
    room.updateState(t, state);
    room.clients.forEach((id) => {
      if (id === clientId)
        return;
      const socket = this._clients[id];
      if (!socket)
        return;
      this.stateUpdateFrom(socket, username, state);
    });
  }
};
var CollaborationServer = _CollaborationServer;
CollaborationServer.port = 18010;
CollaborationServer.fnNames = ["ping", "roomClosedByOwner", "roomStateChanged", "changesFrom", "stateUpdateFrom"];
CollaborationServer.timeout = 5e3;

// src/index.ts
var server = new CollaborationServer();
server._connect();
global.server = server;
var backend = new BackendServer();
backend.liveShareServer = server;
backend._connect();
global.backend = backend;
//# sourceMappingURL=index.js.map
