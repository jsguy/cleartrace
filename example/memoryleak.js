var ct = require('../').init({
	appName: "Leaky boat"
});

var leaky = require('./memoryleak_module.js');
setInterval(leaky.replaceThing, 1000);
var cb = function callbackMeister(value){
	console.log('value', value);
};
leaky.someThing(ct.async(cb));