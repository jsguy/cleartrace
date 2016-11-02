var fs = require('fs'),
	minimist = require('minimist'),
	util = require('./util.js'),
	argv,
	error = function(){
		console.error.apply(console, arguments);
	},
	usage = function(){
		var instructions = 
			"CLEARTRACE: Identify memory and processor usage of functions and modules.\n\n"+

			"USAGE:\n" + 
			"    cleartrace FILENAME -[s][o][f][n][l][d]\n\n" +

			"WHERE:\n" +
			"    -s Sort by one of 'slow' or 'rss', default is 'slow'\n" +
			"    -o Sort order, either 'd' for Descending or 'a' for Ascending, default is 'd'\n" +
			"    -f Filter by one of 'rss' or 'funcName', default is 'rss'\n" +
			"    -n Filter name for when using the 'funName' filter\n" +
			"    -r Filter threshold in bytes for when using the 'rss' filter, default is 100000\n" +
			"    -l Limit the results, default is 100, set to 0 for no limit\n" +
			"    -d Data format, one of 'human' or 'json' default is 'human', use 'json' to get the full trace for each matched entry\n" +
			"    -r Run a bespoke report instead, eg: -r 'memoryleak', look in the lib/reports directory for available reports\n\n" +

			"NOTE: 'rss' is the 'Resident Set Size' and is used to show how much memory is allocated to a process in RAM. It includes all stack and heap memory; in cleartrace, we record the difference in RSS before and after a given function ran, so this is especially useful for finding memory leaks and memory hungry functions.\n\n" +

			"Example usages (assuming you log file is app.log.json)\n\n"+
			"Find top 10 slowest functions:\n" +
			"    cleartrace app.log.json -l 10\n"+
			"Find top 10 memory use functions:\n"+
			"    cleartrace app.log.json -s rss -l 10\n"+
			"Find top 50 rss memory usage for a particular function ('readFileSync'), show results in JSON format:\n"+
			"    cleartrace app.log.json -s rss -f 'funcName' -n readFileSync -l 50 -d json\n";

		console.log(instructions);
	};
	//	We just read the whole thing into memory
	//	TODO: would be better if we could stream it, so we don't use so much memory
	getLog = function(path){
        var obj = fs.readFileSync(path, {encoding: 'utf8'});
		if(obj[obj.length-1] == "\n"){
			obj = obj.substr(0,obj.length-1);
		}
		var result = JSON.parse("[" + obj.split("\n").join(",\n") + "]");
		return result;
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
				console.log(items[i].appName + "." + items[i].funcName + "\t" + util.humanFormat(items[i].rssdiff) + "\t" + timeDiff + "ms");
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
			limit = argv.l || 100,
			report = argv.r;

		sort.options.order = argv.o || sort.options.order;
		sort.options.type = argv.s || sort.options.type;
		filter.options.funcName = argv.n || filter.options.funcName;
		filter.options.type = argv.f || filter.options.type;

		dataFormat = argv.d || dataFormat;

		//	Load the file
		if(!fileName) {
			usage();
			process.exit(1);
		}
		obj = getLog(fileName);

		if(report) {
			var reportInstance = require('./reports/'+report+'.report.js');
			console.log(reportInstance(obj, dataFormat));
			process.exit(0);
		}

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