var mongoose = require('mongoose');
var config = require('../config');
var db = mongoose.connect(config.dbUrl);
var psSchema = new mongoose.Schema({
    query: {
        type: String
    },
    tag: {
        type: String
    },
    page_size: {
        type: Number,
        default: 10
    },
    page_num: {
        type: Number,
        default: 0
    },
    stype: {
        type: Number,
        default: 0
    },
    region: {
        type: String
    },
    location: {
        type: String
    },
    result: {
        type: String
    },
    timestamp: {
        type: Date,
        default: new Date()
    }
});
exports.psModel = db.model('pslogs', psSchema);
if (config.debugMode)
    exports.testModel = db.model('test', new mongoose.Schema({
        name: {
            type: String
        },
        age: {
            type: Number
        }
    }));
