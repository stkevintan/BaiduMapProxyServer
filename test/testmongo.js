//var psModel = require('../database/models').testModel;
var config = require('../config');
var debug = require('../libs/debug');
(function() {
    var f={
        name:'fuck',
        inspect:function(){
            return 'wocao';
        }
    }
    console.log(JSON.stringify(f),f.name);
})();
