var repl = require('repl'),
	util = require('util');

Firebase = require('firebase');


root = new Firebase(process.env.FIREBASE_URL);
root.auth(process.env.FIREBASE_AUTH_SECRET);


test=root.child('test');

var last = null;
// A dirty, dirty hack to work around the Firebase client's minified symbols...
test.__proto__.__proto__.dump = function(depth) {
	this.once('value', function(snap) {
		last = snap.val();
		console.log(util.inspect(last, {
			colors: true,
			depth: typeof depth != 'undefined' ? depth : 2
		}));
	});
};

$ = function() {
	return last;
};



repl.start({});
