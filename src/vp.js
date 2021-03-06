/**
 * vp.js
 * Copyright (c) 2014, V.A. Perez, All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

/*##### IMPORTANT this project is still in draft. #####*/

/**
 * You can change the namespace via __VPJSNS__, all core events will start with you defined namespace and not with 'vp'
 * @name __VPJSNS__
 * @type {?string}
 * @default vp
 * @global
 */
/**
 * You can define the bootstrap via __VPJSBOOTSTRAP__, this must be array of functions.
 * Each function will be called with 1 parameter, what is the vp.js core module
 * Important, the bootstrap must be defined before loading the library!
 * @example
 * var __VPJSBOOTSTRAP__ = [function (vp) {
 *     vp.set();
 * }];
 * @name __VPJSBOOTSTRAP__
 * @type {?Array}
 * @global
 */
/**
 * @param  {*} [root=this] Library root scope
 */
(function (root, ns, bootstrap) {
    'use strict';
    var VERSION = '0.0.1',
        GIT_VERSION = '',
        //minimize true, false, null
        TRUE = true,
        FALSE = false,
        NULL = null,
        async = root[ns],
        win = window,
        doc = win.document,
        VPconfig = {},
        /**
         * Utility module
         * @module $/v
         */
        V = (function () {
            var proArr = Array.prototype,
                proObj = Object.prototype,
                nForEach = proArr.forEach,
                nIndexOf = proArr.indexOf,
                nBind = Function.prototype.bind,
                nKeys = proObj.keys,
                nMap = proObj.map,
                toString = proObj.toString,
                slice = proArr.slice,
                v = {
                    /**
                    * Is a given value a object?
                    * @param  {*}       obj
                    * @param  {boolean} [literal=false] Check of object is a literal object
                    * @return {boolean}
                    * @method $/v.isObject
                    */
                    isObject: function (obj, literal) {
                        return Object(obj) === obj && (!literal || obj.constructor === Object);
                    },
                    /**
                    * Is a given value a regular expression?
                    * @param  {*} obj
                    * @return {boolean}
                    * @method $/v.isRegex
                    */
                    isRegex: function (obj) {
                        return obj && (obj.ignoreCase || obj.ignoreCase === FALSE) && obj.test && obj.exec;
                    },
                    /**
                     * Is given value undefined?
                     * @param  {*} obj
                     * @return {boolean}
                     * @method $/v.isUndefined
                     */
                    isUndefined: function (obj) {
                        return obj === void 0;
                    },
                    /**
                    * Is a given value a boolean?
                    * @param  {*} obj
                    * @return {boolean}
                    * @method $/v.isBool
                    */
                    isBool: function (obj) {
                        return obj === TRUE || obj === FALSE || toString.call(obj) === '[object Boolean]';
                    },
                    /**
                     * Is a given value null?
                     * @param  {*}  obj
                     * @return {boolean}
                     * @method $/v.isNull
                     */
                    isNull: function (obj) {
                        return obj === NULL;
                    },
                    /**
                    * Is a given value a DOM element?
                    * @param  {*} obj
                    * @return {boolean}
                    * @method $/v.isElement
                    */
                    isElement: function (obj) {
                        return !!(obj && obj.nodeType === 1);
                    },                    /**
                     * Will only call the given function once.
                     * After that it will return the result of this call
                     * @param  {Function} func
                     * @return {Function}
                     * @method $/v.once
                     */
                    once: function (func) {
                        var test = FALSE,
                            result;
                        return function () {
                            if (test) {
                                return result;
                            }
                            test = TRUE;
                            result = func.apply(this, arguments);
                            func = null;
                            return result;
                        };
                    },
                    /**
                     * Object.is shim
                     * @param  {*} obj1
                     * @param  {*} obj2
                     * @return {boolean}
                     * @method $/v.is
                     */
                    is: proObj.is || function (obj1, obj2) {
                        //Check 0 and -0
                        if (obj1 === 0 && obj2 === 0) {
                            return 1 / obj1 === 1 / obj2;
                        }
                        //if obj1 is not equal to himself like Number.NaN
                        if (obj1 !== obj1) {
                            return obj2 !== obj2;
                        }
                        //default
                        return obj1 === obj2;
                    },
                    /**
                     * Date.now shim
                     * @return {number} number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
                     * @method $/v.now
                     */
                    now: Date.now || function () {
                        return (+new Date());
                    }
                },
                /**
                 * Is given value an Array?
                 * @param  {*} obj
                 * @return {boolean}
                 * @method $/v.isArray
                 */
                isArray = v.isArray = proArr.isArray || function (obj) {
                    return toString.call(obj) === '[object Array]';
                },
                /**
                 * Shortcut for hasOwnProperty
                 * @param  {Object} obj
                 * @param  {String} key
                 * @return {Boolean}
                 * @method $/v.hasop
                 */
                hasop = v.hasop = function (obj, key) {
                    return obj.hasOwnProperty(key);
                },
                /**
                 * Is given value a Arguments object
                 * @param  {*} obj
                 * @return {boolean}
                 * @method $/v.isArguments
                 */
                isArguments = v.isArguments = (function () {
                    function test(obj) {
                        return toString.call(obj) === '[object Arguments]';
                    }
                    //test will not correct work in IE
                    if (test(arguments)) {
                        return test;
                    }
                    //fall back for IE;
                    return function (obj) {
                        return !!(obj && hasop(obj, 'callee'));
                    };
                }()),
                /**
                 * forEach shim, what will also work on Arguments and Objects
                 * @param  {Array|Arguments|Object} obj
                 * @param  {Function}               callback
                 * @param  {*}                      [thisArg]
                 * @method $/v.each
                 */
                each = v.each = function (obj, callback, thisArg) {
                    //null we can't interate that
                    if (obj === null || v.isUndefined(obj)) {
                        return;
                    }
                    //array with native support
                    if (nForEach && obj.forEach === nForEach) {
                        obj.forEach(callback, thisArg);
                    //Array and Arguments
                    } else if (isArray(obj) || isArguments(obj)) {
                        for (var i = 0, max = obj.length; i < max; i++) {
                            callback.call(thisArg, obj[i], i, obj);
                        }
                    //Objects
                    } else {
                        for (var x in obj) {
                            if (hasop(obj, x)) {
                                callback.call(thisArg, obj[x], x, obj);
                            }
                        }
                    }
                };
            /**
             * is given value a function
             * @param  {*} obj
             * @return {boolean}
             * @method $/v.isFunction
             */
            /**
             * is given value a string
             * @param  {*} obj
             * @return {boolean}
             * @method $/v.isString
             */
            /**
             * is given value a number
             * @param  {*} obj
             * @return {boolean}
             * @method $/v.isNumber
             */
            /**
             * is given value a Date object
             * @param  {*} obj
             * @return {boolean}
             * @method $/v.isDate
             */
            each(['Function', 'String', 'Number', 'Date'], function (is) {
                v['is' + is] = function (obj) {
                    return toString.call(obj) === '[object ' + is + ']';
                };
            });
            /**
             * Array.indexOf shim
             * @param  {Array}  arr             Array to search in
             * @param  {*}      needed          Element to search for
             * @param  {number} [fromIndex=0]   Index to start
             * @return {number} returns the first index at which a given element can be found in the array, or -1 if it is not present.
             * @method $/v.indexOf
             */
            v.indexOf = function (arr, needed, fromIndex) {
                var length;
                //first parameter must be a array
                if (!isArray(arr)) {
                    return -1;
                }
                //native Array.indexOf
                if (nIndexOf && arr.indexOf === nIndexOf) {
                    return arr.indexOf(needed, fromIndex);
                }
                //UInt32
                length = arr.length >>> 0;
                //from index must be a int, else default to 0
                fromIndex = +fromIndex || 0;
                //Infinity check
                if (Math.abs(fromIndex) === Infinity) {
                    fromIndex = 0;
                }
                //negative int
                if (fromIndex < 0) {
                    fromIndex += length;
                    if (fromIndex < 0) {
                        fromIndex = 0;
                    }
                }
                //start search
                for (;fromIndex < length; fromIndex++) {
                    if (this[fromIndex] === needed) {
                        return fromIndex;
                    }
                }
                //return -1 if not found
                return -1;
            };
            /**
            * Has the first parameter the needed value?
            * By a string and array it will search in the string for the needed value
            * By a number it will check of the first parameter is bigger or equal than the needed number
            * By a object it will check of the object has needed property
            * By everything else it will compare the 2 both parameters and if they are the same it will return true.
            * @example
            * V.has("test", "e"); //will return true
            * V.has([1], 1); //will return true
            * V.has({x:1}, "x"); //will return true
            * V.has(null, null); //will return true
            * V.has(10, 5); //will return true
            * @param  {*}       obj
            * @param  {*}       needed
            * @return {boolean}
            * @method $/v.has
            */
            v.has = function (obj, needed) {
                //Has the string needed string ?
                if (v.isString(obj)) {
                    return !!~obj.indexOf(needed);
                }
                //Has array needed element?
                if (v.isArray(obj)) {
                    return !!~v.indexOf(obj, needed);
                }
                //Has number the needed number
                if (v.isNumber(obj)) {
                    return obj >= needed;
                }
                //Has object needed property
                if (v.isObject(obj)) {
                    return v.hasop(obj, needed);
                }
                //if null, undefined if they are equal they
                return obj === needed;
            };
            /**
            * Convert anything to a Array.
            * @example
            * V.toArray("test") //will return ["t","e","s","t"]
            * V.toArray({a:1}) //will return [1]
            * V.toArray({a:1}, true) //will return ['a'], same as V.key
            * V.toArray(null) //will return [null]
            * @param  {*}        obj
            * @param  {boolean}   [keys=false] can be used by a object to return the keys instead of the values
            * @return {Array}
            * @method $/v.toArray
            */
            v.toArray = function (obj, keys) {
                var temp = [];
                //Arguments to Array
                if (isArguments(obj)) {
                    return slice.call(obj);
                }
                //String to Array
                if (v.isString(obj)) {
                    return obj.split('');
                }
                //Array to Array
                if (isArray(obj)) {
                    return slice.call(obj);
                }
                //Object to Array
                if (v.isObject(obj)) {
                    //if keys is true and Object.keys is supported use Object.keys
                    if (keys && nKeys) {
                        return nKeys(obj);
                    }
                    each(obj, function (value, key) {
                        temp.push(keys ? key : value);
                    });
                    return temp;
                }
                //Array :)
                return [obj];
            };
            /**
             * Memorize results of an expensive function
             * @param  {Function} func      function where from you want to memorize the result
             * @param  {Function} [hasher]  hasher function, default it will hash the parameters
             * @return {Function}
             * @method $/v.memoize
             */
            v.memoize = function (func, hasher) {
                var cache = {};
                //set default hasher
                hasher = hasher || function () {
                    return JSON.stringify(arguments);
                };
                //new function
                return function () {
                    var key = hasher.apply(this, arguments);
                    //if cached return cache
                    if (cache[key]) {
                        return cache[key];
                    }
                    //run function and cache result
                    cache[key] = func.apply(this, arguments);
                    return cache[key];
                };
            };
            /**
             * Parse a URI and return its components
             * returns the following components and only if they are in the given string
             * @example
             * {
             *     scheme: 'http',
             *     host: 'example.com',
             *     port: 80
             *     pass: 'password',
             *     user: 'username',
             *     origin: 'http://username:password@example.com:80',
             *     path: '/path/file.php',
             *     dir: '/path/',
             *     file: 'file.php',
             *     query: 'arg1=2&arg2=1',
             *     fragment: 'hashvalue'
             * }
             * @param  {string} str
             * @return {Object}
             * @method $/v.parseURI
             */
            v.parseURI = v.memoize(function (str) {
                var URI = {},
                    origin,
                    temp;
                //scheme, only file can have ///
                temp = /^([^:]+):\/\/[^\/]|(file):\/\/\/?/.exec(str);
                if (temp) {
                    origin += URI.scheme = (temp[1] || temp[2]).toLowerCase();
                }
                //file can't have, host, port, user or pass
                if (URI.scheme !== 'file') {
                    //[scheme]://(domain) or //(host) or host[:port]  or [user]:[pass]@(host)
                    temp = /^([^:]+:)?\/\/([^@]+@)?([^:\/]+)/.exec(str) || /^[^@\/]+@([^:\/]+)/.exec(str) || /^([:\/]+):[1-9][0-9]*/.exec(str);
                    if (temp) {
                        origin += URI.host = (temp[2] || temp[1]).toLowerCase();
                    }
                    //port
                    temp = /^(([^:]+:)?\/\/)?[^\/]+:([1-9][0-9]*)/.exec(str);
                    if (temp) {
                        URI.port = +temp[3];
                        origin += ':' + URI.port;
                    }
                    //user & pass
                    temp = /^(([^:]+:)?\/\/)?([^\/@]+)@/.exec(str);
                    if (temp) {
                        origin = temp[3] + '@' + origin;
                        temp = temp[3].split(':');
                        if (temp.length > 1) {
                            URI.pass = temp[1];
                        }
                        URI.user = temp[0];
                    }
                }
                //path
                if (origin) {
                    str = str.substr(origin.length);
                    URI.origin = origin;
                }
                //path, dir and file
                temp = /([^?#]+)/.exec(str);
                if (temp) {
                    URI.path = temp = temp[1];
                    temp = temp.split('/');
                    if (temp[temp.length - 1] !== '') {
                        URI.file = temp.pop();
                        temp.push('');
                    }
                    URI.dir = temp.join('/');
                }
                //query
                temp = /[^#?]*\?([^#]*)/.exec(str);
                if (temp) {
                    URI.query = temp[1];
                }
                //fragment
                temp = /#(.*)/.exec();
                if (temp) {
                    URI.fragment = temp[1];
                }
                return URI;
            });
            /**
             * Returns an array of a given object's own enumerable properties
             * @param  {Object} obj
             * @return {Array}
             * @method $/v.keys
             */
            v.keys = nKeys || function (obj) {
                if (!v.isObject(obj)) {
                    throw new TypeError(obj + ' is not an object');
                }
                return v.toArray(obj, true);
            };
            /**
             * Will merge all parameters based on the type of the first parameter.
             * If the first parameter is a Array then it will treat all other parameters as a Array by using V.toArray
             * If the first parameter is a Object it will extend this object with the other objects
             * All other types will be merge to 1 single string
             * IF the first parameter is a Object and the last parameter is a boolean it will do a deep merge of all the object objects,
             *     meaning that if a property contains a object from the first parameter it will also merge that
             * @example
             * merge({x:1}, {y:1}) //will result in {x:1, y:1}
             * merge([1], [2]) //will result in [1,2]
             * merge({x:{y:2}}, {x:{z:1}}, true)// will result in  {x:{y:2,z:1}}
             * @param   {Array|Object|*}        target
             * @param   {...*}                  items
             * @param   {boolean}               [deep=false]
             * @return  {Array|Object|string}
             * @method $/v.merge
             */
            v.merge = function () {
                var arg = v.toArray(arguments),
                    obj1 = arg.shift(),
                    deep = arg[arg.length - 1] === TRUE ? TRUE : FALSE;
                if (v.isObject(obj1) && deep) {
                    arg.pop();
                }
                //array
                if (isArray(obj1)) {
                    each(arg, function (arr) {
                        obj1 = obj1.concat(v.toArray(arr));
                    });
                    return obj1;
                }
                //Object
                if (v.isObject(obj1)) {
                    each(arg, function (obj) {
                        //check of parameter is a object, else change it to a empty object
                        if (!v.isObject(obj)) {
                            obj = {};
                        }
                        each(obj, function (value, key) {
                            //deep
                            if (deep && v.isObject(obj1[key])) {
                                v.merge(obj1[key], value, true);
                            } else {
                                obj1[key] = value;
                            }
                        });
                    });
                    return obj1;
                }
                //all other types
                arg.unshift(obj1);
                return arg.join('');
            };
            /**
             * Is a given value empty?
             * undefined, null, false, 0, "0", "", NaN and {} are empty values
             * @param  {*} obj
             * @return {boolean}
             * @method $/v.empty
             */
            v.empty = function (obj) {
                var str;
                //undefined, null, false, 0 and ''
                if (!obj) {
                    return TRUE;
                }
                //0 string
                if (obj === '0') {
                    return FALSE;
                }
                //Array
                if (isArray(obj)) {
                    return obj.length === 0;
                }
                //shouldn't happen but if someone used new [Type]
                str = '' + obj; //to string
                //new String and new Number
                if (v.isString(obj) || v.isNumber(obj)) {
                    return str === '' || str === '0';
                }
                //new Boolean()
                if (v.isBool(obj)) {
                    return str === 'false';
                }
                //object
                for (var x in obj) {
                    if (hasop(obj, x)) {
                        return FALSE;
                    }
                }
                return TRUE;
            };
            /**
             * Array.map shim, that also supports objects
             * @param  {Array|Object|*}     obj
             * @param  {Function} callback
             * @param  {*}   thisArg
             * @return {Array|Object}
             * @method $/v.map
             */
            v.map = function (obj, callback, thisArg) {
                var result = isArray(obj) ? [] : {};
                //use native map method if supported
                if (nMap && obj.map === nMap) {
                    return obj.map(callback, thisArg);
                }
                //if not a array or object, return a empty array
                if (!isArray(obj) || !v.isObject(obj)) {
                    return [];
                }
                each(obj, function (value, key) {
                    result[key] = callback.call(thisArg, value, key, obj);
                });
                //return result
                return result;
            };
            /**
             * Function.bind shim, will delegate to native Function.bind if supported
             * @param  {Function}   func        target function
             * @param  {*}          thisArg     'this' to bind
             * @param  {...*}       [params]    params that you want to bind
             * @return {Function}               bound function
             * @method $/v.bind
             */
            v.bind = function (func, thisArg) {
                var args, bound, fcon;
                //native bind
                if (nBind && func.bind === nBind) {
                    return nBind.apply(func, slice.call(arguments, 1));
                }
                //check of fist func is a function
                if (!v.isFunction(func)) {
                    throw new TypeError();
                }
                //arguments that we want to bind
                args = slice.call(arguments, 2);
                fcon = function () {};
                //bound function
                bound = function () {
                    var self = this instanceof fcon && thisArg ? this : thisArg;
                    return func.apply(self, args.concat(v.toArray(arguments)));
                };
                //bound constructor
                fcon.prototype = func.prototype;
                bound.prototype = new fcon();
                return bound;
            };
            return function () {
                return v;
            };
        }()),
        //Core V
        VPv = V(),
        /**
         * Events module
         * @module $/events
         */
        Events = (function () {
            var validSubscribe = /^!?(\*$|[a-z])([a-z0-9]*)(\.([a-z0-9]+|\*$))*(@[0-9]+)?$/,
                validPublish = /^[a-z]([a-z0-9]*)(\.[a-z0-9]+)*(@[0-9]+)?$/;
            return function () {
                var subscribers = {};
                return {
                    /**
                     * Publish a event
                     * @param  {string}     evnt                The event that you want to publish
                     * @param  {*}          [data]              Data that you want to send along with the event
                     * @param  {*}          [scope]             Event scope
                     * @param  {boolean}    [notAsync=false]    Events are default asynchronous, but in some cases yo don't want that
                     */
                    pub: function (evnt, data, scope, notAsync) {
                        var evntPart = '',
                            subs = [],
                            originEvent = evnt;
                        //is event valid
                        if (validPublish.test(evnt)) {
                            //subscriber with id
                            if (subscribers[evnt]) {
                                subs = subs.concat(subscribers[evnt]);
                            }
                            //remove event
                            evnt = evnt.split('@')[0];
                            //subscriber without id
                            if (evnt !== originEvent && subscribers[evnt]) {
                                subs = subs.concat(subscribers[evnt]);
                            }
                            //wild card
                            evnt = evnt.split('.');
                            evntPart = evnt[0];
                            for (var i = 1, max = evnt.length - 1; i < max; i++) {
                                evntPart += '.' + evnt[i];
                                if (subscribers[evntPart + '.*']) {
                                    subs = subs.concat(subscribers[evntPart]);
                                }
                            }
                            //all
                            if (subscribers['*']) {
                                subs = subs.concat(subscribers['*']);
                            }
                            //start publishing
                            VPv.each(subs, function (subscriber) {
                                if (!subscribers[1] || subscriber[1] === scope) {
                                    if (notAsync) {
                                        subscriber[0](data, originEvent);
                                    } else {
                                        setTimeout(function () {
                                            subscriber[0](data, originEvent);
                                        }, 5);
                                    }
                                }
                            });
                        }
                    },
                    /**
                     * Subscribe to a event
                     * valid subscribe events
                     *     'x' or 'somelongname' or 'a123' the first character of a event must be a-z, a event must only contain only small characters or numbers
                     *     'x.x' you can use a '.' to name space the event
                     *     'x.*' you can use a '*' to subscribe to all events in a name space
                     *     '*' subscribe to all events
                     * invalid subscribe events
                     *     '1a' the first character can't be a number
                     *     'a.' name space can't be empty
                     *     'a#$' a event can't have other characters than a-z or 0-9
                     * @param {string}     evnt       The event where you want to subscribe
                     * @param {Function}   subscriber The subscriber to the events
                     * @param {*}          [scope]    Scope can be used to only subscribe to events that are in that scope
                     * @param {*}          [thisArg]  The `this` scope  of the subscriber
                     */
                    sub: function (evnt, subscriber, scope, thisArg) {
                        var allEvnt = evnt.split('|'),
                            parseEvnt;
                        //loop though all events
                        for (var i = 0, max = allEvnt.length; i < max; i++) {
                            parseEvnt = allEvnt[i];
                            if (validSubscribe.test(allEvnt[i])) {
                                //TODO
                                if (parseEvnt.slice(0, 1) === '!') {
                                    parseEvnt = parseEvnt.slice(1);
                                }
                                //add subscriber list
                                if (!subscribers[parseEvnt]) {
                                    subscribers[parseEvnt] = [];
                                }
                                //add subscriber
                                subscribers[parseEvnt].push([
                                    //bind thisArg with subscriber
                                    VPv.bind(subscriber, VPv.merge({
                                        subscriber: subscriber
                                    }, thisArg)),
                                    scope,
                                    //needed for unsub
                                    subscriber
                                ]);
                            }
                        }
                    },
                    /**
                     * Unsubscribe a subscriber from a event
                     * @param  {string}     evnt       Event where from you want to unsubscribe
                     * @param  {Function}   subscriber the subscriber
                     * @param  {*}          [scope]    the scope if used by subscribing
                     */
                    unsub: function (evnt, subscriber, scope) {
                        VPv.each(subscribers[evnt], function (sub, i) {
                            if (sub[2] === subscriber && (!sub[1] || sub[1] === scope)) {
                                subscribers[evnt].splice(i, 1);
                            }
                        });
                    }
                };
            };
        }()),
        //Core Events
        VPEvenst = Events(),
        /**
         * Queue
         * @module $/queue
         */
        Queue = (function () {
            return function () {
                var queue = [],
                    running = FALSE,
                    paused = FALSE,
                    api;
                function next() {
                    var item;
                    //queue paused?
                    if (!paused) {
                        item = queue.shift();
                        if (item) {
                            running = TRUE;
                            item[0].apply(item[3], item[1]);
                            next();
                        } else {
                            running = FALSE;
                        }
                    }
                    return api;
                }
                return (api = {
                    /**
                     * Push a call in the queue
                     * @param  {Function}   call        call that you want queue
                     * @param  {Array}      [arg]       array of arguments that have to be send to the call if it's called
                     * @param  {number}     [opt=0]     bitwise options
                     * @param  {Object}     [thisArg]
                     * @return {$/queue}
                     * @method  $/queue.push
                     */
                    push: function (call, arg, opt, thisArg) {
                        queue.push([call, arg || [], opt, thisArg]);
                        if (!paused && !running) {
                            next();
                        }
                        return api;
                    },
                    /**
                     * Next item in the queue
                     * @return {$/queue}
                     * @method $/queue.next
                     */
                    next: next,
                    /**
                     * Pause the the queue
                     * @param  {boolean}    [state] true for pause, false for unpause, if not set it will toggle the current pause state
                     * @return {$/queue}
                     * @method $/queue.pause
                     */
                    pause: function (state) {
                        if (VPv.isBool(state)) {
                            paused = state;
                        } else {
                            paused = !paused;
                        }
                        if (!paused && !running) {
                            next();
                        }
                        return api;
                    }
                });
            };
        }()),
        /**
         * P module ( Promise module )
         */
        P = (function () {
            var UNRESOLVED = "unresolved",
                HAS_REJECTION = "has-rejection",
                HAS_RESOLUTION  = "has-resolution";
            function isThenable(obj) {
                return VPv.hasop(obj, 'then');
            }
            /**
             * @param {Function} executor
             * @constructor $/p
             * @module  $/p
             */
            function Pconstructor(executor) {
                var state = UNRESOLVED,
                    queue = Queue(),
                    p = {},
                    value;
                /**
                 * Update the state and value/reason  of the promise
                 * @param  {string} newState
                 * @param  {*}      newValue value/reason
                 */
                function updateState(newState, newValue) {
                    if (state === UNRESOLVED) {
                        state = newState;
                        value = newValue;
                        queue.pause(FALSE);
                    }
                }
                /**
                 * Then method
                 * @param  {Function} onFulfilled
                 * @param  {Function} onRejected
                 * @return {$/p}
                 */
                function then(onFulfilled, onRejected) {
                    onFulfilled = onFulfilled || Pconstructor.cast;
                    onRejected = onRejected || function (reason) {
                            return Pconstructor(function (fulfill, reject) {
                                reject(reason);
                            });
                        };
                    //return promise
                    return Pconstructor(function (fulfill, reject) {
                        queue.push(function () {
                            if (isThenable(value) && state === UNRESOLVED) {
                                value.then(onFulfilled, onRejected).then(fulfill, reject);
                            } else {
                                try {
                                    //has resolution
                                    if (state === HAS_RESOLUTION) {
                                        fulfill(onFulfilled(value));
                                    } else {
                                        fulfill(onRejected(value));
                                    }
                                } catch (reason) {
                                    reject(reason);
                                }
                            }
                        });
                    });
                }
                //check of executor is a function
                if (!VPv.isFunction(executor)) {
                    throw new TypeError('executor is not callable');
                }
                //pause queue
                queue.pause(TRUE);
                //run promise always async
                setTimeout(function () {
                    try {
                        executor.call(p,
                            VPv.bind(updateState, p, HAS_RESOLUTION),
                            VPv.bind(updateState, p, HAS_REJECTION)
                        );
                    } catch (reason) {
                        updateState(HAS_REJECTION, reason);
                    }
                }, 0);
                return /** @lends $/p.prototype **/ {
                    /**
                     * Then method
                     * @param  {Function} [onFulfilled]
                     * @param  {Function} [onRejected]
                     * @method $/p.prototype.then
                     * @return {$/p}
                    */
                    then: then,
                    /**
                     * Catch rejections
                     * @param  {Function} [onRejected]
                     * @method $/p.prototype.catch
                     * @return {$/p}
                     */
                    'catch': VPv.bind(then, p, NULL),
                    /**
                     * Get / set state
                     * @param  {string} [newState]
                     * @method $/p.prototype.state
                     * @return {string}
                     */
                    state: function (newState) {
                        if (state === UNRESOLVED && (newState === HAS_REJECTION || newState === HAS_RESOLUTION)) {
                            state = newState;
                        }
                        return state;
                    }
                };
            }
            return VPv.merge(Pconstructor, {
                /**
                 * Returns a promise that is fulfilled
                 * @param  {*} value
                 * @return {$/p}
                 * @method $/p.fulfill
                 */
                fulfill: function (value) {
                    return Pconstructor(function (onFulfilled) {
                        this.state(HAS_RESOLUTION);
                        onFulfilled(value);
                    });
                },
                /**
                 * Returns a promise that is rejected
                 * @param  {*} reason
                 * @return {$/p}
                 * @method $/p.reject
                 */
                reject: function (reason) {
                    return Pconstructor(function (x, onRejected) {
                        this.state(HAS_REJECTION);
                        onRejected(reason);
                    });
                },
                /**
                 * Will cast given value to a promise if the give value is not thenible
                 * @param  {*} value
                 * @return {$/p}
                 * @method $/p.cast
                 */
                cast: function (value) {
                    return Pconstructor(function (onFulfilled, onRejected) {
                        if (isThenable(value)) {
                            value.then(onFulfilled, onRejected);
                        } else {
                            onFulfilled(value);
                        }
                    });
                },
                /**
                 * Returns a promise that resolves when all of the promises in iterable have resolved.
                 * The result of all promises will be returned as an array if the promise is resolved
                 * The promise will immediately rejects with the value of the promise that rejected
                 * @param  {Array|...*} iterable
                 * @return {$/p}
                 * @method $/p.all
                 */
                all: function (iterable) {
                    return Pconstructor(function (onFulfilled, onRejected) {
                        var result = [];
                        //store the value in the result array
                        function then(index, value) {
                            result[index] = value;
                        }
                        //reject promise
                        function reject(reason) {
                            i = max; //kill the loop
                            onRejected(reason);
                        }
                        //check of iterable is a Array
                        if (!VPv.isArray(iterable) || !VPv.isUndefined(arguments[1])) {
                            iterable = VPv.toArray(arguments);
                        }
                        for (var i = 0, max = iterable.length; i < max; i++) {
                            //if not thenable, cast value
                            if (!isThenable(iterable[i])) {
                                iterable[i] = Pconstructor.cast(iterable[i]);
                            }
                            //get  value of rejection reason
                            iterable[i].then(VPv.bind(then, this, i), reject);
                        }
                        onFulfilled(result);
                    });
                },
                race: function () {

                }
            });
        }()),
        /**
         * Import script, CSS
         * @module $/import
         */
        Import = (function (MQueue) {
            var head = doc.head || doc.getElementsByTagName('head')[0] || NULL,
                body = doc.body || doc.getElementsByTagName('body')[0];
            //pause queue
            MQueue.pause();
            VPEvenst.sub('!' + ns + '.ready', function () {
                MQueue.pause(false);
                VPEvenst.unsub(ns + '.ready', this.subscriber);
            });
            //load script
            function script(url, callback) {
                var tag = doc.createElement('script'),
                    insertInto = head || body;
                //script tag
                tag.type = 'text/javascript';
                tag.src = url;
                tag.async = TRUE;
                if (VPv.isFunction(callback)) {
                    callback = VPv.once(callback); //call callback only once
                    tag.onreadystatechange = tag.onload = function () {
                        var state = tag.readyState;
                        if (!state || /loaded|complete/.test(state)) {
                            callback(script);
                        }
                    };
                }
                insertInto.appendChild(tag);
            }
            //return module
            return function () {
                return {
                    /**
                     * Load a script async
                     * @param  {string|Array}   url      script url
                     * @return {$/p}
                     */
                    script: function (urls) {
                        return P(function (onFulfilled, onRejected) {
                            //if urls is a array of urls
                            if (VPv.isArray(urls)) {
                                MQueue.push(function (urls) {
                                    //run all urls
                                    P.all(VPv.map(urls, function (item) {
                                        //make promise
                                        return P(function (f, r) {
                                            script(item, f, r);
                                        });
                                    }))
                                    .then(onFulfilled, onRejected);
                                }, urls);
                            }
                            //single url
                            if (VPv.isString(urls)) {
                                MQueue.push(script, [urls, onFulfilled, onRejected]);
                            }
                        });
                    }
                };
            };
        }(Queue())),
        /**
         * AMD loader
         * @module $/amd
         */
        AMD = (function (MImport) {
            var REFACTOR = 1,
                loaded = {
                    '$/v' : {
                        init: TRUE,
                        factory: V()
                    },
                    '$/events': {
                        init: FALSE,
                        factory: Events,
                        conf: REFACTOR
                    },
                    '$/p' : {
                        init: TRUE,
                        factory: P
                    },
                    '$/import': {
                        init: FALSE,
                        factory: Import,
                        conf: REFACTOR
                    },
                    '$/vp': {
                        init: FALSE,
                        factory: function () {
                            return VP();
                        },
                        deps: [],
                        conf: REFACTOR
                    },
                    '$/queue': {
                        init: FALSE,
                        factory: Queue,
                        conf: REFACTOR
                    },
                    '$/amd': {
                        init: FALSE,
                        factory: function () {
                            return AMD();
                        },
                        deps: [],
                        conf: REFACTOR
                    }
                },
                requested = {},
                waiting = {},
                publish = VPEvenst.pub,
                subscribe = VPEvenst.sub,
                unsubscribe = VPEvenst.unsub,
                evntModule = ns + '.amd.',
                //default config
                config = {
                    baseUrl: './',
                    cache: true,
                    paths: {}
                };
            /**
             * Will parse the module ID based on the AMD standard
             * @see https://github.com/amdjs/amdjs-api/wiki/AMD#module-id-format-
             * Beside that it support some requireJS ID's
             * @todo fix extension and cache buster if url already has a query
             * @param  {string} id       The module ID e.q: 'ns/testA', './ns/testA', '../ns/testA' or full URL 'http://example.com/ns/testA.js'
             * @param  {string} basePath Will be used to find the correct dependencies path
             * @return {Object}          {id: 'ns/moduleA', loadUrl: 'http://example.com/ns/moduleA.js'}
             */
            function parseId(id, basePath) {
                var cacheBuster = config.cache === FALSE ? '?bust=' + VPv.now() : '',
                    idPath, URI, URIbase, relative, extension;
                //is id not a  string
                if (!VPv.isString(id)) {
                    return {
                        id: ''
                    };
                }
                extension = id.slice(-3) === '.js' ? '' : '.js';
                //reserved for core modules
                if (id.charAt(0) === '$') {
                    return {
                        id: id
                    };
                }
                //parse id
                URI = VPv.parseURI(id);
                idPath = URI.dir;
                //absolute URL / path
                if (URI.origin || idPath.charAt(0) === '/') {
                    return {
                        id: id,
                        loadUrl: id + extension + cacheBuster
                    };
                }
                //if id path is relative we use base path else config.baseUrl
                //else we use always config.baseUrl
                if (id.charAt(0) === '.') {
                    URIbase = VPv.parseURI(basePath || config.baseUrl);
                } else {
                    URIbase = VPv.parseURI(config.baseUrl);
                }
                basePath = URIbase.path;
                // ./ns/module => ns/module
                if (idPath.slice(0, 2) === './') {
                    idPath =  idPath.slice(2);
                }
                //check path ( can't use path with ../)
                relative = idPath.slice(0, 3) !== '../';
                if (relative) {
                    idPath = idPath.split('/');
                    if (idPath.length > 1 && config.paths[idPath[0]]) {
                        idPath[0] = config.paths[idPath[0]];
                    }
                    idPath = idPath.join('/');
                }
                //if relative is false, we need to recheck because a path can be also relative
                if  (relative || idPath.slice(0, 3) !== '../') {
                    idPath = idPath.split('/');
                    basePath = basePath.split('/');
                    while (true) {
                        //check of path is '..''
                        if (idPath[0] === '..') {
                            //check of basePath stars with ./ or /
                            if (basePath.length > 1 || basePath[0] !== '.' || basePath[0] !== '') {
                                basePath.pop();
                            }
                            idPath.unshift();
                        } else {
                            break;
                        }
                    }
                    idPath = basePath.join('/') + (idPath).join('/');
                }
                //ID
                idPath += URI.file;
                //absolute URL
                if (URIbase.origin) {
                    //check of id has auto-select scheme
                    return {
                        id: idPath,
                        loadUrl: URIbase.origin + idPath + extension + cacheBuster
                    };
                }
                return {
                    id: idPath,
                    loadUrl: idPath + extension + cacheBuster
                };
            }
            /**
             * get dependencies from module requested
             * @param  {Array}      deps    a array of dependencies for the current module
             * @param  {string}     id      the ID of the current module
             * @return {boolean}            returns true if module needs dependencies else false.
             */
            function getDependencies(deps, id) {
                var needed = [],
                    wait = FALSE;
                //get ID if ID is defined, else set ID ( parse ID will than use the baseURL )
                id = id ? parseId(id).id : FALSE;
                //loop through the dependencies
                VPv.each(deps, function (depId) {
                    var parsedId = parseId(depId, id);
                    depId = parsedId.id;
                    //module isn't loaded and requested
                    if (!loaded[depId] && !requested[depId] && !waiting[depId]) {
                        //loadUrl can be empty if a reserved id is used
                        if (parsedId.loadUrl) {
                            needed.push(parsedId.loadUrl);
                            publish(evntModule + 'requested', id);
                            requested[depId] = TRUE;
                        } else {
                            //TODO trigger error for developer
                        }
                        wait = TRUE;
                    }
                    //if module is in requested module we need to wait
                    if (requested[depId] || waiting[depId]) {
                        wait = TRUE;
                    }
                });
                //do we need to wait?
                if (wait) {
                    //loaded needed scripts
                    if (needed.length > 0) {
                        //for now we only load the file the file
                        MImport.script(needed);
                    }
                    //push current module in waiting
                    if (id) {
                        publish(evntModule + 'waiting', id);
                        waiting[id] = TRUE;
                    }
                }
                return wait;
            }
            /**
             * Will register the module as loaded, will also trigger core.amd.module.loaded
             * @param  {string}     id
             * @param  {Array}      deps
             * @param  {Function}   factory
             * @param  {number}     conf
             * @param  {*}          scope
             */
            function registerModule(id, deps, factory, conf, scope) {
                id = parseId(id).id;
                if (loaded[id]) {
                    return; //error module already registered
                }
                if (VPv.isFunction(deps)) {
                    loaded[id] = {
                        deps: [],
                        factory: deps,
                        conf: factory || 0,
                        scope: conf || this, // jshint ignore:line
                        init: FALSE
                    };
                } else {
                    loaded[id] = {
                        deps: deps,
                        factory: factory,
                        conf: conf || 0,
                        scope: scope || this, // jshint ignore:line
                        init: FALSE
                    };
                }
                //clean
                requested[id] = FALSE;
                waiting[id] = FALSE;
                publish(evntModule + 'loaded', id);
            }
            /**
             * Load module
             * @param  {Array}      deps        a array of dependencies
             * @param  {Function}   factory     the module factory
             * @param  {number}     conf        module configuration bit
             * @param  {*}          scope       module scope
             * @return {Objec}                  the result of the factory
             */
            function loadModule(deps, factory, conf, scope) {
                //curry
                if (VPv.isFunction(deps)) {
                    scope = conf;
                    conf = factory;
                    factory = deps;
                    deps = [];
                }
                //load deps
                VPv.each(deps, function (id, i) {
                    var module = loaded[parseId(id).id],
                        liveModule = module.factory;
                    if (!module.init) {
                        liveModule = loadModule(module.deps, module.factory, module.conf, module.scope);
                        //check REFACTOR bit
                        if (!module.conf || module.conf & ~REFACTOR) {
                            module.factory = liveModule;
                            module.init = TRUE;
                        }
                    }
                    deps[i] = liveModule;
                });
                //call factory
                return factory.apply(scope || undefined, deps || []); // jshint ignore:line
            }
            //subscribe to config changed event
            subscribe(ns + '.config.changed', function (key) {
                //update config
                if (key === '$/amd') {
                    config = VPv.merge(config, VPconfig[key].d, true);
                }
            });
            //return the module
            return function () {
                return {
                    /**
                     * Will re-factor every time when the module is requested.
                     * @constant
                     * @default 1
                     * @type {number}
                     */
                    REFACTOR: REFACTOR,
                    /**
                     * AMD define
                     * @param {string|Array|Function}   id
                     * @param {Array|Function}          deps
                     * @param {Function}                factory
                     * @param {number}                  flags
                     * @param {*}                       scope
                     */
                    def: function (id, deps, factory, flags, scope) {
                        //if ID is a string we want to register a module
                        if (VPv.isString(id)) {
                            //check dependencies
                            if (VPv.isArray(deps) && getDependencies(deps, id)) {
                                //subscribe and wait when all modules are loaded
                                subscribe(evntModule + 'loaded', function () {
                                    if (!getDependencies(deps)) {
                                        unsubscribe(evntModule + 'loaded', this.subscriber);
                                        //register module
                                        registerModule(id, deps, factory, flags, scope);
                                    }
                                });
                            } else {
                                //register module
                                registerModule(id, deps, factory, flags, scope);
                            }
                        }
                        //load module with dependencies
                        if (VPv.isArray(id)) {
                            //check of we need to wait on dependencies
                            if (getDependencies(id)) {
                                //subscribe and wait when all modules are loaded
                                subscribe(evntModule + 'loaded', function () {
                                    if (!getDependencies(id)) {
                                        unsubscribe(evntModule + 'loaded', this.subscriber);
                                        //register module
                                        loadModule(id, deps, factory, flags, scope);
                                    }
                                });
                            } else {
                                loadModule(id, deps, factory, flags, scope);
                            }
                        }
                        //load module without dependencies
                        if (VPv.isFunction(id)) {
                            loadModule(id, deps, factory, flags, scope);
                        }
                    }
                };
            };
        }(Import())),
        /**
         * VP module
         */
        VP = (function () {
            var publish = VPEvenst.pub,
                subscribe = VPEvenst.sub,
                unsubscribe = VPEvenst.unsub,
                def = AMD().def;
            return function () {
                /**
                 * @exports $/vp
                 */
                var coreApi = {
                    /**
                     * Current vp.js version
                     * @type {number}
                     * @constant
                     */
                    VERSION: VERSION,
                    /**
                     * Current vp.js GIT version
                     * @type {number}
                     * @constant
                     */
                    GIT_VERSION: GIT_VERSION,
                    /**
                     * @see {@link $/events~pub}
                     * @method
                     */
                    pub: publish,
                    /**
                     * @see {@link $/events~sub}
                     * @method
                     */
                    sub: subscribe,
                    /**
                     * @see {@link $/events~unsub}
                     * @method
                     */
                    unsub: unsubscribe,
                    /**
                     * Get global configuration value
                     * @param  {string} key
                     * @return {*}          will return null if they key was not found
                     */
                    get: function (key) {
                        if (VPconfig[key]) {
                            return VPconfig[key].d;
                        }
                        return null;
                    },
                    /**
                     * Set global configuration value
                     * @param {string}  key
                     * @param {Object}  value
                     * @param {number}  [opt=0] set configuration flags ( bitwise )
                     *                          1= for merge old and new value @see $/v.merge
                     *                          2= for protecting the value from getting overwritten
                     * @return {$/core}
                     */
                    set: function (key, value, opt) {
                        if (!VPconfig[key]) {
                            VPconfig[key] = {
                                d: value,
                                o: opt || 0
                            };
                            publish(ns + '.config.changed', key);
                        } else {
                            //if protected
                            if (VPconfig[key].o & 2) {
                                return coreApi;
                            }
                            if (VPconfig[key].o & 1 || opt & 1) {
                                VPv.merge(VPconfig[key].d, value, true);
                                publish(ns + '.config.changed', key);
                            }
                        }
                        return coreApi;
                    }
                };
                /**
                 * Creates main vp.js interface
                 * @param {string|Array|Function} [p1]
                 * @param {Object|Array|Function} [p2]
                 * @param {Object|Function}       [p3]
                 * @param {number|*}              [p4]
                 */
                return VPv.merge(function (p1, p2, p3, p4) {
                    var prefix = /^(<|>)(.*)/.exec(p1);
                    /**
                     * Subscribe once and publish in the same time.
                     * Use this only with  Message broker rules
                     */
                    function subpub() {
                        var evnt = p1,
                            id = VPv.now(),
                            data = p2,
                            subscriber = p3,
                            scope = p4;
                        //without data
                        if (VPv.isFunction(p2)) {
                            data = NULL;
                            subscriber = p2;
                            scope = p3;
                        }
                        //add subscriber
                        if (VPv.isFunction(subscriber)) {
                            //add id if need
                            if (!VPv.has(evnt, '@')) {
                                evnt += '@' + id;
                            }
                            subscribe(evnt, function () {
                                unsubscribe(evnt, this.subscriber);
                                subscriber.apply(this, arguments);
                            }, scope);
                        }
                        //publish
                        publish(evnt, data, scope);
                    }
                    //check of string is a event or we need to load a module
                    if (prefix || VPv.isString(p1) && !VPv.has(p1, '/')) {
                        if (prefix) {
                            //subscribe only
                            switch (prefix[1]) {
                                //subscribe only
                                case '<':
                                    subscribe(prefix[2], p2, p3, VP());
                                    break;
                                //publish only
                                case '>':
                                    publish(prefix[2], p2, p3);
                                    break;
                            }
                        } else {
                            subpub();
                        }
                    } else {
                        def(p1, p2, p3, p4);
                    }
                }, coreApi);
            };
        }());
    //bootstrap
    (function () {
        if (VPv.isArray(bootstrap)) {
            VPv.each(bootstrap, function (elm) {
                //check of bootstrap elm is a function
                if (VPv.isFunction(elm)) {
                    elm(VP());
                }
            });
        }
    }());
    //create vp.js interface and define interface
    (function (def) {
        //only define, define if there is not another AMD loader already
        if (!root.define) {
            //init
            def = AMD().def;
            /**
             * AMD module loading via define
             * @param  {string|Array|Function}  id
             * @param  {Array|Function}         deps
             * @param  {Function}               factory
             * @global
             */
            root.define = function (id, deps, factory) {
                def(id, deps, factory);
            };
        }
        /**
         * Core vp.js interface
         * The behavior can be deferent, base on the first parameter
         * @example
         * //String
         * vp('event'); // will publish a event
         * vp('event', {}); // will publish a event with data
         * vp('event', function () {}); //@todo
         * vp('event', {}, function () {}); //@todo
         * vp('>event'); //{@link $/events~pub}
         * vp('<event', function(){}); //{@link $/events~sub}
         * //String contains a path
         * vp('ns/module', function() {}); //{@link $/amd~def}
         * @example
         * //Array
         * vp(['Module']); //{@link $/amd~def}
         * vp(['Module'], function () {}); //{@link $/amd~def}
         * @example
         * //Function
         * vp(function(){}); //{@link $/amd~def}
         * @param  {string|Array|Function}  [p1]
         * @param  {Object|Array|Function}  [p2]
         * @param  {Object|Function}        [p3]
         * @param  {number|*}               [p4]
         * @name vp
         * @method
         * @global
         */
        root[ns] = VP();
    }());
    //async
    (function (api) {
        //async API only needed if core is loaded for that async is defined
        api.push = function () {
            api.apply(root, arguments);
        };
        //execute async calls
        if (VPv.isFunction(async)) {
            VPv.each(async(), function (call) {
                api.apply(root, call);
            });
        }
    }(root[ns]));
    /**
     * Cross browser DOM ready
     * Will publish ns + '.ready' if DOM content is loaded.
     */
    (function () {
        var isFrame,
            //onready
            ready = VPv.once(function () {
                //publish event
                VPEvenst.pub(ns + '.ready', [VERSION, GIT_VERSION]);
            }),
            //try scroll for IE
            tryScroll = function () {
                try {
                    doc.documentElement.doScroll('left');
                    ready();
                } catch (e) {
                    setTimeout(tryScroll, 10);
                }
            };
        //check of DOM is already ready
        if (doc.readyState === 'complete' || doc.body) {
            return ready();
        }
        // Real browsers
        if (doc.addEventListener) {
            doc.addEventListener('DOMContentLoaded', ready, FALSE);
        // a lot of code for 1 single browser a.k.a IE
        } else if (doc.attachEvent) {
            //check iFrame
            try {
                isFrame = win.frameElement !== NULL;
            } catch (e) {}
            // if not in a iframe
            if (!isFrame && doc.documentElement.doScroll) {
                tryScroll();
            }
            // iFrame needs different code :|
            doc.attachEvent('onreadystatechange', function () {
                if (doc.readyState === 'complete') {
                    ready();
                }
            });
        } else {
            // browsers of the year 0
            if (win.addEventListener) {
                win.addEventListener('load', ready, FALSE);
            } else if (win.attachEvent) {
                win.attachEvent('onload', ready);
            } else {
                // browsers of B.C.
                win.onload = ready;
            }
        }
    }());
}(this, this.__VPJSNS__ || 'vp', this.__VPJSBOOTSTRAP__ || []));