var async = require('async');
var debug = require('./debug');
var config = require('../config');
var psModel = require('./psModel');
var psDB = require('../database/models').psDB;


var searchHis = function (psmodel, callback) {
    psDB.findOne(psmodel.toEntity({
        result: {$exists: true}
    }), function (err, doc) {
        callback(err, psmodel, doc);
    });
}

var storeRec = function (psmodel, doc, callback) {
    if (doc && doc.result) {
        debug.log('not through storeRec');
        callback(null, doc);
    } else if (psmodel.mark.on) {
        psDB.create(psmodel.toEntity(), function (err, doc) {
            setTimeout(function () {
                callback(err, doc);
            }, config.ResponseTimeOut);
        });
    } else {
        debug.log('Not to Encrypt,Get Data from Server');
        psmodel.handle(psDB, function (err, res) {
            callback(err, {result: res});
        });
    }

}

var doWork = function (doc, callback) {
    if (doc && doc.result) {
        debug.log('Not Via doWork');
        callback(null, doc.result);
    } else psDB.findById(doc._id, {
        _id: 0,
        timestamp: 0,
        stype: 0,
        __v: 0
    }, function (err, _doc) {
        //debug.log(_doc.toJSON());
        if (err) callback(err);
        else if (_doc.result) {
            debug.log('Not via Superagent');
            callback(null, _doc.result);
        } else {
            //Get Data from Server
            new psModel(_doc).handle(callback);
        }
    });
}

var psEncrypt = async.compose(doWork, storeRec, searchHis);

module.exports = function (json, callback) {
    var psmodel = new psModel(json);
    psEncrypt(psmodel, callback);
}
