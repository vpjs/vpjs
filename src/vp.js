/**
 * VPJS core
 * IMPORTANT this project is still in draft.
 * @author Victor Perez
 * @param  {Object} [root=this] Library root scope
 * @param  {String} [ns=vpjs]   You can change the namespace via __VPJSNS__, all core events will start with you defined namespace and not with vpjs
 * @param  {Array}  bootstrap   You can define the bootstrap via __VPJSBOOTSTRAP__, this must be array of functions.
 *                              Important, the bootstrap must be defined before loading the library!
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
        /**
         * Y module
         * @return {Object} Y module
         */
        Y = (function () {
            var proArr = Array.prototype,
                proObj = Object.prototype,
                nForEach = proArr.forEach,
                nBind = Function.prototype.bind,
                toString = proObj.toString,
                slice = proArr.slice,
                y = {
                    /**
                    * Is a given value a object?
                    * @param {Object}
                    * @param {Boolaen} literal check of object is a literal object
                    * @return {Boolean}
                    */
                    isObject: function (obj, literal) {
                        return proObj.constructor(obj) === obj && (!literal || obj.constructor === Object);
                    },
                    /**
                    * Is a given value a regular expression?
                    * @param {Object}
                    * @return {Boolean}
                    */
                    isRegex: function (obj) {
                        return obj && (obj.ignoreCase || obj.ignoreCase === FALSE) && obj.test && obj.exec;
                    },
                    /**
                     * Is given value undefined?
                     * @param  {Objec}      obj [description]
                     * @return {Boolean}        [description]
                     */
                    isUndefined: function (obj) {
                        return obj === void 0;
                    },
                    /**
                    * Is a given value a boolean?
                    * @param {Object}
                    * @return {Boolean}
                    */
                    isBool: function (obj) {
                        return obj === TRUE || obj === FALSE || toString.call(obj) === '[object Boolean]';
                    },
                    /**
                    * Is a given value a DOM element?
                    * @param {Object}
                    * @return {Boolean}
                    */
                    isElement: function (obj) {
                        return !!(obj && obj.nodeType === 1);
                    },
                    /**
                     * Parse a URI and return its components
                     * @param  {String} str [description]
                     * @return {Object}     [description]
                     */
                    parseURI: function (str) {
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
                    },
                    /**
                     * Will only call the given function once.
                     * After that it will return the result of this one call
                     * @param  {Function} func
                     * @return {Function}
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
                    }
                },
                /**
                 * Is Object an Array?
                 * @param  {Object} obj
                 * @return {Boolean}
                 */
                isArray = y.isArray = proArr.isArray || function (obj) {
                    return toString.call(obj) === '[object Array]';
                },
                /**
                 * Has own property
                 * @param  {Object} obj
                 * @param  {String} key
                 * @return {Boolean}
                 */
                hasop = y.hasop = function (obj, key) {
                    return obj.hasOwnProperty(key);
                },
                /**
                 * Is object an Arguments object
                 * @return {Boolean}
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
                 * Will loop trough Array's, Arguments and Objects
                 * @param  {Object} obj
                 * @param  {Function} iterator
                 * @param  {Object} context
                 */
                each = y.each = function (obj, iterator, context) {
                    //null we can't interate that
                    if (obj === null || y.isUndefined(obj)) {
                        return;
                    }
                    //array with native support
                    if (nForEach && obj.forEach === nForEach) {
                        obj.forEach(iterator, context);
                    //Array and Arguments
                    } else if (isArray(obj) || isArguments(obj)) {
                        for (var i = 0, max = obj.length; i < max; i++) {
                            iterator.call(context, obj[i], i, obj);
                        }
                    //Objects
                    } else {
                        for (var x in obj) {
                            if (hasop(obj, x)) {
                                iterator.call(context, obj[x], x, obj);
                            }
                        }
                    }

                };
            /**
             * is give object a ( function, string, number, data )
             * @param  {Object} obj
             * @return {Boolean}
             */
            each(['Function', 'String', 'Number', 'Date'], function (is) {
                y['is' + is] = function (obj) {
                    return toString.call(obj) === '[object ' + is + ']';
                };
            });
            /**
            * Has given obj, needed string, property or obj
            * @param {Sting|Array|Object} obj
            * @param {String} needed
            * @return {Boolean}
            */
            y.has = function (obj, needed) {
                //Contains the string the needed string?
                if (y.isString(obj)) {
                    if (obj.indexOf(needed) !== -1) {
                        return TRUE;
                    }
                    return FALSE;
                }
                //Contains the Array the needed obj/string?
                if (y.isArray(obj)) {
                    if (y.indexOf(obj, needed) !== -1) {
                        return TRUE;
                    }
                    return FALSE;
                }
                //default has object needed property
                return y.hasop(obj, needed);
            };
            /**
            * Safely convert anything iterable into a real, live array.
            * @param {Object}
            * @return {Array}
            */
            y.toArray = function (iterable) {
                var temp = [];
                //Arguments to Array
                if (isArguments(iterable)) {
                    return slice.call(iterable);
                }
                //String to Array
                if (y.isString(iterable)) {
                    return iterable.split('');
                }
                //Array to Array
                if (isArray(iterable)) {
                    return slice.call(iterable);
                }
                //Object to Array
                if (y.isObject(iterable)) {
                    each(iterable, function (value) {
                        temp.push(value);
                    });
                    return temp;
                }
                //Array :)
                return [iterable];
            };
            /**
             * Merge based on the type of the first parameter
             * @param {Array|Object}            firstParam, if not a array or object then it will use string concatenation
             * @param {Boolean}                 lastParam   if true and firstParam is a object
             * @return {Array|Object|String}
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
                //all other type
                arg.unshift(obj1);
                return arg.join('');
            };
            /**
             * Is a given object empty?
             * undefined, null, false, 0, "0"
             * @param  {Object}     obj Object that you want to check
             * @return {Boolean}        if empty true
             */
            y.empty = function (obj) {
                var str;
                //undefined, null, false, 0 and ''
                if (!obj) {
                    return TRUE;
                }
                //Array
                if (isArray(obj)) {
                    return obj.length === 0;
                }
                //shouldn't happen but if someone used new [Type]
                str = '' + obj; //to string
                //new String and new Number
                if (y.isString(obj) && y.isNumber(obj)) {
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
             * Function.bind shim, will delegate to native Function.bind if support
             * @param  {Function} func      target function
             * @param  {Object} thisArg     'this' to bind
             * @return {Function}           bound function
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
            //return module
            return function () {
                return y;
            };
        }()),
        /**
         * Events module
         * @return {Events}
         */
        Events = (function (y) {
            var validSubscribe = /^!?(\*$|[a-z]+)([a-z0-9]*\.([a-z0-9]+|\*$))*(@[0-9]+)?$/,
                validPublish = /^[a-z]+([a-z0-9]*\.[a-z0-9]+)*(@[0-9]+)?$/;
            return function () {
                var subscribers = {};
                return {
                    /**
                     * Publish a event
                     * @param  {String}     evnt        The event that you want to publish
                     * @param  {Object}     data        Data that you want to send with the event
                     * @param  {Object}     scope       Event scope
                     * @param  {Boolean}    notAsync    default events are async but i some case yo don't want that
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
                            y.each(subs, function (subscriber) {
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
                     * @example
                     * valid subscribe events
                     *     'x' or 'somelongname' or 'a123' [the first character of a event must be a-z, a event must only contain only small characters or numbers]
                     *     'x.x' [you can use a '.' to name space the event]
                     *     'x.*' [you can use a '*' to subscribe to all events in a name space]
                     *     '*' [subscribe to all events]
                     * @example
                     * invalid subscribe events
                     *     '1a' [the first character can't be a number]
                     *     'a.' [a event can not be only a name space]
                     *     'a#$' [a event can't have other characters than a-z or 0-9]
                     * @param {String}     evnt       The event where you want to subscribe
                     * @param {Function}   subscriber The subscriber to the events
                     * @param {Object}     scope      Scope can be used to only subscribe to events that are in that scope
                     * @param {Object}     thisArg    The `this` scope  of the subscriber
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
                                    y.bind(subscriber, y.merge({
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
                     * @param  {String} evnt       Event where from you want to unsubscribe
                     * @param  {[type]} subscriber the subscriber
                     * @param  {[type]} scope      the scope if used by subscribing
                     */
                    unsub: function (evnt, subscriber, scope) {
                        y.each(subscribers[evnt], function (sub, i) {
                            if (sub[2] === subscriber && (!sub[1] || sub[1] === scope)) {
                                subscribers[evnt].splice(i, 1);
                            }
                        });
                    }
                };
            };
        }(Y())),
        /**
         * Core module
         * @param  {[type]} Events [description]
         * @return {[type]}        [description]
         */
        Core = (function (Events, y) {
            var config = {};
            return function () {
                return {
                    VERSION: VERSION,
                    GIT_VERSION: GIT_VERSION,
                    pub: Events.pub,
                    sub: Events.sub,
                    unsub: Events.unsub,
                    get: function (key) {
                        if (config[key]) {
                            return config[key].d;
                        }
                        return null;
                    },
                    /**
                     * Set global configuration value
                     * @param {String} key   [description]
                     * @param {Object} value [description]
                     * @param {Bit}    opt   1 for merge, 2 for protected
                     */
                    set: function (key, value, opt) {
                        if (!config[key]) {
                            config[key] = {
                                d: value,
                                o: opt || 0
                            };
                        } else {
                            //if protected
                            if (config[key].o & 2) {
                                return this;
                            }
                            if (config[key].o & 1 || opt & 1) {
                                y.merge(config[key].d, value, true);
                            }
                        }
                        return this;
                    }
                };
            };
        }(Events(), Y())),
        /**
         * Queue module
         * @param  {Y}
         * @return {Queue}
         */
        Queue = (function (y) {
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
                }
                return (api = {
                    /**
                     * Push a call in the queue
                     * @param  {Function}   call    call that you want to push
                     * @param  {Array}      arg     array of arguments that have to be send to the call if it's called
                     * @param  {Number}     opt     bitwise options
                     * @param  {Object}     thisArg
                     * @return {Queue}
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
                     */
                    next: next,
                    /**
                     * Pause the the queue
                     * @param  {Boolean}    [state] true for pause, false for unpause if not set it will toggle the current pause state
                     */
                    pause: function (state) {
                        if (y.isBool(state)) {
                            paused = state;
                        } else {
                            paused = !paused;
                        }
                        if (!paused && !running) {
                            next();
                        }
                    }
                });
            };
        }(Y())),
        /**
         * Import script, CSS
         * @param  {Y}          Y module
         * @return {Import}     Import module
         */
        Import = (function (y, MQueue, MCore) {
            var head = doc.head || doc.getElementsByTagName('head')[0] || NULL,
                body = doc.body || doc.getElementsByTagName('body')[0];
            //pause queue
            MQueue.pause();
            MCore.sub('!' + ns + '.ready', function () {
                MQueue.pause(false);
                MCore.unsub('!' + ns + '.ready', this.subscriber);
            });
            //load script
            function script(url, callback) {
                var tag = doc.createElement('script'),
                    insertInto = head || body;
                //script tag
                tag.type = 'text/javascript';
                tag.src = url;
                tag.async = TRUE;
                if (y.isFunction(callback)) {
                    callback = y.once(callback); //call callback only once
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
                     * @param  {String|Array}     url      script url
                     * @param  {Function}   callback callback if script is loaded
                     */
                    script: function (urls, callback) {
                        //if urls is a array of urls
                        if (y.isArray(urls)) {
                            y.each(urls, function (url) {
                                MQueue.push(script, [url, callback]);
                            });
                        }
                        //single url
                        if (y.isString(urls)) {
                            MQueue.push(script, [urls, callback]);
                        }
                    }
                };
            };
        }(Y(), Queue(), Core())),
        /**
         * AMD module
         * @return {Function} AMD module
         */
        AMD = (function (y, MCore, MImport) {
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
                    '$/core': {
                        init: FALSE,
                        factory: Core,
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
                publish = MCore.pub,
                subscribe = MCore.sub,
                unsubscribe = MCore.unsub,
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
                var cacheBuster = config.cache === FALSE ? '?bust=' + (+ new Date()) : '',
                    idPath, URI, URIbase, relative, extension;
                //is id not a  string 
                if (!y.isString(id)) {
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
                URI = y.parseURI(id);
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
                    URIbase = y.parseURI(basePath || config.baseUrl);
                } else {
                    URIbase = y.parseURI(config.baseUrl);
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
                y.each(deps, function (depId) {
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
             * @param  {String}     id      [description]
             * @param  {Array}      deps    [description]
             * @param  {Function}   factory [description]
             * @param  {Number}     conf    [description]
             * @param  {Object}     scope   [description]
             */
            function registerModule(id, deps, factory, conf, scope) {
                id = parseId(id).id;
                if (loaded[id]) {
                    return; //error module already registered
                }
                if (y.isFunction(deps)) {
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
             * @param  {Object}     scope       module scope
             * @return {Objec}                  the result of the factory
             */
            function loadModule(deps, factory, conf, scope) {
                //curry
                if (y.isFunction(deps)) {
                    scope = conf;
                    conf = factory;
                    factory = deps;
                    deps = [];
                }
                //load deps
                y.each(deps, function (id, i) {
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
                return factory.apply(scope || this, deps || []); // jshint ignore:line
            }
            //return the module
            return function () {
                //merge config
                config = y.merge(config, MCore.get('$/amd'), true);
                return {
                    /**
                     * REFACTOR bit [1]
                     * Will re-factor every time when the module is request.
                     * @type {Integer}
                     */
                    REFACTOR: REFACTOR,
                    def: function () {
                        var arg = y.toArray(arguments),
                            defaultScope = this;
                        //if ID is a string we want to register a module
                        if (y.isString(arg[0])) {
                            //check dependencies
                            if (y.isArray(arg[1]) && getDependencies(arg[1], arg[0])) {
                                //subscribe and wait when all modules are loaded
                                subscribe(evntModule + 'loaded', function () {
                                    if (!getDependencies(arg[1])) {
                                        unsubscribe(evntModule + 'loaded', this.subscriber);
                                        //register module
                                        registerModule.apply(defaultScope, arg);
                                    }
                                });
                            } else {
                                //register module
                                registerModule.apply(defaultScope, arg);
                            }
                        }
                        //load module with dependencies
                        if (y.isArray(arg[0])) {
                            //check of we need to wait on dependencies
                            if (getDependencies(arg[0])) {
                                //subscribe and wait when all modules are loaded
                                subscribe(evntModule + 'loaded', function () {
                                    if (!getDependencies(arg[0])) {
                                        unsubscribe(evntModule + 'loaded', this.subscriber);
                                        //register module
                                        loadModule.apply(defaultScope, arg);
                                    }
                                });
                            } else {
                                loadModule.apply(defaultScope, arg);
                            }
                        }
                        //load module without dependencies
                        if (y.isFunction(arg[0])) {
                            loadModule.apply(defaultScope, arg);
                        }
                    }
                };
            };
        }(Y(), Core(), Import()));
    //bootstrap
    (function (y) {
        if (y.isArray(bootstrap)) {
            y.each(bootstrap, function (elm) {
                //check of bootstrap elm is a function
                if (y.isFunction(elm)) {
                    elm(Core());
                }
            });
        }
    }(Y()));
    /**
     * VP.js lib interface
     * @param {Y}       y       [description]
     * @param {AMD}     AMD     [description]
     * @param {Core}    MCore   [description]
     */
    root[ns] = (function (y, AMD, MCore) {
        var def = AMD.def;
        /**
         * AMD module loading via define
         * @param  {String|Array|Function} p1 [description]
         * @param  {Array|Function} p2 [description]
         * @param  {Function} p3 [description]
         * @return {[type]}    [description]
         */
        if (!root.define) {
            root.define = function (p1, p2, p3) {
                def.call(root, p1, p2, p3);
            };
        }
        /**
         * [description]
         * @param  {String|Array|Function}  p1
         * @param  {Object|Array|Function}  p2 [description]
         * @param  {Object|Function}        p3 [description]
         * @param  {Number}                 p4 [description]
         * @return {vpjs}                   [description]
         */
        return function (p1, p2, p3) {
            var arg = y.toArray(arguments),
                prefix = /^(<|>)(.*)/.exec(p1);
            /**
             * Subscribe once and publish in the same time.
             * Use this only with  Message broker rules
             */
            function subpub() {
                var evnt = p1,
                    data = p2,
                    subscriber = p3,
                    scope = p3,
                    id = +new Date();
                //add id if need
                if (!y.has(evnt, '@')) {
                    evnt += '@' + id;
                }
                //add subscriber
                if (y.isFunction(subscriber)) {
                    MCore.sub(evnt, function () {
                        MCore.unsub(evnt, this.subscriber);
                        subscriber.apply(this, arguments);
                    }, scope);
                }
                //publish
                MCore.pub(evnt, data, scope);
            }
            //check of string is a event or we need to load a module
            if (prefix || y.isString(arg[0]) && !y.has(arg[0], '/')) {
                if (prefix) {
                    //subscribe only
                    switch (prefix[1]) {
                        //subscribe only
                        case '<':
                            MCore.sub(prefix[2], p2, p3, Core());
                            break;
                        //publish only
                        case '>':
                            MCore.pub(prefix[2], p2, p3);
                            break;
                    }
                } else {
                    subpub();
                }
            } else {
                def.apply(Core(), arg);
            }
        };
    }(Y(), AMD(), Core()));
    //async
    (function (api, y) {
        //async API only needed if core is loaded for that async is defined
        api.push = function () {
            api.apply(root, arguments);
        };
        //execute async calls
        if (y.isFunction(async)) {
            y.each(async(), function (call) {
                api.apply(root, call);
            });
        }
    }(root[ns], Y()));
    /**
     * Cross browser DOM ready
     * Will publish ns + '.ready' if DOM content is loaded.
     * @param  {Events.pub} publish [description]
     * @param  {Y.once}     once    [description]
     */
    (function (publish, once) {
        var isFrame,
            //onready
            ready = once(function () {
                //publish event
                publish(ns + '.ready', [VERSION, GIT_VERSION]);
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
    }(Core().pub, Y().once));
}(this, this.__VPJSNS__ || 'vpjs', this.__VPJSBOOTSTRAP__ || []));