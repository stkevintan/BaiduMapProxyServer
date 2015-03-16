var express = require('express');
var superagent = require('superagent');
var config = require('../config');

var router = express.Router();
var serviceUrl = 'http://api.map.baidu.com/geocoder/v2/';

router.get('/', function(req, res, next) {
  res.render('geocoder', {
    title: '地理转换'
  });
});
router.post('/', function(req, res, next) {
  var location = req.body.location;
  var pois = req.body.pois;
  var output = 'json';
  var qJson = {
    coordtype: 'wgs84ll',
    //bd09ll（百度经纬度坐标）、gcj02ll（国测局经纬度坐标）、wgs84ll（ GPS经纬度）
    'output': output,
    'ak': config.ak,
    'location': location,
    'pois': pois
  }
  console.log(qJson);
  superagent.get(serviceUrl)
    .query(qJson)
    .end(function(err, sres) {
      if (err) return next(err);
      var text = JSON.parse(sres.text);
      console.log(typeof text.addressComponent)
      if(text.status!=0)res.send("出错，错误码："+text.status);
      else res.send({
        "breif_address":text.result.formatted_address,
        "detail_address":{
          "province":text.result.addressComponent.province,
          "city":text.result.addressComponent.city,
          "district":text.result.addressComponent.district,
          "street":text.result.addressComponent.street,
          "streetNo":text.result.addressComponent.street_number
        },
        "business":text.result.business
      });
    })
})
module.exports = router;
