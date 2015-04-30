/**
 * Created by kevin on 4/29/15.
 */
var async = require('async');
var config = require('../config');
var psDB = require('./models').psDB;
var psModel = require('../libs/psModel');
var debug = require('../libs/debug');
var utils = require('../libs/utils');
var group = function (k, total, contain) {
    var c = total / k;
    var r = total % k;
    if (c < r) return;
    //r:(k+1) c-r:k
    var ret = [];
    var index = 0;
    var alloc = [{unit: r, num: k + 1}, {unit: c - r, num: k}];

    alloc.forEach(function ($) {
        for (var i = 0; i < $.unit; i++) {
            var buk = [];
            for (var j = 0; j < $.num; j++) {
                buk.push(contain[index++]);
            }
            ret.push(buk);
        }
    });
    return ret;
}
var refactor = function (tasks) {
    var limit = config.ParallelLimit;
    var colArray = psModel.prototype.getColArray();
    var ref = {};
    var size = colArray.length;

    var dfs = function (i, now) {
        if (i == size) {
            debug.log('now',now);
            new psModel(now).handle(psDB, function (err) {
                err && debug.log('database update error');
            });
            return;
        }
        var prop = colArray[i];
        ref[prop].forEach(function (val) {
            now[prop] = val;
            dfs(i + 1, now);
        });
    }

    colArray.forEach(function ($) {
        ref[$] = [];
    });
    async.eachLimit(tasks, limit, function (item, callback) {
        item.forEach(function (item) {
            colArray.forEach(function ($) {
                ref[$].push(item[$]);
            });
        });
        // unique Array
        colArray.forEach(function ($) {
            ref[$] = utils.unique(ref[$]);
        });
        //refactor
        dfs(0, {});
    }, function (err) {
        err && debug.log('refactor error!', err);
    });
}
exports.psDbDaemon = function () {
    setInterval(function () {
        //debug.log('start to check database');
        psDB.aggregate(
            {$match: {result: {$exists: 0}}},
            {
                $group: {
                    _id: "$k",
                    content: {$push: "$$ROOT"},
                    total: {$sum: 1}
                }
            },
            function (err, docs) {
                var tasks = [];
                async.each(docs, function ($, callback) {
                    //debug.log($);
                    var ret = group($._id, $.total, $.content);
                    ret && Array.prototype.push.apply(tasks, ret);
                    callback();
                }, function (err) {
                    if (err) debug.log('daemon error!');
                    else if (tasks.length) {
                        debug.log('start to refactor!!!',tasks);
                        refactor(tasks);
                    }
                });

            });
    }, config.DaemonInterval);
}