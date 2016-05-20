#!/usr/bin/env node

var repl = require('repl'),
	util = require('util'),
	json2csv = require('json2csv'),
	fs = require('fs');

Firebase = require('firebase');
Fireproof = require('fireproof');


root = new Firebase(process.env.FIREBASE_URL);
root.auth(process.env.FIREBASE_AUTH_SECRET);

Fireproof.bless(require('q'));

fp = new Fireproof(root);

test=root.child('test');

var last = null;
// A dirty, dirty hack to work around the Firebase client's minified symbols...
var Ref = test.__proto__.__proto__;

Ref.dump = function(depth) {
	this.once('value', function(snap) {
		last = snap.val();
		if (typeof depth == 'string') {
			if (depth.substr(-4) == '.csv') {
				var data = last;
				if (!Array.isArray(data)) {
					data = [];
					for (var k in last) {
						var row = { _key: k };
						if (typeof last[k] == 'object') {
							for (var prop in last[k]) {
								row[prop] = last[k][prop];
							}
						} else {
							row._value = last[k];
						}
						data.push(row);
					}
				}
				json2csv({
					data: data,
					flatten: true
				}, function(err, csv) {
					if (err) console.error('Could not generate CSV', err);
					else fs.writeFile(depth, csv, function(err) {
						if (err) console.error('Could not write CSV', err);
						else console.log('Dumped to CSV');
					});
				});
			} else {
				fs.writeFile(depth, JSON.stringify(last, null, '\t'), function(err) {
					if (err) console.error('Could not dump to file', err);
					else console.log('Dumped to file');
				});
			}
		} else {
			console.log(util.inspect(last, {
				colors: true,
				depth: typeof depth != 'undefined' ? depth : 2
			}));
		}
	});
};

Ref.get = function() {
	this.once('value', function(snap) {
		last = snap.val();
		console.log('ok');
	});
};

Ref.count = function() {
	this.once('value', function(snap) {
		var o = snap.val(), i = 0;
		for (var k in o) i++;
		console.log(i);
	});
};

Ref.has = function(key) {
	this.once('value', function(snap) {
		var o = snap.val(), i = 0;
		for (var k in o) {
			if (key in o[k]) {
				++i;
				console.log(k);
			}
		}
		console.log('Total =', i);
	});
}

Ref.compareKeys = function(json) {
	this.once('value', function(snap) {
		var o = snap.val(),
			arr = JSON.parse(fs.readFileSync(json)),
			c = {};

		for (var i = 0; i < arr.length; i++) {
			c[arr[i]] = true;
		}
		for (var k in o) {
			if (!c[k]) console.log(k);
		}
	});
};

$ = function() {
	return last;
};



repl.start({});
