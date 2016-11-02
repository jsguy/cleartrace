# Cleartrace

Identify memory and processor usage of functions and modules in node.js

## Installation

It is recommended to install cleartrace globally, so you get access to the log parsing functionality

```javascript
npm install cleartrace -g
```

## Getting started

Make sure your require and initialise cleartrace as THE FIRST MODULE, otherwise it won't trace modules that were loaded before it.

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
* **proxy** - An object to configure how the proxy works
	* **autoStart** - Should we start capturing proxied info straight away, default is true

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

**Note:** This MUST be called inline, ie: don't call it before the callback would normally be called, so stuff like this won't work:

```javascript
//	THIS WON'T WORK, SO DON'T DO IT!
var wontBeTracedCallback = ct.async(callbackFunction);
myAsyncFunction(wontBeTracedCallback);
```

## Parsing the logs

In order to parse the log, and find useful information, you can use cleartrace from the commandline. 

### Examples

Find top 10 slowest functions

```bash
cleartrace app.log.json -l 10
```

Find top 10 memory use functions

```bash
cleartrace app.log.json -s rss -l 10
```

Find top 50 rss memory usage for a particular function ('readFileSync'), show results in JSON format

```bash
cleartrace app.log.json -s rss -f 'funcName' -n readFileSync -l 50 -d json
```

Run the tool on the commandline for more details on how to use it.