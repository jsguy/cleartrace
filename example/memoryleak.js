var ct = require('../').init({
	appName: "Leaky boat"
});

console.log('Get leaky module...');

//	Load our leaky module
var leaky = require('./memoryleak_module.js');
setInterval(leaky.replaceThing, 500);
var cb = function callbackMeister(value){
	console.log('Return value', value);
};
//	Install our async callback proxy
//	Passing in optional (but very useful) parameters
leaky.someThing(ct.async(cb, {
	origin: "boat",
	filename: require.resolve('./memoryleak_module.js')
}));

//	Wait a little bit, then exit
setTimeout(function(){
	console.log('Done leaking');
	process.exit(0);
}, 5000);
