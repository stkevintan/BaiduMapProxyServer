var extend = function (target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
var unique = function (target) {
    var n = {},
        r = [],
        len = target.length,
        val, type;
    for (var i = 0; i < target.length; i++) {
        val = target[i];
        type = typeof val;
        if (!n[val]) {
            n[val] = [type];
            r.push(val);
        } else if (n[val].indexOf(type) < 0) {
            n[val].push(type);
            r.push(val);
        }
    }
    return r;
}
exports.extend = extend;
exports.unique = unique;