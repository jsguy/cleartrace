//	Proxy for tracking require modules
//	Note: Caveat Emptor: this will override global require.
var	proxy = require("../proxy.js"),
	util = require("../util.js"),
	options = {
		autoStart: true,
		useNativeProxy: true
	},
	indent = 0,
	prevFunc,
	//	Our require modules proxy, track indent, memory and such.
	moduleProxy = function(obj, args, module, emit){
		var makeFunc = function(func, funcName, traceObj){
			var fun = proxy.functions.around(
					func,
					function(obj, args, trace){
						if(prevFunc !== func) {
							indent += 1;
						}
						trace = util.def(trace, traceObj);
						//	Grab the name and memory usage
						trace.funcName = funcName;
						trace.before = util.createTrace();
						trace.indent = indent;
					},
					function(obj, args, result, trace){
						prevFunc = func;
						trace.after = util.createTrace();
						trace.rssdiff = trace.after.memory.rss - trace.before.memory.rss;
						emit(trace);
						if(prevFunc !== func) {
							indent -= 1;
						}
					}
				);


			if(options.useNativeProxy){
				//	Use a Proxy, so modifications will be passed on
				return new Proxy(fun, {
					set (target, key, value) {
						//	Update the module
						func[key] = value;
						//	And the original target
						target[key] = value;
						return true;
					}
				});
			} else {
				return fun;
			}
		};

		if(util.isObject(module)){
			//	Get the module name from obj
			for(var i in module) {if(module.hasOwnProperty(i)){
				module[i] = util.isFunction(module[i])? makeFunc(module[i], i, {
					origin: 'object',
					filename: obj.filename
				}): module[i];
			}}
			return module;
		} else if(util.isFunction(module)) {
			return makeFunc(module, util.getFuncName(module), {
				origin: 'function',
				filename: obj.filename
			});
		} else if(util.isArray(module)){
			for(var i = 0; i < module.length; i += 1) {
				module[i] = util.isFunction(module[i])? makeFunc(module[i], util.getFuncName(module[i]), {
					origin: 'array',
					filename: obj.filename
				}): module[i];
			}
			return module;
		}
		return module;
	},
	attachRequireProxy = function(emit){
		//	This overrides require globally
		proxy.proxies.after(module.__proto__, 'require', function(obj, args, module){
			return moduleProxy(obj, args, module, emit);
		});
	};

//  Init require proxy
module.exports.init = function (args, emit) {
	options = util.def(options, args);
	if(options.autoStart) {
		attachRequireProxy(emit);
	}
	return attachRequireProxy;
};