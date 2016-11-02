/*
	This report will try to detect potential memory leaks in individual functions, by ordering on top aggregated rssdiff.
*/
var util = require('../util.js');
module.exports = function(obj, dataFormat) {
	var funcs = {};
	obj.forEach(function(item) {
		var key = item.filename + ":" +item.funcName,
			o = funcs[key] = funcs[key] || {};
		o.rssdiff = o.rssdiff || 0;
		o.rssdiff += item.rssdiff;
		o.count = o.count || 0;
		o.count += 1;
	});

	//	Turn into array, sort by biggest diff, remove 0 rssdiff value entries
	var result = [];
	Object.keys(funcs).forEach(function(value, key){
		if(funcs[value].rssdiff > 0) {
			result.push({
				funcName: value,
				rssdiff: funcs[value].rssdiff,
				count: funcs[value].count
			});
		}
	});

	//	Sort decendingly
	result.sort(function(a, b){
		return b.rssdiff - a.rssdiff;
	});

	//	Make rssdiffs human readable
	result.forEach(function(item){
		item.rssdiff = util.humanFormat(item.rssdiff);
	});

	if(dataFormat == "human") {
		var humanResult = [];
		result.forEach(function(item){
			humanResult.push(item.rssdiff + "\t" + item.count + "\t" + item.funcName);
		});
		return humanResult.join("\n");
	}

	return result;
};