var fs = require('fs'),
	minimist = require('minimist'),
	argv,
	error = function(){
		console.error.apply(console, arguments);
	},
	usage = function(){
		console.log("Usage goes here");
	};
	getLog = function(path){
        var obj = fs.readFileSync(path, {encoding: 'utf8'});
		if(obj[obj.length-1] == "\n"){
			obj = obj.substr(0,obj.length-1);
		}
		var result = JSON.parse("[" + obj.split("\n").join(",\n") + "]");
		return result;
	}, 
	//	Ref: http://stackoverflow.com/a/14919494/6637332
	hfs = function(bytes) {
		var thresh = 1024;
		if(Math.abs(bytes) < thresh) {
			return bytes + ' B';
		}
		var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
		var u = -1;
		do {
			bytes /= thresh;
			++u;
		} while(Math.abs(bytes) >= thresh && u < units.length - 1);
		return bytes.toFixed(1)+' '+units[u];
	},
	dataFormat = "human",
	showLogLines = function(items){
		if(!Array.isArray(items)) {
			items = [items];
		}

		if(dataFormat == "json") {
			console.log("[");
		}

		for(var i = 0; i < items.length; i += 1) {
			var timeDiff = (new Date(items[i].after.time)) - (new Date(items[i].before.time));
			if(dataFormat == "human") {
				console.log(items[i].appName + "." + items[i].funcName + "\t" + hfs(items[i].rssdiff) + "\t" + timeDiff + "ms");
			} else {
				var comma = (i == items.length -1? "": ",");
				console.log(JSON.stringify(items[i]) + comma);
			}
		}

		if(dataFormat == "json") {
			console.log("]");
		}
	},
	obj = [],
	sort = {
		options: {
			type: "slow",
			order: "d"
		},
		slow: function(a,b){
			var timeDiffA = (new Date(a.after.time)) - (new Date(a.before.time)),
				timeDiffB = (new Date(b.after.time)) - (new Date(b.before.time));
			return sort.options.order == "d"?
				timeDiffB - timeDiffA:
				timeDiffA - timeDiffB;
		},
		rss: function(a,b){
			return b.rssdiff - a.rssdiff;
		}
	},
	filter = {
		options: {
			type: "rss",
			funcName: null,
			rssThreshold: 100000
		},
		rss: function(item){
			return item.rssdiff > filter.options.rssThreshold;
		},
		funcName: function(item){
			return filter.options.funcName?
				item.funcName === filter.options.funcName:
				true;
		}
	},
	parseLog = function(){
		argv = minimist(process.argv.slice(2));

		//	Setup parameters
		var fileName = argv._[0] || argv.i,
			limit = argv.l || null;

		sort.options.order = argv.o || sort.options.order;
		sort.options.type = argv.s || sort.options.type;
		filter.options.funcName = argv.n || filter.options.funcName;
		filter.options.type = argv.f || filter.options.type;

		dataFormat = argv.d || dataFormat;

		//	Load the file
		if(!fileName) {
			error("Missing filename");
			usage();
			process.exit(1);
		}
		obj = getLog(fileName);

		//	filter
		var result = obj.filter(filter[filter.options.type]);

		if(!result) {
			error("No matching log entries");
			process.exit(0);
		} else {
			if(! Array.isArray(result)) {
				result = [result];
			}
		}

		//	Sort
		result.sort(sort[sort.options.type]);

		if(limit) {
			result.splice(limit);
		}

		showLogLines(result);
	};

module.exports = parseLog;