# Cleartrace

Identify memory and processor usage of functions and modules in node.js

## Installation

It is recommended to install cleartrace globally, so you get access to the log parsing functionality

```javascript
npm install cleartrace -g
```

## Getting started

**NOTE:** Make sure your require and initialise cleartrace as __THE FIRST MODULE__, as it won't trace the modules that were loaded before it.

```javascript
var ct = require('cleartrace').init({
	appName: "myApp"
});
```

You can set the following options

* **appName** - This is required, we won't log anything without an appName
* **log** - An object that configures the logging
	* **path** - Where to store the log, default is "./"
	* **name** - Base name of the file, it will be appName + log.name, default is "log.json"
	* **period** - How often to rotate the logs, default is "1d"
	* **totalFiles** - How many log files to keep, default is 10
	* **rotateExisting** - Do we rotate existing files, default is true
	* **totalSize** - How much space to allow in total for all log files, default is "100m"
	* **threshold** - How much space to allow per file, default is "10m"
	* **gzip** - Should we gzip rotated files, default is true
* **proxy** - An object to configure how the 'require' proxy works
	* **autoStart** - Should we start capturing proxied info straight away, default is true
* **proxies** - An array of other proxies to load, default is ['async'], you can add custom proxies here

## Usage

By default, we will capture module and function information, however any async methods that you employ should be captured on an individual basis with the "async" method:

```
cleartrace.async(CALLBACK)
```

For example:

```javascript
var ct = require('cleartrace').init({
	appName: "myApp"
});
//	Install our async callback proxy
//	Passing in optional (but very useful) parameters
myAsyncFunction(ct.async(callbackFunction, {
	origin: "function",
	filename: require.resolve('./mymodule.js')
}));
```

**NOTE:** This MUST be called inline, ie: don't call it before the callback would normally be called, so stuff like this won't work:

```javascript
//	THIS WON'T WORK, SO DON'T DO IT!
var wontBeTracedCallback = ct.async(callbackFunction);
myAsyncFunction(wontBeTracedCallback);
```

## Parsing the logs

In order to parse the log, and find useful information, you can use cleartrace from the commandline. 

### Examples

Find top 3 slowest functions

```bash
cleartrace myApp.log.json -l 3
```

Output:

```
myApp.myFunction	556.0 kB	209ms
myApp.myFunction	528.0 kB	198ms
myApp.myFunction	432.0 kB	128ms
```

The columns shown are: method, rss, time

Find top 3 memory use functions

```bash
cleartrace myApp.log.json -s rss -l 3
```

Output:

```
myApp.myFunction	1256.0 kB	209ms
myApp.myFunction	1238.2 kB	198ms
myApp.myFunction	1211.4 kB	128ms
```

Find top 3 rss memory usage for a particular function ('myFunction'), show results in JSON format

```bash
cleartrace myApp.log.json -s rss -f 'funcName' -n 'myFunction' -l 3 -d json
```

```json
[
{"name":"myApp","hostname":"localhost","pid":10815,"level":30,"origin":"object","filename":"/myApp/app.js","funcName":"myFunction","before":{"time":"2016-11-02T05:10:32.108Z","memory":{"rss":64540672,"heapTotal":54915424,"heapUsed":24459040}},"indent":1992,"after":{"time":"2016-11-02T05:10:32.109Z","memory":{"rss":64610304,"heapTotal":54915424,"heapUsed":24527704}},"rssdiff":69632,"appName":"myApp","msg":"","time":"2016-11-02T05:10:32.109Z","v":0},
{"name":"myApp","hostname":"localhost","pid":10815,"level":30,"origin":"object","filename":"/myApp/app.js","funcName":"myFunction","before":{"time":"2016-11-02T05:10:48.008Z","memory":{"rss":74342400,"heapTotal":54915424,"heapUsed":26868360}},"indent":2943,"after":{"time":"2016-11-02T05:10:48.009Z","memory":{"rss":74412032,"heapTotal":54915424,"heapUsed":26939008}},"rssdiff":69632,"appName":"myApp","msg":"","time":"2016-11-02T05:10:48.009Z","v":0},
{"name":"myApp","hostname":"localhost","pid":10815,"level":30,"origin":"object","filename":"/myApp/app.js","funcName":"myFunction","before":{"time":"2016-11-02T05:10:34.239Z","memory":{"rss":66646016,"heapTotal":54915424,"heapUsed":26611704}},"indent":2104,"after":{"time":"2016-11-02T05:10:34.239Z","memory":{"rss":66711552,"heapTotal":54915424,"heapUsed":26680256}},"rssdiff":65536,"appName":"myApp","msg":"","time":"2016-11-02T05:10:34.239Z","v":0}
]
```

As you can see, in JSON format, we get all the details - you can use this to create graphs or export the data for a dashboard, etc...

**NOTE:** Run the tool on the commandline for more details on how to use it, theres also the option to execute bespoke reports, see /lib/reports/memoryleak.report.js for an example.