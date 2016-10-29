module.exports = {
	def: function(obj1, obj2) {
		for(var i in obj2) {if(obj2.hasOwnProperty(i)){
			obj1[i] = obj2[i];
		}}
		return obj1;
	},
    toMB: function(bytes){
        return bytes / 1048576;
    },
	isFunction: function(a) {
		return typeof a === 'function';
	},
	isArray: function(a) {
		return (!!a) && (a.constructor === Array);
	},
	isObject: function(a) {
		return (!!a) && (a.constructor === Object);
	},
	getFuncName: function(a, defaultName) {
		defaultName = defaultName || "anonymous";
		return a.prototype?
    		a.prototype.name?
    			a.prototype.name:
    			a.name? 
    				a.name:
    				defaultName: 
			defaultName;
    },
    //	The default trace object
    createTrace: function(obj){
    	obj = obj || {};
		return module.exports.def({
			time: (new Date()).toISOString(),
			memory: process.memoryUsage()
		}, obj);
    }
};