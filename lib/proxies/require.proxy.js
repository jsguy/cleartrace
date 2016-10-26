//	Proxy for tracking require modules
//	Note: Caveat Emptor: this will override global require.
var proxy = require("../proxy.js"),
	util = require("../util.js"),
	options = {
		autoStart: true,
		verbose: false
	},
	//	Our require modules proxy, track memory and such.
	moduleProxy = function(obj, args, module, emit){
		var makeFunc = function(func, funcName){
			return proxy.functions.around(
				func,
				function(obj, args, trace){
					//	Grab the name and memory usage
					trace.funcName = funcName;
					trace.before = util.createTrace();
				},
				function(obj, args, result, trace){
					trace.after = util.createTrace();
					trace.rssdiff = trace.after.memory.rss - trace.before.memory.rss;
					emit(trace);
				}
			);
		};

		if(util.isFunction(module)) {
			return makeFunc(module, util.getFuncName(module));
		} else if(util.isObject(module)){
			for(var i in module) {if(module.hasOwnProperty(i)){
				module[i] = util.isFunction(module[i])? makeFunc(module[i], i): module[i];
			}}
			return module;
		} else if(util.isArray(module)){
			for(var i = 0; i < module.length; i += 1) {
				module[i] = util.isFunction(module[i])? makeFunc(module[i], util.getFuncName(module[i])): module[i];
			}
			return module;
		} else {
			return module;
		}
	},
	attachRequireProxy = function(emit){
		//	Note: This overrides require globally
		proxy.proxies.after(module.__proto__, 'require', function(obj, args, module){
			//	Use the module proxy
			return moduleProxy(obj, args, module, emit);
		});
	};

//  Init require proxy
module.exports.init = function (args, emit) {
	options = util.def(options, args);
	if(options.autoStart) {
		attachRequireProxy(emit);
	}
};