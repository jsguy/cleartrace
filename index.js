//	
//	Cleartrace - get insight into your node app
//
var fs = require('fs'),
	bunyan = require('bunyan'),
	RotatingFileStream = require('bunyan-rotating-file-stream'),
	cpu = require('./lib/cpu.js'),
	heap = require('./lib/heap.js'),
	util = require('./lib/util.js'),
	logparser = require('./lib/logparser.js'),
	//	We always load this proxy, though you can set it to not autostart
	requireproxy = require('./lib/proxies/require.proxy.js'),
	options = {
		appName: null,
		proxies: ['async'],
		log: {
			path: "./",
			name: "log.json",
			period: "1d",
			totalFiles: 10,
			rotateExisting: true,
			totalSize: "100m",
			threshold: "10m",
			gzip: true
		},
		writeInterval: 5,
		cpu: {
			autoStart: false
		},
		heap: {
			autoStart: false
		},
		proxy: {
			autoStart: true,
			useNativeProxy: true,
			nodeModules: "node_modules",
			skipNodeModules: true
		}
	},
	log,
	isInitialised = false,
	emit = function(obj){
		obj = obj || {};
		obj.appName = obj.appName || options.appName;
		log.info(obj);
	};

//  Init and schedule profiler runs
module.exports.init = function (args) {
	if(isInitialised) {
		console.warn("Cleartrace: was already initialised, aborting.")
		return false;
	}
	isInitialised = true;
	args = args || {};
	options = util.def(options, args);

    if(!options.appName) {
    	console.warn("Cleartrace: You must specify an application name");
    }

	//	Grab the cpu and heap tracker
	var cpuProfiler = cpu.init(options.cpu),
		heapProfiler = heap.init(options.heap),
		result = {};

	//	Setup bunyan with a rotating file stream
	log = bunyan.createLogger({
		name: options.appName,
		streams: [{
            type: 'raw',
            stream: new RotatingFileStream({
	        	path: options.log.path + options.appName + "." +options.log.name,
		        period: options.log.period,
	    	    totalFiles: options.log.totalFiles,
                rotateExisting: options.log.rotateExisting,
                threshold: options.log.threshold,
                totalSize: options.log.totalSize,
                gzip: options.log.gzip
            })
        }]
    });

	//	Grab any extra proxies
	for(var i = 0; i < options.proxies; i += 1) {
		var proxyPath = './lib/proxies/' + options.proxies[i] + '.proxy.js';
		try {
			fs.accessSync(proxyPath);
		} catch (e) {
			// Must be external
			proxyPath = options.proxies[i];
		}
		result[options.proxies[i]] = require(proxyPath);

		//	Initialise our proxy
		result[options.proxies[i]].init(emit);
	}

	//	Setup the require proxy last, so 
	//	nothing is logged incorrectly
    requireproxy.init(options.proxy, emit);

    result.require = requireproxy;
	result.cpu = cpuProfiler;
    result.heap = heapProfiler;

    return result;
};

//	If via command line, pass to logparser
if (require.main === module) {
	logparser();
}