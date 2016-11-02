//	
//	Cleartrace - get insight into your node app
//
var fs = require('fs'),
	bunyan = require('bunyan'),
	cpu = require('./lib/cpu.js'),
	heap = require('./lib/heap.js'),
	util = require('./lib/util.js'),
	logparser = require('./lib/logparser.js'),
	requireproxy = require('./lib/proxies/require.proxy.js'),
	asyncproxy = require('./lib/proxies/async.proxy.js'),
	options = {
		appName: null,
		log: {
			path: "./",
			name: "log.json",
			period: "1d",
			count: 10
		},
		writeInterval: 5,
		cpu: {
			autoStart: false
		},
		heap: {
			autoStart: false
		},
		proxy: {
			autoStart: true
		}
	},
	log,
	emit = function(obj){
		obj = obj || {};
		obj.appName = obj.appName || options.appName;
		log.info(obj);
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

	//	Setup bunyan
	log = bunyan.createLogger({
		name: options.appName,
		streams: [{
			type: 'rotating-file',
        	path: options.log.path + options.appName + "." +options.log.name,
	        period: options.log.period,
    	    count: options.log.count
    	}]
    });

	//	Setup the require proxy last, so 
	//	nothing is logged incorrectly
    requireproxy.init(options.proxy, emit);

    return {
    	async: asyncproxy.init(emit),
    	cpu: cpuProfiler,
    	heap: heapProfiler
    };
};

//	If via command line, pass to logparser
if (require.main === module) {
	logparser();
}