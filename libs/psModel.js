/**
 * Created by kevin on 4/29/15.
 */
var superagent = require('superagent');
var config = require('../config');
var debug = require('./debug');
var utils = require('./utils');
function psModel() {
    var src = utils.extend.apply(null, arguments);
    this.mark = {on: 0, k: 3, stype: 0};
    this.data = {};
    //init
    (function ($) {
        var mark = $.columns.header;
        mark.forEach(function (p) {
            if (src[p]) {
                $.mark[p] = Number(src[p]);
            }
        });
        var data_c = $.columns.common;
        var data_o = $.columns.option[$.mark.stype];
        var data = data_c.concat(data_o);
        data.forEach(function (p) {
            src[p] && ($.data[p] = src[p]);
        });
    })(this);
}
psModel.prototype.columns = {
    'header': ['on', 'k', 'stype'],
    'common': ['query', 'tag'],
    'option': [['region'], ['bounds'], ['location', 'radius']]
}
psModel.prototype.getColArray = function () {
    var ret = [];
    var com = this.columns.common;
    var opt = this.columns.option;
    [].push.apply(ret, com);
    opt.forEach(function ($) {
        [].push.apply(ret, $);
    })
    return ret;
}
psModel.prototype.toQuery = function () {
    //to superagent query json
    var src = utils.extend.apply(null, arguments);
    return utils.extend({
        'ak': config.ak,
        'output': 'json'
    }, this.data, src);
}
psModel.prototype.toEntity = function () {
    //to mongoose save json
    var src = utils.extend.apply(null, arguments);
    return utils.extend({
        k: this.mark.k,
        stype: this.mark.stype
    }, this.data, src);
}

psModel.prototype.handle = function () {
    /**
     handle([db],callback)

     callback(error,JSON)

     to Get Data of psModel from Url.
     */
    var i = arguments.length - 1;
    var callback = arguments[i--];
    var db = i ? null : arguments[i];
    var serviceUrl = 'http://api.map.baidu.com/place/v2/search';
    var querys = this.toQuery();
    var entitys = this.toEntity();
    superagent.get(serviceUrl)
        .query(querys)
        .end(function (err, res) {
            callback(err, res.text);
            //update database
            if (db) {
                db.update(
                    entitys,//update criteria
                    {$set: {result: res.text}},//update action
                    {upsert: true, multi: true},//update option
                    function (err) {
                        err && debug.log('database update error!');
                    });
            }
        });
}
module.exports = psModel;