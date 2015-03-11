var express = require('express');
var superagent = require('superagent');
var accesskey = require('../accesskey');

var router = express.Router();
var serviceUrl = 'http://api.map.baidu.com/place/v2/search/';

router.get('/', function(req, res, next) {
  res.render('placesearch/index', {
    title: '地图搜索'
  });
});

router.post('/', function(req, res, next) {
  var oldX = req.body.X;
  var oldY = req.body.Y;
  superagent.get(serviceUrl)
    .query({
      'coords': oldX + "," + oldY,
      'ak': accesskey
    })
    .end(function(err, sres) {
      if (err) {
        return next(err);
      }
      var text = JSON.parse(sres.text);
      if (text.status != 0) {
        res.send("转换出错！ 错误码：" + text.status);
      } else {
        res.send(text.result);
      }
    });
});

module.exports = router;
