var ct = require('../').init({
	appName: "Leaky boat"
});

//	Load our leaky module
var leaky = require('./memoryleak_module.js');
setInterval(leaky.replaceThing, 1000);
var cb = function callbackMeister(value){
	console.log('value', value);
};
//	Install our async callback proxy
//	Passing in optional (but very useful) parameters
leaky.someThing(ct.async(cb, {
	origin: "object",
	filename: require.resolve('./memoryleak_module.js')
}));
setTimeout(function(){
	console.log('Done leaking');
	process.exit(0);
}, 10000)