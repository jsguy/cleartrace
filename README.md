# ClearTrace

Identify memory and processor usage of functions and modules in node.js

## Installation

```javascript
npm install cleartrace
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
	* **period** - how often to rotate the logs, default is "1d"
	* **count** - how many log files to keep, default is 10
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

