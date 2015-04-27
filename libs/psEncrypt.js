var async = require('async');
var debug = require('./debug');
var config = require('../config');
var superagent = require('superagent');
var psModel = require('../database/models').psModel;
var serviceUrl = 'http://api.map.baidu.com/place/v2/search';
JSON.merge = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
var getQuery = function(json) {
    var que = {
        query: json.query,
        tag: json.tag,
        stype: json.stype
    }
    if (que.stype == 0) {
        que.region = json.region;
    } else {
        que.location = json.location;
        que.radius = json.radius;
    }
    return que;
}

var searchHis = function(query, callback) {
    psModel.findOne(JSON.merge({}, query, {
        result: {
            $exists: true
        }
    }), function(err, doc) {
        if (err) callback(err);
        callback(null, query, doc);
    });
}

var storeRec = function(query, doc, callback) {
    if (doc && doc.result) {
        debug.log('not through storeRec');
        callback(null, doc);
    } else psModel.create(query, function(err, doc) {
        if (err) callback(err);
        setTimeout(function() {
            callback(null, doc);
        }, 2000);
    });
}

var doWork = function(doc, callback) {

    if (doc.result) {
        debug.log('not through dowork');
        callback(null, doc.result);
    } else psModel.findById(doc._id, {
        _id: 0,
        timestamp: 0,
        stype: 0,
        __v: 0
    }, function(err, _doc) {
        var toQuery=JSON.merge({},_doc,{output:'json'});
        debug.log('output',toQuery.__proto__.output);
        if (_doc.result) {
            debug.log('not through superagent');
            callback(null, _doc.result);
        } else superagent.get(serviceUrl)
            .query(JSON.merge({}, _doc.toJSON(), {
                'ak': config.ak,
                'output': 'json'
            }))
            .end(function(err, res) {
                if (err) callback(err);
                callback(null, res.text);
                //update database
                psModel.update(_doc, {
                    $set: {
                        result: res.text
                    }
                }, function(err) {
                    if (err) debug.log('database update error!');
                });
            });
    });
}

var psEncrypt = async.compose(doWork, storeRec, searchHis);

module.exports = function(json, callback) {
    psEncrypt(getQuery(json), function(err, result) {
        if (err) callback(err);
        callback(null, result);
    });
}
