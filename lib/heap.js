/*
    Heap snapshot module
    Ref: http://apmblog.dynatrace.com/2015/11/04/understanding-garbage-collection-and-hunting-memory-leaks-in-node-js/
*/
var fs = require('fs'),
    profiler = require('v8-profiler'),
    util = require('./util.js'),
    nextMBThreshold = 0,
    options = {
        dataDir: ".",
        interval: 0.5,
        autoStart: true,
        thresholdMB: 50,
        verbose: false
    },
    //  Write to stdout, to bypass eventloop
    emit = function(message){
        if(options.verbose) {
            fs.writeSync(1, message);
        }
    },
    //  Saves a heap snapshot
    saveHeapSnapshot = function() {
        var buffer = '';
        profiler.takeSnapshot('profile').serialize(
            function iterator(data, length) {
                buffer += data;
            }, function complete() {
                var name = Date.now() + '.heapsnapshot';
                fs.writeFile(options.dataDir + '/' + name , buffer, function () {
                    emit('Heap snapshot written to ' + name);
                });
            }
        );
    },
    //  Creates a heap snapshot if the current memory 
    //  increased by the threshold or more
    checkHeapSnapshot = function() {
        setImmediate(function () {
            var memMB = util.toMB(process.memoryUsage().rss);
            if (memMB > nextMBThreshold) {
                nextMBThreshold += options.thresholdMB;
                saveHeapSnapshot();
            }
        });
    };

//  Init and scheule heap Snapshot runs
module.exports.init = function (args) {
    options = util.def(options, args);
    if(options.autoStart) {
        setInterval(checkHeapSnapshot, options.interval * 1000);
    }
    return {
        saveSnapshot: saveHeapSnapshot
    };
};