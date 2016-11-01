//	Proxy for tracking async callbacks
//	Note: this must be called inline;
//		ie: don't call it before the callback would normally be called.
var proxy = require("../proxy.js"),
	util = require("../util.js"),
	options = {
		autoStart: true,
		verbose: false
	};

module.exports.init = function(args, emit) {
	//	TODO: Do we need args?
	return function(func, traceObj){
		traceObj = traceObj || {};
		var funcName = util.getFuncName(func);
		return proxy.functions.async.around(
			func,
			//	method
			function(method, trace){
				trace = util.def(trace, traceObj);
				trace.funcName = util.getFuncName(func);
				trace.before = util.createTrace();
			},
			function(method, args, hookValue){
				hookValue = hookValue || {};
				hookValue.after = util.createTrace();
				emit(hookValue);
			}
		);
	};
};