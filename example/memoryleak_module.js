var theThing = null;
var replaceThing = function() {
	var originalThing = theThing;
	var unused = function () {
		if (originalThing)
			console.log("hi");
	};
	theThing = {
		//	This is the leak
		longStr: new Array(1000000).join('*'),
		someMethod: function () {
			console.log(someMessage);
		}
	};
};
var someThing = function(cb){
	setTimeout(function(){
		cb('from someThing');
	}, 3000);
};

module.exports = {
	replaceThing: replaceThing,
	someThing: someThing
};