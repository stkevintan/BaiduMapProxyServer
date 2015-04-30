var express = require('express');
//var debug = require('../libs/debug');
var psEncrypt = require('../libs/psEncrypt');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('placeSearch', {
        title: '地图搜索'
    });
});

router.post('/', function (req, res, next) {
    psEncrypt(req.body, function (err, sres) {
        if (err) {
            return next(err);
        }
        var text = JSON.parse(sres);
        if (text.status) {
            res.send("转换出错！" + text.message);
        } else {
            var simpleRes = [];
            text.results.forEach(function (resItem) {
                'location' in resItem && simpleRes.push({
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
