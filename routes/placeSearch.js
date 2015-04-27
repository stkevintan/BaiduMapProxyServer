var express = require('express');
var superagent = require('superagent');
var config = require('../config');
var debug = require('../libs/debug');
var psEncrypt = require('../libs/psEncrypt');
var router = express.Router();
var serviceUrl = 'http://api.map.baidu.com/place/v2/search';

router.get('/', function(req, res, next) {
    res.render('placeSearch', {
        title: '地图搜索'
    });
});

router.post('/', function(req, res, next) {
    psEncrypt(req.body, function(err, sres) {
        if (err) {
            return next(err);
        }
        var text = JSON.parse(sres);
        if (text.status != 0) {
            res.send("转换出错！ 错误码：" + text.status);
        } else {
            var simpleRes = [];
            text.results.forEach(function(resItem) {
                simpleRes.push({
                    "name": resItem.name,
                    "lat": resItem.location.lat,
                    "lng": resItem.location.lng
                });
            });
            res.send(simpleRes);
        }
    });
});

module.exports = router;
