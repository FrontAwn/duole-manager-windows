const fs = require("fs")
const path = require("path")
const moment = require("moment")
const robot = require("../../utils/robot.js")
const common = require("../../utils/common.js")
const request = require("../../utils/request.js")
const response = require("../../utils/response.js")
const database = require("../../utils/database.js")
const config = require("../../config.js")
const cache = require("./cache.js")



exports.readyStartRobot = async ()=>{
	await robot.clickWindowWhite()
}

exports.searchSkuRobot = async (product,type)=>{
	let sku = product["sku"]
	let productId = product["product_id"]
	await robot.clickSearchInput()
	await common.awaitTime(500)
	await robot.inputContent(sku)
	await common.awaitTime(500)
	await robot.clickEnter()
}

exports.cleanSkuRobot = async ()=>{
	await robot.clickSearchInput()
	await common.awaitTime(300)
	await robot.clickCleanButton()
}
 

exports.rollSoldRobot = async ()=>{
	await robot.rollWindow()
	await common.awaitTime(300)
	await robot.rollWindow()
}


var soldMap = {}
var currentDate = null
const setProductSoldRequestConfig = config["soldEnv"]["setProductSoldRequestConfig"]

exports.parseSoldHistory = async(product,sold,lastId)=>{
    if ( sold.length === 0 ) return false;

    let startDate = product["startDate"]

    let stopDate = product["stopDate"] 

    let startDateNum = parseInt( moment(startDate).format("YYYYMMDD") )

    let stopDateNum = parseInt( moment(stopDate).format("YYYYMMDD") )

    for ( let [idx,content] of sold.entries() ) {

        let {format,diff} = common.parseDateString(content["date"])

        let formatNum = parseInt( moment(format).format("YYYYMMDD") )

        if ( diff === 0 ) continue;

        if (currentDate === null) {
            currentDate = format
        }         
        let size = content["size"]

        if ( format !== currentDate ) {
            if ( lastId === null ) lastId = ""
            console.log("时间",currentDate)
            console.log("详情",soldMap)
            await request({
                url:setProductSoldRequestConfig["url"],
                data:{
                    product:JSON.stringify(product),
                    sold:JSON.stringify(soldMap),
                    lastId,
                    createAt:currentDate,
                }
            })
            if ( stopDateNum > formatNum ) {
                currentDate = null
                soldMap = {}
                return false
            }
            currentDate = format
            soldMap = {}
        }

        if ( !soldMap[size+''] ) {
            soldMap[size+''] = 1
        } else {
            soldMap[size+''] += 1
        } 

    }

    return true

}

