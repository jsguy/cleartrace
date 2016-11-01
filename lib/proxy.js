/* Proxy functionality */
var util = require("./util.js"),
	//	Set the prototype and attributes
	clone = function(obj, target) {
		target.prototype = obj;

		//	Clone any attributes
		for(var i in obj) {
			target[i] = obj[i];
		}

		return target;
	},
	//	Proxy functions
	proxyFunctions = {
		after: function(method, hook){
			return clone(method, function() {
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
			return clone(method, function() {
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

	    		return clone(method, function(){
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

				obj[methodName] = proxyFunctions.after(method, hook);
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

				obj[methodName] = proxyFunctions.around(method, hookBefore, hookAfter);
			});
		}
	};

//  Expose proxies
module.exports = {
	functions: proxyFunctions,
	proxies: proxies
};