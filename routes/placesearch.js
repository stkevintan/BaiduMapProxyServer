var express = require('express');
var superagent = require('superagent');
var accesskey = require('../accesskey');

var router = express.Router();
var serviceUrl = 'http://api.map.baidu.com/place/v2/search';

router.get('/', function(req, res, next) {
  res.render('placesearch/index', {
    title: '地图搜索'
  });
});

router.post('/', function(req, res, next) {

  var stype = req.body.stype;
  var query = req.body.query;
  var tag = req.body.tag;
  var scope = req.body.scope;
  var filter =req.body.filter;
  var page_size=req.body.page_size;
  var page_num=req.body.page_num;
  var region=req.body.region;
  var bounds=req.body.bounds;
  var location=req.body.location;
  var radius=req.body.radius;

  var qJson={output:"json"};
  qJson.query=query;
  qJson.tag=tag;
  qJson.scope=scope;
  if(scope==2)qJson.filter=filter;
  qJson.page_size=page_size;
  qJson.page_num=page_num;
  qJson.ak=accesskey;

  if (stype == 0) {
    //区域检索
    qJson.region=region;
  }else if(stype == 1){
    qJson.bounds=bounds;
  }else{
    qJson.location=location;
    qJson.radius=radius;
  }
  //console.log("qJson",qJson);
  superagent.get(serviceUrl)
    .query(qJson)
    .end(function(err, sres) {
      if (err) {
        return next(err);
      }
      var text = JSON.parse(sres.text);
      if (text.status != 0) {
        res.send("转换出错！ 错误码：" + text.status);
      } else {
        var simpleRes=[];
        text.results.forEach(function(resItem){
          simpleRes.push({
            "名称":resItem.name,
            "经度":resItem.location.lat,
            "纬度":resItem.location.lng
          });
        });
        res.send(simpleRes);
      }
    });
});

module.exports = router;
