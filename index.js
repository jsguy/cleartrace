//	
//	Cleartrace - get insight into your node app
//
var fs = require('fs'),
	cpu = require('./lib/cpu.js'),
	heap = require('./lib/heap.js'),
	util = require('./lib/util.js'),
	requireproxy = require('./lib/proxies/require.proxy.js'),
	asyncproxy = require('./lib/proxies/async.proxy.js'),
	options = {
		appName: null,
		log: {
			path: "./",
			name: "log.json",
			maxSizeMb: 10,//0.01,
			tabsize: 4,
			rotate: true
		},
		writeInterval: 5,
		cpu: {
			autoStart: false
		},
		heap: {
			autoStart: false
		},
		proxy: {},
		async: {}
	},
	emitQueue = [],
	emitStart = (new Date()).getTime(),
	isWritingLogFile = false,
	rotateLog = function(logContents){
		var logs = JSON.parse("[" + logContents + "]");
		logs.splice(0,1);
		for(var i = 0; i < logs.length; i += 1) {
			logs[i] = JSON.stringify(logs[i]);
		}
		return logs.join(",");
	},
	emit = function(obj){
		obj.appName = obj.appName || options.appName;
		//	This needs to store the values somewhere
		//console.log(obj);

		if(!isWritingLogFile && (new Date()).getTime() - emitStart >= options.writeInterval*1000) {
			//console.log('write log file');
			var fileExists = false,
				fileName = options.log.path + options.appName + "." +options.log.name,
				fStats;
			try{
				fStats = fs.statSync(fileName);
				fileExists = true;
				if((fStats.size/(1024*1024)) >= options.log.maxSizeMb) {
					//	Rotate logs
					isWritingLogFile = true;
					var rotatedLogEntries = rotateLog(fs.readFileSync(fileName, 'utf8'));
					fs.writeFileSync(fileName, rotatedLogEntries, {encoding: "utf8"});
				}
			} catch(ex){
				//	The file does not exist
			}

			isWritingLogFile = true;
			fs.appendFile(fileName, (fileExists? ",": "") +"\n" + JSON.stringify(emitQueue, null, options.log.tabsize), "utf8", function(err){
				isWritingLogFile = false;
				emitStart = (new Date()).getTime();
				if(!err) {
					emitQueue = [];
				} else {
					console.log("Cleartrace: Logfile error", err);
				}
			});
		} else {
			emitQueue.push(obj);
		}
	};

//  Init and schedule profiler runs
module.exports.init = function (args) {
	args = args || {};
	options = util.def(options, args);

    if(!options.appName) {
    	console.warn("Cleartrace: You must specify an application name");
    }

	//	Grab the cpu and heap tracker
	var cpuProfiler = cpu.init(options.cpu),
		heapProfiler = heap.init(options.heap);

	//	Setup the require proxy last, so 
	//	nothing is logged incorrectly
    requireproxy.init(options.proxy, emit);

    return {
    	async: asyncproxy.init(options.async, emit),
    	cpu: cpuProfiler,
    	heap: heapProfiler
    };
};