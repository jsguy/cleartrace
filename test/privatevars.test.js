var ct = require('../../cleartrace').init({appName: "testinternal"});

var thething = require('./modules/privatevars.js');

new thething();


