/* Proxy functionality */
var	util = require("./util.js"),
	//	Track already proxied items
	proxiedItems = [],
	isProxied = function(module) {
		for(var i = 0; i < proxiedItems.length; i += 1) {
			if(proxiedItems[i] === module) {
				return true;
			}
		}
		return false;
	},
	//	Set the prototype and attributes
	proxify = function(obj, target) {
		if(!isProxied(obj)) {
			proxiedItems.push(obj);

			target.prototype = obj.prototype;

			//	set any attributes
			for(var i in obj) {
				target[i] = obj[i];
			}

			return target;
		} else {
			return obj;
		}
	},
	//	Proxy functions
	functions = {
		after: function(method, hook){
			return proxify(method, function() {
				var result = method.apply(this, arguments),
					hookResult;
				try {
					hookResult = hook(this, arguments, result);
				} catch(e) {
					//	TODO: Something better with this
					console.error('ERROR', e);
				}

				return hookResult || result;
			});
		},
		around: function(method, hookBefore, hookAfter){
			return proxify(method, function() {
				var hookValue = {};

				try {
					hookBefore(this, arguments, hookValue);
				} catch(e) {
					//	TODO: Something better with this
					console.error(e);
				}

				var result = method.apply(this, arguments),
					hookResult;
				try {
					hookResult = hookAfter(this, arguments, result, hookValue);
				} catch(e) {
					//	TODO: Something better with this
					console.error(e);
				}

				return hookResult || result;
			});
		},
		async: {
			around: function(method, hookBefore, hookAfter){
				var hookValue = {};

				try {
					hookBefore(method, hookValue);
				} catch(e) {
					//	TODO: Something better with this
					console.error(e);
				}

	    		return proxify(method, function(){
					var result = method.apply(this, arguments),
	    				hookResult;
					try {
						hookResult = hookAfter(method, arguments, hookValue);
					} catch(e) {
						//	TODO: Something better with this
						console.error(e);
					}

	    			//	Finish tracking
	    			return hookResult || result;
	    		});
			}
		}
	},
	//	Proxy implementations
	proxies = {
		after: function(obj, methods, hook) {
			if(!obj) {
				return false;
			}

			methods = util.isArray(methods)? methods: [methods];

			methods.forEach(function(methodName) {
				var method = obj[methodName];
				if(!method || !util.isFunction(method)) {
					return;
				}

				obj[methodName] = functions.after(method, hook);
			});
		},
		around: function(obj, methods, hookBefore, hookAfter) {
			if(!obj) {
				return false;
			}

			methods = util.isArray(methods)? methods: [methods];

			methods.forEach(function(methodName) {
				var method = obj[methodName];
				if(!method) {
					return;
				}

				obj[methodName] = functions.around(method, hookBefore, hookAfter);
			});
		}
	};

//  Expose proxies
module.exports = {
	functions: functions,
	proxies: proxies
};