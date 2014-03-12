/**
 * vp.js
 * IMPORTANT this project is still in draft.
 * @author Victor Perez
 * @license (@link ../LICENSE} GNU GENERAL PUBLIC LICENSE v2
 */
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
         * @module $/y
         */
        Y = (function () {
            var proArr = Array.prototype,
                proObj = Object.prototype,
                nForEach = proArr.forEach,
                nIndexOf = proArr.indexOf,
                nBind = Function.prototype.bind,
                nKeys = proObj.keys,
                toString = proObj.toString,
                slice = proArr.slice,
                y = {
                    /**
                    * Is a given value a object?
                    * @param  {*}       obj
                    * @param  {Boolaen} [literal=false] Check of object is a literal object
                    * @return {Boolean}
                    * @method $/y.isObject
                    */
                    isObject: function (obj, literal) {
                        return Object(obj) === obj && (!literal || obj.constructor === Object);
                    },
                    /**
                    * Is a given value a regular expression?
                    * @param  {*} obj
                    * @return {Boolean}
                    * @method $/y.isRegex
                    */
                    isRegex: function (obj) {
                        return obj && (obj.ignoreCase || obj.ignoreCase === FALSE) && obj.test && obj.exec;
                    },
                    /**
                     * Is given value undefined?
                     * @param  {*} obj
                     * @return {Boolean}
                     * @method $/y.isUndefined
                     */
                    isUndefined: function (obj) {
                        return obj === void 0;
                    },
                    /**
                    * Is a given value a boolean?
                    * @param  {*} obj
                    * @return {Boolean}
                    * @method $/y.isBool
                    */
                    isBool: function (obj) {
                        return obj === TRUE || obj === FALSE || toString.call(obj) === '[object Boolean]';
                    },
                    /**
                    * Is a given value a DOM element?
                    * @param  {*} obj
                    * @return {Boolean}
                    * @method $/y.isElement
                    */
                    isElement: function (obj) {
                        return !!(obj && obj.nodeType === 1);
                    },                    /**
                     * Will only call the given function once.
                     * After that it will return the result of this call
                     * @param  {Function} func
                     * @return {Function}
                     * @method $/y.once
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
                     * @return {Boolean}
                     * @method $/y.is
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
                     * @return {Number} number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
                     * @method $/y.now
                     */
                    now: Date.now || function () {
                        return (+new Date());
                    }
                },
                /**
                 * Is given value an Array?
                 * @param  {*} obj
                 * @return {Boolean}
                 * @method $/y.isArray
                 */
                isArray = y.isArray = proArr.isArray || function (obj) {
                    return toString.call(obj) === '[object Array]';
                },
                /**
                 * Shortcut for hasOwnProperty
                 * @param  {Object} obj
                 * @param  {String} key
                 * @return {Boolean}
                 * @method $/y.hasop
                 */
                hasop = y.hasop = function (obj, key) {
                    return obj.hasOwnProperty(key);
                },
                /**
                 * Is given value a Arguments object
                 * @param  {*} obj
                 * @return {Boolean}
                 * @method $/y.isArguments
                 */
                isArguments = y.isArguments = (function () {
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
                 * @method $/y.each
                 */
                each = y.each = function (obj, callback, thisArg) {
                    //null we can't interate that
                    if (obj === null || y.isUndefined(obj)) {
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
             * @return {Boolean}
             * @method $/y.isFunction
             */
            /**
             * is given value a string
             * @param  {*} obj
             * @return {Boolean}
             * @method $/y.isString
             */
            /**
             * is given value a number
             * @param  {*} obj
             * @return {Boolean}
             * @method $/y.isNumber
             */
            /**
             * is given value a Date object
             * @param  {*} obj
             * @return {Boolean}
             * @method $/y.isDate
             */
            each(['Function', 'String', 'Number', 'Date'], function (is) {
                y['is' + is] = function (obj) {
                    return toString.call(obj) === '[object ' + is + ']';
                };
            });
            /**
             * Array.indexOf shim
             * @param  {Array}  arr             Array to search in
             * @param  {*}      needed          Element to search for
             * @param  {number} [fromIndex=0]   Index to start
             * @return {number} returns the first index at which a given element can be found in the array, or -1 if it is not present.
             * @method $/y.indexOf
             */
            y.indexOf = function (arr, needed, fromIndex) {
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
            * Y.has("test", "e"); //will return true
            * Y.has([1], 1); //will return true
            * Y.has({x:1}, "x"); //will return true
            * Y.has(null, null); //will return true
            * Y.has(10, 5); //will return true
            * @param  {*}       obj
            * @param  {*}       needed
            * @return {Boolean}
            * @method $/y.has
            */
            y.has = function (obj, needed) {
                //Has the string needed string ?
                if (y.isString(obj)) {
                    return !!~obj.indexOf(needed);
                }
                //Has array needed element?
                if (y.isArray(obj)) {
                    return !!~y.indexOf(obj, needed);
                }
                //Has number the needed number
                if (y.isNumber(obj)) {
                    return obj >= needed;
                }
                //Has object needed property
                if (y.isObject(obj)) {
                    return y.hasop(obj, needed);
                }
                //if null, undefined if they are equal they
                return obj === needed;
            };
            /**
            * Convert anything to a Array.
            * @example
            * Y.toArray("test") //will return ["t","e","s","t"]
            * Y.toArray({a:1}) //will return [1]
            * Y.toArray({a:1}, true) //will return ['a'], same as Y.key
            * Y.toArray(null) //will return [null]
            * @param  {*}        obj
            * @param  {Bolean}   [keys=false] can be used by a object to return the keys instead of the values
            * @return {Array}
            * @method $/y.toArray
            */
            y.toArray = function (obj, keys) {
                var temp = [];
                //Arguments to Array
                if (isArguments(obj)) {
                    return slice.call(obj);
                }
                //String to Array
                if (y.isString(obj)) {
                    return obj.split('');
                }
                //Array to Array
                if (isArray(obj)) {
                    return slice.call(obj);
                }
                //Object to Array
                if (y.isObject(obj)) {
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
             * @param  {function} func      function where from you want to memorize the result
             * @param  {function} [hasher]  hasher function, default it will hash the parameters
             * @return {function}
             * @method $/y.memoize
             */
            y.memoize = function (func, hasher) {
                var cache = {};
                //set default hasher
                hasher = hasher || function () {
                    return y.toArray(arguments);
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
             * @param  {String} str
             * @return {Object}
             * @method $/y.parseURI
             */
            y.parseURI = y.memoize(function (str) {
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
             * @method $/y.keys
             */
            y.keys = nKeys || function (obj) {
                if (!y.isObject(obj)) {
                    throw new TypeError(obj + ' is not an object');
                }
                return y.toArray(obj, true);
            };
            /**
             * Will merge all parameters based on the type of the first parameter.
             * If the first parameter is a Array then it will treat all other parameters as a Array by using Y.toArray
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
             * @param   {Boolean}               [deep=false]
             * @return  {Array|Object|String}
             * @method $/y.merge
             */
            y.merge = function () {
                var arg = y.toArray(arguments),
                    obj1 = arg.shift(),
                    deep = arg[arg.length - 1] === TRUE ? TRUE : FALSE;
                if (y.isObject(obj1) && deep) {
                    arg.pop();
                }
                //array
                if (isArray(obj1)) {
                    each(arg, function (arr) {
                        obj1 = obj1.concat(y.toArray(arr));
                    });
                    return obj1;
                }
                //Object
                if (y.isObject(obj1)) {
                    each(arg, function (obj) {
                        //check of parameter is a object, else change it to a empty object
                        if (!y.isObject(obj)) {
                            obj = {};
                        }
                        each(obj, function (value, key) {
                            //deep
                            if (deep && y.isObject(obj1[key])) {
                                y.merge(obj1[key], value, true);
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
             * @return {Boolean}
             * @method $/y.empty
             */
            y.empty = function (obj) {
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
                if (y.isString(obj) || y.isNumber(obj)) {
                    return str === '' || str === '0';
                }
                //new Boolean()
                if (y.isBool(obj)) {
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
             * Function.bind shim, will delegate to native Function.bind if supported
             * @param  {Function}   func        target function
             * @param  {*}          thisArg     'this' to bind
             * @param  {...*}       [params]    params that you want to bind
             * @return {Function}               bound function
             * @method $/y.bind
             */
            y.bind = function (func, thisArg) {
                var args, bound, fcon;
                //native bind
                if (nBind && func.bind === nBind) {
                    return nBind.apply(func, slice.call(arguments, 1));
                }
                //check of fist func is a function
                if (!y.isFunction(func)) {
                    throw new TypeError();
                }
                //arguments that we want to bind
                args = slice.call(arguments, 2);
                fcon = function () {};
                //bound function
                bound = function () {
                    var self = this instanceof fcon && thisArg ? this : thisArg;
                    return func.apply(self, args.concat(y.toArray(arguments)));
                };
                //bound constructor
                fcon.prototype = func.prototype;
                bound.prototype = new fcon();
                return bound;
            };
            return function () {
                return y;
            };
        }()),
        //Core Y
        VPy = Y(),
        /**
         * Events module
         * @module $/events
         */
        Events = (function () {
            var validSubscribe = /^!?(\*$|[a-z]+)([a-z0-9]*\.([a-z0-9]+|\*$))*(@[0-9]+)?$/,
                validPublish = /^[a-z]+([a-z0-9]*\.[a-z0-9]+)*(@[0-9]+)?$/;
            return function () {
                var subscribers = {};
                return {
                    /**
                     * Publish a event
                     * @param  {String}     evnt                The event that you want to publish
                     * @param  {*}          [data]              Data that you want to send along with the event
                     * @param  {*}          [scope]             Event scope
                     * @param  {Boolean}    [notAsync=false]    Events are default asynchronous, but in some cases yo don't want that
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
                            VPy.each(subs, function (subscriber) {
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
                     * @param {String}     evnt       The event where you want to subscribe
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
                                    VPy.bind(subscriber, VPy.merge({
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
                     * @param  {String}     evnt       Event where from you want to unsubscribe
                     * @param  {Function}   subscriber the subscriber
                     * @param  {*}          [scope]    the scope if used by subscribing
                     */
                    unsub: function (evnt, subscriber, scope) {
                        VPy.each(subscribers[evnt], function (sub, i) {
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
                     * @param  {Number}     [opt=0]     bitwise options
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
                     * @param  {Boolean}    [state] true for pause, false for unpause, if not set it will toggle the current pause state
                     * @return {$/queue}
                     * @method $/queue.pause
                     */
                    pause: function (state) {
                        if (VPy.isBool(state)) {
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
                VPEvenst.unsub('!' + ns + '.ready', this.subscriber);
            });
            //load script
            function script(url, callback) {
                var tag = doc.createElement('script'),
                    insertInto = head || body;
                //script tag
                tag.type = 'text/javascript';
                tag.src = url;
                tag.async = TRUE;
                if (VPy.isFunction(callback)) {
                    callback = VPy.once(callback); //call callback only once
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
                     * @param  {String|Array}   url      script url
                     * @param  {Function}       callback callback if script is loaded
                     */
                    script: function (urls, callback) {
                        //if urls is a array of urls
                        if (VPy.isArray(urls)) {
                            VPy.each(urls, function (url) {
                                MQueue.push(script, [url, callback]);
                            });
                        }
                        //single url
                        if (VPy.isString(urls)) {
                            MQueue.push(script, [urls, callback]);
                        }
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
                    '$/y' : {
                        init: TRUE,
                        factory: Y()
                    },
                    '$/events': {
                        init: FALSE,
                        factory: Events,
                        conf: REFACTOR
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
             * @param  {String} id       The module ID e.q: 'ns/testA', './ns/testA', '../ns/testA' or full URL 'http://example.com/ns/testA.js'
             * @param  {String} basePath Will be used to find the correct dependencies path
             * @return {Object}          {id: 'ns/moduleA', loadUrl: 'http://example.com/ns/moduleA.js'}
             */
            function parseId(id, basePath) {
                var cacheBuster = config.cache === FALSE ? '?bust=' + VPy.now() : '',
                    idPath, URI, URIbase, relative, extension;
                //is id not a  string
                if (!VPy.isString(id)) {
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
                URI = VPy.parseURI(id);
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
                    URIbase = VPy.parseURI(basePath || config.baseUrl);
                } else {
                    URIbase = VPy.parseURI(config.baseUrl);
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
             * @param  {String}     id      the ID of the current module
             * @return {Boolean}            returns true if module needs dependencies else false.
             */
            function getDependencies(deps, id) {
                var needed = [],
                    wait = FALSE;
                //get ID if ID is defined, else set ID ( parse ID will than use the baseURL )
                id = id ? parseId(id).id : FALSE;
                //loop through the dependencies
                VPy.each(deps, function (depId) {
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
             * @param  {String}     id      
             * @param  {Array}      deps    
             * @param  {Function}   factory 
             * @param  {Number}     conf    
             * @param  {*}          scope   
             */
            function registerModule(id, deps, factory, conf, scope) {
                id = parseId(id).id;
                if (loaded[id]) {
                    return; //error module already registered
                }
                if (VPy.isFunction(deps)) {
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
             * @param  {Number}     conf        module configuration bit
             * @param  {*}          scope       module scope
             * @return {Objec}                  the result of the factory
             */
            function loadModule(deps, factory, conf, scope) {
                //curry
                if (VPy.isFunction(deps)) {
                    scope = conf;
                    conf = factory;
                    factory = deps;
                    deps = [];
                }
                //load deps
                VPy.each(deps, function (id, i) {
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
                    config = VPy.merge(config, VPconfig[key].d, true);
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
                     * @param {string|Array|function}   id
                     * @param {Array|function}          deps
                     * @param {function}                factory
                     * @param {number}                  flags
                     * @param {*}                       scope
                     */
                    def: function (id, deps, factory, flags, scope) {
                        //if ID is a string we want to register a module
                        if (VPy.isString(id)) {
                            //check dependencies
                            if (VPy.isArray(deps) && getDependencies(deps, id)) {
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
                        if (VPy.isArray(id)) {
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
                        if (VPy.isFunction(id)) {
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
                     * @type {Number}
                     * @constant
                     */
                    VERSION: VERSION,
                    /**
                     * Current vp.js GIT version
                     * @type {Number}
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
                     * @param  {String} key
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
                     * @param {String}  key
                     * @param {Object}  value
                     * @param {Number}  [opt=0] set configuration flags ( bitwise )
                     *                          1= for merge old and new value @see $/y.merge
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
                                VPy.merge(VPconfig[key].d, value, true);
                                publish(ns + '.config.changed', key);
                            }
                        }
                        return coreApi;
                    }
                };
                /**
                 * Creates main vp.js interface
                 * @param {(string|Array|function)} p1
                 * @param {(object|Array|function)} p2
                 * @param {(object|function)}       p3
                 * @param {(number|*)}              p4
                 */
                return VPy.merge(function (p1, p2, p3, p4) {
                    var prefix = /^(<|>)(.*)/.exec(p1);
                    /**
                     * Subscribe once and publish in the same time.
                     * Use this only with  Message broker rules
                     */
                    function subpub() {
                        var evnt = p1,
                            id = VPy.now(),
                            data = p2,
                            subscriber = p3,
                            scope = p4;
                        //without data
                        if (VPy.isFunction(p2)) {
                            data = NULL;
                            subscriber = p2;
                            scope = p3;
                        }
                        //add subscriber
                        if (VPy.isFunction(subscriber)) {
                            //add id if need
                            if (!VPy.has(evnt, '@')) {
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
                    if (prefix || VPy.isString(p1) && !VPy.has(p1, '/')) {
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
        if (VPy.isArray(bootstrap)) {
            VPy.each(bootstrap, function (elm) {
                //check of bootstrap elm is a function
                if (VPy.isFunction(elm)) {
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
             * @param  {String|Array|Function}  id
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
         * @param  {string|Array|function}  p1
         * @param  {Object|Array|function}  [p2]
         * @param  {Object|function}        [p3]
         * @param  {number|*}               [p4]
         * @name vp
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
        if (VPy.isFunction(async)) {
            VPy.each(async(), function (call) {
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
            ready = VPy.once(function () {
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