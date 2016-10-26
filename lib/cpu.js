/*
    CPU profile module

    Collects a CPU profile, optionally at a given interval.

    ref: https://gist.github.com/danielkhan/9cfa77b97bc7ba0a3220
    ref: http://apmblog.dynatrace.com/2016/01/14/how-to-track-down-cpu-issues-in-node-js/
*/
var fs = require('fs'),
    profiler = require('v8-profiler'),
    util = require('./util.js'),
    options = {
        dataDir: ".",
        interval: 30,
        autoStart: true,
        profileTime: 5,
        verbose: false
    },
    //  Write to stdout, to bypass eventloop
    emit = function(message){
        if(options.verbose) {
            fs.writeSync(1, message);
        }
    },
    //  Starts profiling and schedules its end
    startProfiling = function(profileTime) {
        var id = 'profile-' + Date.now();

        emit('Start profiler with Id [' + id + ']\n');

        // Start profiling
        profiler.startProfiling(id);

        // Schedule stop of profiling in x seconds
        setTimeout(function () {
            stopProfiling(id)
        }, (profileTime? profileTime: options.profileTime * 1000));
    },
    //  Stops the profiler and writes the data to a file
    stopProfiling = function(id) {
        var profile = profiler.stopProfiling(id);
        fs.writeFile(options.dataDir + '/' + id + '.cpuprofile', JSON.stringify(profile), function () {
            emit('Profiler data written');
        });
    };

//  Init and schedule profiler runs
module.exports.init = function (args) {
    options = util.def(options, args);
    if(options.autoStart) {
        setInterval(startProfiling, options.interval * 1000);
    }
    return {
        profile: startProfiling
    };
};