/**
 * [description]
 * @param  {[type]} root      [description]
 * @param  {[type]} ns        [description]
 * @param  {[type]} bootstrap [description]
 * @return {[type]}           [description]
 */
(function (root, ns, bootstrap) {
    'use strict';
    var TRUE = true,
        FALSE = false,
        NULL = null,
        async = root[ns],
        /**
         * Y module
         * @return {Object} Y module
         */
        Y = (function(){
            var proArr = Array.prototype,
                proObj = Object.prototype,
                nForEach = proArr.forEach,
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
                        return Object(obj) === obj && (!literal || obj.constructor === Object);
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
                    * Is a given value a boolean?
                    * @param {Object}
                    * @return {Boolean}
                    */
                    isBool: function (obj) {
                        return obj === TRUE || obj === FALSE || toString.call(obj) === '[object Boolean]';
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
                        if(temp = /^([^:]+):\/\/[^\/]|(file):\/\/\/?/.exec(str)) { // jshint ignore:line
                            origin += URI.scheme = (temp[1] || temp[2]).toLowerCase();
                        }
                        //file can't have, host, port, user or pass
                        if (URI.scheme !== 'file') {
                            //[scheme]://(domain) or //(host) or host[:port]  or [user]:[pass]@(host)
                            if (temp = /^([^:]+:)?\/\/([^@]+@)?([^:\/]+)/.exec(str) || /^[^@\/]+@([^:\/]+)/.exec(str) || /^([:\/]+):[1-9][0-9]*/.exec(str)) { // jshint ignore:line
                                origin += URI.host = (temp[2] || temp[1]).toLowerCase();
                            }
                            //port
                            if (temp = /^(([^:]+:)?\/\/)?[^\/]+:([1-9][0-9]*)/.exec(str)) { // jshint ignore:line
                                origin += ':' +temp[3];
                                URI.port = +temp[3];
                            }
                            //user & pass
                            if (temp = /^(([^:]+:)?\/\/)?([^\/@]+)@/.exec(str)) { // jshint ignore:line
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
                        if (temp = /([^?#]+)/.exec(str)) { // jshint ignore:line
                            URI.path = temp = temp[1];
                            temp = temp.split('/');
                            if (temp[temp.length - 1] !== '') {
                                URI.file = temp.pop();
                                temp.push('');
                            }
                            URI.dir = temp.join('/');
                        }
                        //query
                        if (temp = /[^#?]*\?([^#]*)/.exec(str)) { // jshint ignore:line
                            URI.query = temp[1];
                        }
                        //fragment
                        if (temp = /#(.*)/.exec()) { // jshint ignore:line
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
                        return function() {
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
                isArguments = y.isArguments = (function(){
                    function test (obj) {
                        return toString.call(obj) === '[object Arguments]';
                    }
                    //test will not correct work in IE
                    if(test(arguments)) {
                        return test;
                    } else {
                        //fall back for IE;
                        return function (obj) {
                            return !!(obj && hasop(obj, 'callee'));
                        };
                    }
                }()),
                /**
                 * Will loop trough Array's, Arguments and Objects
                 * @param  {Object} obj
                 * @param  {Function} iterator
                 * @param  {Object} context
                 */
                each = y.each = function (obj, iterator, context) {
                    //null we can't interate that
                    if (obj === null) {
                        return;
                    }
                    //array with native support 
                    if (obj.forEach === nForEach) {
                        obj.forEach(iterator, context);
                    //Array and Arguments
                    } else if (isArray(obj) || isArguments(obj)) {
                        for (var i = 0, max = obj.length; i < max; i++) {
                            iterator.call(context, obj[i], i, obj);
                        }
                    //Objects
                    } else {
                        for (var x in obj) {
                            if(hasop(x, obj)) {
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
            each(['Function', 'String', 'Number', 'Date'], function(is) {
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
                    each(iterable, function(value) {
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
                    each(arg, function(arr){
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
                        each(obj, function(value, key) {
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
             * @param  {[type]} obj [description]
             * @return {[type]}     [description]
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
                str = ''+obj; //to string
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
            //return module
            return function () {
                return y;
            };
        }()),
        /**
         * Events module
         * @return {[type]} [description]
         */
        Events = (function(y){
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
                                if(subscribers[evntPart + '.*']) {
                                    subs = subs.concat(subscribers[evntPart]);
                                }
                            }
                            //all
                            if (subscribers['*']) {
                                subs = subs.concat(subscribers['*']);
                            }
                            //start publishing
                            y.each(subs, function(subscriber){
                                if (!subscribers[1] || subscriber[1] === scope) {
                                    if (notAsync) {
                                        subscriber[0](data, originEvent);
                                    } else {
                                        setTimeout(function(){
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
                            if(validSubscribe.test(allEvnt[i])) {
                                //TODO
                                if (parseEvnt.slice(0,1) === '!') {
                                    parseEvnt = parseEvnt.slice(1);
                                }
                                //add subscriber list
                                if (!subscribers[parseEvnt]) {
                                    subscribers[parseEvnt] = [];
                                }
                                //add subscriber
                                subscribers[parseEvnt].push([
                                    //TODO write y.bind ( cross browser bind )
                                    subscriber.bind(y.merge({
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
                        y.each(subscribers[evnt], function(sub, i){
                            if (sub[2] === subscriber && (!sub[1] || sub[1] === scope)) {
                                subscribers[evnt].splice(i,1);
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
        Core = (function(Events, y){
            var config = {};
            return function () {
                return {
                    pub: Events.pub,
                    sub: Events.sub,
                    unsub: Events.unsub,
                    get: function (key) {
                        if(config[key]) {
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
         * Import script, CSS
         * @param  {Y}          Y module
         * @return {Import}     Import module
         */
        Import = (function(y){
            var doc = document,
                head = doc.head || doc.getElementsByTagName('head')[0] || NULL,
                body = doc.body || doc.getElementsByTagName('body')[0];
            //load script
            function script (url, callback) {
                var tag = doc.createElement('script'),
                    insertInto = head || body;
                //script tag
                tag.type = 'text/javascript';
                tag.src = url;
                tag.async = TRUE;
                if (y.isFunction(callback)) {
                    callback = y.once(callback); //for that callback only is called once
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
                     * @param  {String}     url      script url
                     * @param  {Function}   callback callback if script is loaded
                     */
                    script: script
                };
            };
        }(Y())),
        /**
         * AMD module
         * @return {Function} AMD module
         */
        AMD = (function(y, MCore, MImport){
            var loaded = {
                    '$/y' : {
                        init: true,
                        factory: Y()
                    },
                    '$/events': {
                        init: true,
                        factory: Events()
                    },
                    '$/import': {
                        init: true,
                        factory: Import()
                    },
                    '$/core': {
                        init: true,
                        factory: Core()
                    },
                    '$/amd': {
                        init: false,
                        factory: function () {
                            return AMD();
                        },
                        deps: []
                    }
                },
                requested = {},
                waiting = {},
                publish = MCore.pub,
                subscribe = MCore.sub,
                unsubscribe = MCore.unsub,
                evntModule = 'core.amd.module.',
                config = y.merge({
                    baseUrl: './',
                    paths: {}
                }, MCore.get('core.amd.config'), true);
            /**
             * Will parse the module ID based on the AMD standard
             * @see https://github.com/amdjs/amdjs-api/wiki/AMD#module-id-format-
             * Beside that it support some requireJS ID's
             * @param  {String} id       The module ID e.q: 'ns/testA', './ns/testA', '../ns/testA' or full URL 'http://example.com/ns/testA.js'
             * @param  {String} basePath Will be used to find the correct dependencies path
             * @return {Object}          {id: 'ns/moduleA', loadUrl: 'http://example.com/ns/moduleA.js'}
             */
            function parseId (id, basePath) {
                var extendsion = id.slice(-3) === '.js' ? '' : '.js',
                    idPath, URI, URIbase, relative;
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
                        loadUrl: id + extendsion
                    };
                }
                //use base path
                URIbase = y.parseURI(basePath || config.baseUrl);
                basePath = URIbase.path;
                // ./ns/module => ns/module
                if(idPath.slice(0,2) === './') {
                    idPath =  idPath.slice(2);
                }
                //check path ( can't use path with ../)
                relative = idPath.slice(0,3) !== '../';
                if (!relative) {
                    idPath = idPath.split('/');
                    if (idPath.length > 1 && config.paths[idPath[0]]) {
                        idPath[0] = config.paths[idPath[0]];
                    }
                    idPath = idPath.join('/');
                }
                //if relative is false, we need to recheck because a path can be also relative
                if  (relative || idPath.slice(0,3) !== '../') {
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
                        loadUrl: URIbase.origin + idPath + extendsion
                    };
                }
                return {
                    id: idPath,
                    loadUrl: idPath + extendsion
                };
            }
            /**
             * get dependencies from module requested
             * @param  {Array}      deps    a array of dependencies for the current module
             * @param  {String}     id      the ID of the current module
             * @return {Boolean}            returns true if module needs dependencies else false.
             */
            function getDependencies (deps, id) {
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
            function registerModule(id, deps, factory , conf, scope) {
                id = parseId(id).id;
                if (loaded[id]) {
                    return; //error module already registered
                }
                //curry
                if (y.isFunction(deps)) {
                    scope = conf;
                    conf = factory ;
                    factory = deps;
                    deps = [];
                }
                //load module
                loaded[id] = {
                    deps: deps,
                    factory: factory,
                    conf: conf || 0,
                    scope: scope || root,
                    init: FALSE
                };
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
            function loadModule (deps, factory, conf, scope) {
                //curry
                if (y.isFunction(deps)) {
                    scope = conf;
                    conf = factory;
                    factory = deps;
                    deps = [];
                }
                //load deps
                y.each(deps, function(id, i) {
                    var module = loaded[parseId(id).id];
                    if (!module.init) {
                        module.factory = loadModule(module.deps, module.factory, module.conf, module.scope);
                        module.init = TRUE;
                    }
                    deps[i] = module.factory;
                });
                //call factory
                return factory.apply(scope, deps);
            }
            //return the module
            return function () {
                return {
                    def: function () {
                        var arg = y.toArray(arguments);
                        //if ID is a string we want to register a module
                        if (y.isString(arg[0])) {
                            //check dependencies
                            if (y.isArray(arg[1]) && getDependencies(arg[1], arg[0])) {
                                //subscribe and wait when all modules are loaded
                                subscribe(evntModule + 'loaded', function() {
                                    if(!getDependencies(arg[1])) {
                                        unsubscribe(evntModule + 'loaded', this.subscriber);
                                        //register module
                                        registerModule.apply(null, arg);
                                    }
                                });
                            } else {
                                //register module
                                registerModule.apply(null, arg);
                            }
                        }
                        //load module with dependencies
                        if (y.isArray(arg[0])) {
                            //check of we need to wait on dependencies
                            if (getDependencies(arg[0])) {
                                //subscribe and wait when all modules are loaded
                                subscribe(evntModule + 'loaded', function() {
                                    if(!getDependencies(arg[0])) {
                                        unsubscribe(evntModule + 'loaded', this.subscriber);
                                        //register module
                                        loadModule.apply(this, arg);
                                    }
                                });
                            } else {
                                loadModule.apply(null, arg);
                            }
                        }
                        //load module without dependencies
                        if (y.isFunction(arg[0])) {
                            loadModule.apply(null, arg);
                        }
                    }
                };
            };
        }(Y(), Core(), Import()));
    /**
     * VP.js lib interface
     * @param {Y}       y       [description]
     * @param {AMD}     AMD     [description]
     * @param {Core}    MCore   [description]
     */
    root[ns] = (function(y, AMD, MCore){
        var def = AMD.def;
        /**
         * AMD module loading via define
         * @param  {String|Array|Function} p1 [description]
         * @param  {Array|Function} p2 [description]
         * @param  {Function} p3 [description]
         * @return {[type]}    [description]
         */
        if (!root.define) {
            root.define = function (p1,p2,p3) {
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
            function subpub () {
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
            if (prefix || y.isString(arg[0]) && !y.has(arg[0], '/')){
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
                arg.slice(0,4); //if some try to change the scope
                arg.push(Core());
                def.apply(this, arg);
            }
        };
    }(Y(), AMD(), Core()));
    //bootstrap
    (function(y){
        if (y.isArray(bootstrap)) {
            y.each(bootstrap, function(elm){
                elm();
            });
        }
    }(Y()));
    //async
    (function(api, y){
        //async API only needed if core is loaded for that async is defined
        api.push = function() {
            api.apply(root, arguments);
        };
        //execute async calls
        if (y.isFunction(async)) {
            y.each(async(), function(call){
                api.apply(root, call);
            });
        }
    }(root[ns], Y()));
}(this, this.__VPJSNS__ || 'vpjs', this.__VPJSBOOTSTRAP__ || []));