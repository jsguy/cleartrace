/* Proxy functionality */
var isFunction = function(a) {
		return typeof a === 'function';
	},
	isArray = function(a) {
		return (!!a) && (a.constructor === Array);
	},
	isObject = function(a) {
		return (!!a) && (a.constructor === Object);
	},
	//	Proxy functions
	proxyFunctions = {
		after: function(method, hook){
			return function() {
				var result = method.apply(this, arguments),
					hookResult;
				try {
					hookResult = hook(this, arguments, result);
				} catch(e) {
					//	TODO: Something better with this
					console.error(e);
				}

				return hookResult || result;
			};
		},
		around: function(method, hookBefore, hookAfter){
			return function() {
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
			};
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

	    		return function(){
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
	    		}
			}
		}
	},
	//	Proxy implementations
	proxies = {
		after: function(obj, methods, hook) {
			if(!obj) {
				return false;
			}

			methods = isArray(methods)? methods: [methods];

			methods.forEach(function(methodName) {
				var method = obj[methodName];
				if(!method) {
					return;
				}

				obj[methodName] = proxyFunctions.after(method, hook);
			});
		},
		around: function(obj, methods, hookBefore, hookAfter) {
			if(!obj) {
				return false;
			}

			methods = isArray(methods)? methods: [methods];

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