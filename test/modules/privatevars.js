'use strict';

var Me = function() {
  this.init();
};

Me.prototype.init = function() {
  console.log('init');
};

module.exports = Me;