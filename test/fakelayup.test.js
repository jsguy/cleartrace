var ct = require('../../cleartrace').init({appName: "fakelayup"});
var m = require('./modules/fakelayup.js');
m.something = m.something || {};
m.something.other = function (){
	console.log('hello');
};
m.something.other();