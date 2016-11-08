var ct = require('../../cleartrace').init({appName: "bindandswitch"});
exports = module.exports = require('./modules/bindandswitch.js');
exports.hello = function(){
	console.log('Hello world...');
};

exports();