exports.getParseSignFunction = ()=>{
    return new Promise((res,rej)=>{
        (function(n) {
            function e(i) {
                if (t[i]) return t[i].exports;
                var o = t[i] = {
                    i:i,
                    l:!1,
                    exports:{}
                };
                return n[i].call(o.exports, o, o.exports, e), o.l = !0, o.exports;
            }
            var t = {};
            e.m = n, e.c = t, e.i = function(n) {
                return n;
            }, e.d = function(n, t, i) {
                e.o(n, t) || Object.defineProperty(n, t, {
                    configurable:!1,
                    enumerable:!0,
                    get:i
                });
            }, e.n = function(n) {
                var t = n && n.__esModule ? function() {
                    return n.default;
                } :function() {
                    return n;
                };
                return e.d(t, "a", t), t;
            }, e.o = function(n, e) {
                return Object.prototype.hasOwnProperty.call(n, e);
            }, e.p = "/mdu/", e(e.s = 541);
        })({
            0:function(n, e) {},
            1:function(n, e) {},
            10:function(n, e) {},
            100:function(n, e, t) {},
            101:function(n, e) {},
            102:function(n, e, t) {},
            103:function(n, e, t) {},
            104:function(n, e, t) {},
            105:function(n, e, t) {
                var i = t(1), o = t(74).set, r = i.MutationObserver || i.WebKitMutationObserver, a = i.process, s = i.Promise, l = "process" == t(23)(a);
                n.exports = function() {
                    var n, e, t, c = function() {
                        var i, o;
                        for (l && (i = a.domain) && i.exit(); n; ) {
                            o = n.fn, n = n.next;
                            try {
                                o();
                            } catch (i) {
                                throw n ? t() :e = void 0, i;
                            }
                        }
                        e = void 0, i && i.enter();
                    };
                    if (l) t = function() {
                        a.nextTick(c);
                    }; else if (!r || i.navigator && i.navigator.standalone) if (s && s.resolve) {
                        var d = s.resolve(void 0);
                        t = function() {
                            d.then(c);
                        };
                    } else t = function() {
                        o.call(i, c);
                    }; else {
                        var A = !0, p = document.createTextNode("");
                        new r(c).observe(p, {
                            characterData:!0
                        }), t = function() {
                            p.data = A = !A;
                        };
                    }
                    return function(i) {
                        var o = {
                            fn:i,
                            next:void 0
                        };
                        e && (e.next = o), n || (n = o, t()), e = o;
                    };
                };
            },
            106:function(n, e, t) {
                var i = t(13);
                n.exports = function(n, e, t) {
                    for (var o in e) t && n[o] ? n[o] = e[o] :i(n, o, e[o]);
                    return n;
                };
            },
            107:function(n, e, t) {
                "use strict";
                var i = t(1), o = t(0), r = t(22), a = t(4), s = t(8)("species");
                n.exports = function(n) {
                    var e = "function" == typeof o[n] ? o[n] :i[n];
                    a && e && !e[s] && r.f(e, s, {
                        configurable:!0,
                        get:function() {
                            return this;
                        }
                    });
                };
            },
            108:function(n, e, t) {
                var i = t(1), o = i.navigator;
                n.exports = o && o.userAgent || "";
            },
            109:function(n, e, t) {
                var i = t(70), o = t(8)("iterator"), r = t(42);
                n.exports = t(0).getIteratorMethod = function(n) {
                    if (void 0 != n) return n[o] || n["@@iterator"] || r[i(n)];
                };
            },
            11:function(n, e) {
                n.exports = function(n, e, t, i) {
                    var o, r = n = n || {}, a = typeof n.default;
                    "object" !== a && "function" !== a || (o = n, r = n.default);
                    var s = "function" == typeof r ? r.options :r;
                    if (e && (s.render = e.render, s.staticRenderFns = e.staticRenderFns), t && (s._scopeId = t), 
                    i) {
                        var l = Object.create(s.computed || null);
                        Object.keys(i).forEach(function(n) {
                            var e = i[n];
                            l[n] = function() {
                                return e;
                            };
                        }), s.computed = l;
                    }
                    return {
                        esModule:o,
                        exports:r,
                        options:s
                    };
                };
            },
            110:function(n, e, t) {},
            111:function(n, e, t) {},
            112:function(n, e, t) {},
            113:function(n, e) {},
            117:function(n, e) {},
            118:function(n, e) {},
            12:function(n, e) {
                function t(n, e) {
                    for (var t = 0; t < n.length; t++) {
                        var i = n[t], o = d[i.id];
                        if (o) {
                            o.refs++;
                            for (var r = 0; r < o.parts.length; r++) o.parts[r](i.parts[r]);
                            for (;r < i.parts.length; r++) o.parts.push(s(i.parts[r], e));
                        } else {
                            for (var a = [], r = 0; r < i.parts.length; r++) a.push(s(i.parts[r], e));
                            d[i.id] = {
                                id:i.id,
                                refs:1,
                                parts:a
                            };
                        }
                    }
                }
                function i(n) {
                    for (var e = [], t = {}, i = 0; i < n.length; i++) {
                        var o = n[i], r = o[0], a = o[1], s = o[2], l = o[3], c = {
                            css:a,
                            media:s,
                            sourceMap:l
                        };
                        t[r] ? t[r].parts.push(c) :e.push(t[r] = {
                            id:r,
                            parts:[ c ]
                        });
                    }
                    return e;
                }
                var d = {}, A = function(n) {
                    var e;
                    return function() {
                        return void 0 === e && (e = n.apply(this, arguments)), e;
                    };
                }, p = A(function() {});
                n.exports = function(n, e) {
                    if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document) throw new Error("The style-loader cannot be used in a non-browser environment");
                    e = e || {}, void 0 === e.singleton && (e.singleton = p()), void 0 === e.insertAt && (e.insertAt = "bottom");
                    var o = i(n);
                    return t(o, e), function(n) {
                        for (var r = [], a = 0; a < o.length; a++) {
                            var s = o[a], l = d[s.id];
                            l.refs--, r.push(l);
                        }
                        if (n) {
                            t(i(n), e);
                        }
                        for (var a = 0; a < r.length; a++) {
                            var l = r[a];
                            if (0 === l.refs) {
                                for (var c = 0; c < l.parts.length; c++) l.parts[c]();
                                delete d[l.id];
                            }
                        }
                    };
                };
            },
            13:function(n, e, t) {},
            14:function(n, e) {},
            15:function(n, e, t) {},
            157:function(n, e) {},
            158:function(n, e, t) {},
            159:function(n, e, t) {},
            16:function(n, e, t) {
                var i = t(19);
                n.exports = function(n) {
                    return Object(i(n));
                };
            },
            160:function(n, e, t) {},
            167:function(n, e, t) {},
            170:function(n, e, t) {},
            18:function(n, e, t) {},
            19:function(n, e) {
                n.exports = function(n) {
                    if (void 0 == n) throw TypeError("Can't call method on  " + n);
                    return n;
                };
            },
            20:function(n, e) {},
            21:function(n, e, t) {
                var i = t(48), o = t(35);
                n.exports = Object.keys || function(n) {
                    return i(n, o);
                };
            },
            22:function(n, e, t) {},
            23:function(n, e) {},
            24:function(n, e) {},
            25:function(n, e, t) {},
            26:function(n, e, t) {},
            27:function(n, e, t) {},
            28:function(n, e) {},
            29:function(n, e, t) {
                var i = t(36)("keys"), o = t(34);
                n.exports = function(n) {
                    return i[n] || (i[n] = o(n));
                };
            },
            3:function(n, e) {
                n.exports = function(n) {};
            },
            30:function(n, e, t) {},
            31:function(n, e) {
                var t = {
                    utf8:{
                        stringToBytes:function(n) {
                            return t.bin.stringToBytes(unescape(encodeURIComponent(n)));
                        },
                        bytesToString:function(n) {
                            return decodeURIComponent(escape(t.bin.bytesToString(n)));
                        }
                    },
                    bin:{
                        stringToBytes:function(n) {
                            for (var e = [], t = 0; t < n.length; t++) e.push(255 & n.charCodeAt(t));
                            return e;
                        },
                        bytesToString:function(n) {
                            for (var e = [], t = 0; t < n.length; t++) e.push(String.fromCharCode(n[t]));
                            return e.join("");
                        }
                    }
                };
                n.exports = t;
            },
            32:function(n, e) {},
            322:function(n, e) {},
            323:function(n, e) {},
            325:function(n, e, t) {},
            326:function(n, e) {},
            327:function(n, e) {},
            328:function(n, e) {},
            329:function(n, e) {},
            33:function(n, e) {
                n.exports = function(n, e) {
                    return {
                        enumerable:!(1 & n),
                        configurable:!(2 & n),
                        writable:!(4 & n),
                        value:e
                    };
                };
            },
            330:function(n, e) {},
            331:function(n, e) {},
            332:function(n, e) {},
            333:function(n, e) {},
            334:function(n, e) {},
            335:function(n, e) {},
            336:function(n, e) {},
            337:function(n, e) {},
            338:function(n, e) {},
            339:function(n, e) {},
            34:function(n, e) {
                var t = 0, i = Math.random();
                n.exports = function(n) {
                    return "Symbol(".concat(void 0 === n ? "" :n, ")_", (++t + i).toString(36));
                };
            },
            340:function(n, e) {},
            341:function(n, e) {},
            35:function(n, e) {},
            36:function(n, e, t) {
                var i = t(0), o = t(1), r = o["__core-js_shared__"] || (o["__core-js_shared__"] = {});
                (n.exports = function(n, e) {
                    return r[n] || (r[n] = void 0 !== e ? e :{});
                })("versions", []).push({
                    version:i.version,
                    mode:t(28) ? "pure" :"global",
                    copyright:"© 2018 Denis Pushkarev (zloirock.ru)"
                });
            },
            360:function(n, e, t) {},
            37:function(n, e, t) {},
            372:function(n, e, t) {
                t(717);
                var i = t(11)(t(500), t(681), null, null);
                n.exports = i.exports;
            },
            38:function(n, e, t) {},
            39:function(n, e, t) {
                "use strict";
                function i(n) {
                    return n && n.__esModule ? n :{
                        "default":n
                    };
                }
                function o(n) {
                    var e = "";
                    return (0, a.default)(n).sort().forEach(function(t) {
                        e += t + n[t].toString();
                    }), e += "048a9c4943398714b356a696503d2d36", (0, l.default)(e);
                }
                Object.defineProperty(e, "__esModule", {
                    value:!0
                });
                var r = t(59), a = i(r), s = t(58), l = i(s);
                // window.getSign = o;
                e.default = o;
                res(o)
            },
            4:function(n, e, t) {},
            40:function(n, e, t) {},
            41:function(n, e, t) {},
            42:function(n, e) {},
            44:function(n, e) {},
            45:function(n, e) {},
            46:function(n, e, t) {},
            47:function(n, e, t) {},
            48:function(n, e, t) {},
            49:function(n, e, t) {},
            5:function(n, e) {},
            50:function(n, e, t) {},
            500:function(n, e, t) {
                "use strict";
                function i(n) {
                    return n && n.__esModule ? n :{
                        "default":n
                    };
                }
                var p = t(58), u = (i(p), t(39)), B = t(659);
            },
            504:function(n, e, t) {},
            51:function(n, e, t) {},
            52:function(n, e, t) {},
            53:function(n, e, t) {},
            54:function(n, e, t) {},
            541:function(n, e, t) {
                "use strict";
                function i(n) {
                    return n && n.__esModule ? n :{
                        "default":n
                    };
                }
                var o = t(27), r = i(o), a = t(15), s = i(a), l = t(55), c = i(l), d = t(372), A = i(d), p = t(158), u = i(p), h = t(360), f = i(h);
            },
            55:function(n, e, t) {},
            56:function(n, e, t) {
                var i = t(6), o = t(0), r = t(3);
                n.exports = function(n, e) {
                    var t = (o.Object || {})[n] || Object[n], a = {};
                    a[n] = e(t), i(i.S + i.F * r(function() {
                        t(1);
                    }), "Object", a);
                };
            },
            57:function(n, e) {},
            579:function(n, e, t) {},
            58:function(n, e, t) {
                !function() {
                    var e = t(62), i = t(31).utf8, o = t(57), r = t(31).bin, a = function(n, t) {
                        //   console.log('n' + n)
                        //   console.log('t' + t)
                        n.constructor == String ? n = t && "binary" === t.encoding ? r.stringToBytes(n) :i.stringToBytes(n) :o(n) ? n = Array.prototype.slice.call(n, 0) :Array.isArray(n) || (n = n.toString());
                        for (var s = e.bytesToWords(n), l = 8 * n.length, c = 1732584193, d = -271733879, A = -1732584194, p = 271733878, u = 0; u < s.length; u++) s[u] = 16711935 & (s[u] << 8 | s[u] >>> 24) | 4278255360 & (s[u] << 24 | s[u] >>> 8);
                        s[l >>> 5] |= 128 << l % 32, s[14 + (l + 64 >>> 9 << 4)] = l;
                        for (var h = a._ff, f = a._gg, g = a._hh, m = a._ii, u = 0; u < s.length; u += 16) {
                            var C = c, v = d, b = A, B = p;
                            c = h(c, d, A, p, s[u + 0], 7, -680876936), p = h(p, c, d, A, s[u + 1], 12, -389564586), 
                            A = h(A, p, c, d, s[u + 2], 17, 606105819), d = h(d, A, p, c, s[u + 3], 22, -1044525330), 
                            c = h(c, d, A, p, s[u + 4], 7, -176418897), p = h(p, c, d, A, s[u + 5], 12, 1200080426), 
                            A = h(A, p, c, d, s[u + 6], 17, -1473231341), d = h(d, A, p, c, s[u + 7], 22, -45705983), 
                            c = h(c, d, A, p, s[u + 8], 7, 1770035416), p = h(p, c, d, A, s[u + 9], 12, -1958414417), 
                            A = h(A, p, c, d, s[u + 10], 17, -42063), d = h(d, A, p, c, s[u + 11], 22, -1990404162), 
                            c = h(c, d, A, p, s[u + 12], 7, 1804603682), p = h(p, c, d, A, s[u + 13], 12, -40341101), 
                            A = h(A, p, c, d, s[u + 14], 17, -1502002290), d = h(d, A, p, c, s[u + 15], 22, 1236535329), 
                            c = f(c, d, A, p, s[u + 1], 5, -165796510), p = f(p, c, d, A, s[u + 6], 9, -1069501632), 
                            A = f(A, p, c, d, s[u + 11], 14, 643717713), d = f(d, A, p, c, s[u + 0], 20, -373897302), 
                            c = f(c, d, A, p, s[u + 5], 5, -701558691), p = f(p, c, d, A, s[u + 10], 9, 38016083), 
                            A = f(A, p, c, d, s[u + 15], 14, -660478335), d = f(d, A, p, c, s[u + 4], 20, -405537848), 
                            c = f(c, d, A, p, s[u + 9], 5, 568446438), p = f(p, c, d, A, s[u + 14], 9, -1019803690), 
                            A = f(A, p, c, d, s[u + 3], 14, -187363961), d = f(d, A, p, c, s[u + 8], 20, 1163531501), 
                            c = f(c, d, A, p, s[u + 13], 5, -1444681467), p = f(p, c, d, A, s[u + 2], 9, -51403784), 
                            A = f(A, p, c, d, s[u + 7], 14, 1735328473), d = f(d, A, p, c, s[u + 12], 20, -1926607734), 
                            c = g(c, d, A, p, s[u + 5], 4, -378558), p = g(p, c, d, A, s[u + 8], 11, -2022574463), 
                            A = g(A, p, c, d, s[u + 11], 16, 1839030562), d = g(d, A, p, c, s[u + 14], 23, -35309556), 
                            c = g(c, d, A, p, s[u + 1], 4, -1530992060), p = g(p, c, d, A, s[u + 4], 11, 1272893353), 
                            A = g(A, p, c, d, s[u + 7], 16, -155497632), d = g(d, A, p, c, s[u + 10], 23, -1094730640), 
                            c = g(c, d, A, p, s[u + 13], 4, 681279174), p = g(p, c, d, A, s[u + 0], 11, -358537222), 
                            A = g(A, p, c, d, s[u + 3], 16, -722521979), d = g(d, A, p, c, s[u + 6], 23, 76029189), 
                            c = g(c, d, A, p, s[u + 9], 4, -640364487), p = g(p, c, d, A, s[u + 12], 11, -421815835), 
                            A = g(A, p, c, d, s[u + 15], 16, 530742520), d = g(d, A, p, c, s[u + 2], 23, -995338651), 
                            c = m(c, d, A, p, s[u + 0], 6, -198630844), p = m(p, c, d, A, s[u + 7], 10, 1126891415), 
                            A = m(A, p, c, d, s[u + 14], 15, -1416354905), d = m(d, A, p, c, s[u + 5], 21, -57434055), 
                            c = m(c, d, A, p, s[u + 12], 6, 1700485571), p = m(p, c, d, A, s[u + 3], 10, -1894986606), 
                            A = m(A, p, c, d, s[u + 10], 15, -1051523), d = m(d, A, p, c, s[u + 1], 21, -2054922799), 
                            c = m(c, d, A, p, s[u + 8], 6, 1873313359), p = m(p, c, d, A, s[u + 15], 10, -30611744), 
                            A = m(A, p, c, d, s[u + 6], 15, -1560198380), d = m(d, A, p, c, s[u + 13], 21, 1309151649), 
                            c = m(c, d, A, p, s[u + 4], 6, -145523070), p = m(p, c, d, A, s[u + 11], 10, -1120210379), 
                            A = m(A, p, c, d, s[u + 2], 15, 718787259), d = m(d, A, p, c, s[u + 9], 21, -343485551), 
                            c = c + C >>> 0, d = d + v >>> 0, A = A + b >>> 0, p = p + B >>> 0;
                        }
                        var res = e.endian([ c, d, A, p ]);
                        // console.log("res:" + res)
                        // console.log("001")
                        return res;
                    };
                    a._ff = function(n, e, t, i, o, r, a) {
                        var s = n + (e & t | ~e & i) + (o >>> 0) + a;
                        // console.log("002")
                        return (s << r | s >>> 32 - r) + e;
                    }, a._gg = function(n, e, t, i, o, r, a) {
                        var s = n + (e & i | t & ~i) + (o >>> 0) + a;
                        // console.log("003")
                        return (s << r | s >>> 32 - r) + e;
                    }, a._hh = function(n, e, t, i, o, r, a) {
                        var s = n + (e ^ t ^ i) + (o >>> 0) + a;
                        // console.log("004")
                        return (s << r | s >>> 32 - r) + e;
                    }, a._ii = function(n, e, t, i, o, r, a) {
                        var s = n + (t ^ (e | ~i)) + (o >>> 0) + a;
                        // console.log("005")
                        return (s << r | s >>> 32 - r) + e;
                    }, a._blocksize = 16, a._digestsize = 16, n.exports = function(n, t) {
                        if (void 0 === n || null === n) throw new Error("Illegal argument " + n);
                        var i = e.wordsToBytes(a(n, t));
                        var xxx = t && t.asBytes ? i :t && t.asString ? r.bytesToString(i) :e.bytesToHex(i);
                        // console.log('n:' + n)
                        // console.log("sign:" + xxx)
                        return xxx;
                    };
                }();
            },
            59:function(n, e, t) {
                n.exports = {
                    "default":t(60),
                    __esModule:!0
                };
            },
            595:function(n, e, t) {},
            6:function(n, e, t) {
                var i = t(1), o = t(0), r = t(25), a = t(13), s = t(14), l = function(n, e, t) {
                    var c, d, A, p = n & l.F, u = n & l.G, h = n & l.S, f = n & l.P, g = n & l.B, m = n & l.W, C = u ? o :o[e] || (o[e] = {}), v = C.prototype, b = u ? i :h ? i[e] :(i[e] || {}).prototype;
                    u && (t = e);
                    for (c in t) (d = !p && b && void 0 !== b[c]) && s(C, c) || (A = d ? b[c] :t[c], 
                    C[c] = u && "function" != typeof b[c] ? t[c] :g && d ? r(A, i) :m && b[c] == A ? function(n) {
                        var e = function(e, t, i) {
                            if (this instanceof n) {
                                switch (arguments.length) {
                                  case 0:
                                    return new n();

                                  case 1:
                                    return new n(e);

                                  case 2:
                                    return new n(e, t);
                                }
                                return new n(e, t, i);
                            }
                            return n.apply(this, arguments);
                        };
                        return e.prototype = n.prototype, e;
                    }(A) :f && "function" == typeof A ? r(Function.call, A) :A, f && ((C.virtual || (C.virtual = {}))[c] = A, 
                    n & l.R && v && !v[c] && a(v, c, A)));
                };
                l.F = 1, l.G = 2, l.S = 4, l.P = 8, l.B = 16, l.W = 32, l.U = 64, l.R = 128, n.exports = l;
            },
            60:function(n, e, t) {
                t(61), n.exports = t(0).Object.keys;
            },
            61:function(n, e, t) {
                var i = t(16), o = t(21);
                t(56)("keys", function() {
                    return function(n) {
                        return o(i(n));
                    };
                });
            },
            612:function(n, e) {},
            613:function(n, e) {},
            62:function(n, e) {
                !function() {
                    var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", t = {
                        rotl:function(n, e) {
                            return n << e | n >>> 32 - e;
                        },
                        rotr:function(n, e) {
                            return n << 32 - e | n >>> e;
                        },
                        endian:function(n) {
                            if (n.constructor == Number) return 16711935 & t.rotl(n, 8) | 4278255360 & t.rotl(n, 24);
                            for (var e = 0; e < n.length; e++) n[e] = t.endian(n[e]);
                            return n;
                        },
                        randomBytes:function(n) {
                            for (var e = []; n > 0; n--) e.push(Math.floor(256 * Math.random()));
                            return e;
                        },
                        bytesToWords:function(n) {
                            for (var e = [], t = 0, i = 0; t < n.length; t++, i += 8) e[i >>> 5] |= n[t] << 24 - i % 32;
                            return e;
                        },
                        wordsToBytes:function(n) {
                            for (var e = [], t = 0; t < 32 * n.length; t += 8) e.push(n[t >>> 5] >>> 24 - t % 32 & 255);
                            return e;
                        },
                        bytesToHex:function(n) {
                            for (var e = [], t = 0; t < n.length; t++) e.push((n[t] >>> 4).toString(16)), e.push((15 & n[t]).toString(16));
                            return e.join("");
                        },
                        hexToBytes:function(n) {
                            for (var e = [], t = 0; t < n.length; t += 2) e.push(parseInt(n.substr(t, 2), 16));
                            return e;
                        },
                        bytesToBase64:function(n) {
                            for (var t = [], i = 0; i < n.length; i += 3) for (var o = n[i] << 16 | n[i + 1] << 8 | n[i + 2], r = 0; r < 4; r++) 8 * i + 6 * r <= 8 * n.length ? t.push(e.charAt(o >>> 6 * (3 - r) & 63)) :t.push("=");
                            return t.join("");
                        },
                        base64ToBytes:function(n) {
                            n = n.replace(/[^A-Z0-9+\/]/gi, "");
                            for (var t = [], i = 0, o = 0; i < n.length; o = ++i % 4) 0 != o && t.push((e.indexOf(n.charAt(i - 1)) & Math.pow(2, -2 * o + 8) - 1) << 2 * o | e.indexOf(n.charAt(i)) >>> 6 - 2 * o);
                            return t;
                        }
                    };
                    n.exports = t;
                }();
            },
            63:function(n, e, t) {},
            64:function(n, e, t) {},
            65:function(n, e, t) {},
            659:function(n, e, t) {},
            681:function(n, e) {},
            717:function(n, e, t) {}
        });
    })
}


