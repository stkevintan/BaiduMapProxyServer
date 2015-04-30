//var psModel = require('../database/models').testModel;
var config = require('../config');
var debug = require('../libs/debug');
var psModel=require('../libs/psModel');
(function() {
    var r=[1,2];
    var f=['a'];
    var s=function(){return;};
    [].push.apply(f,s);
    debug.log(f);

    debug.log(psModel.prototype.getColArray());
})();
