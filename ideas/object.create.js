console.clear();
var x = {test: 1},
    conf = {
        test2: {
            set: function (value) {
                console.log('<->', value, this)
                this.test2 = value;
            }
        }
    };
///==== test
var create = (function () {
    var addProperties;
    function defineGetSet(settings, key, obj) {
        var _key = settings.enumerable ? this[key] : obj[key],
                set = settings.set;
        _key = settings.value;
        obj.__defineGetter__(key, function () {
            if (settings.get) {
                return settings.get.call(obj);
            } else {
                return _key;
            }
        })
        obj.__defineSetter__(key, function (value) {
            if (settings.writable) {
                if (set) {
                        set = false;
                        settings.set.call(obj, value);
                } else {
                    _key = value;
                    set = settings.set;
                }
            }
        })
    }
    function IEHack() {

    }
    function fcon() {}
    if ({}.__defineGetter__) {
        addProperties = defineGetSet;
    } else {
        addProperties = IEHack;
    }
    return function (proto, properties) {
        var enumerable = {},
            temp;
        fcon.prototype = proto;
        temp  = new fcon();
        if (properties) {
            for (var x in properties) {
                addProperties.call(temp, properties[x], x, proto);
            }
        }
        return temp;
    };
}());

///==== test 

obj = Object.create(x, conf)

obj.test = 2
console.log('>>', obj.test)


obj.test2 = 3
console.log('>>', obj.test2)


console.log(Object.keys(obj))
console.info(obj)
for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
        console.log(i)
    }
}