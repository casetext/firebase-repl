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
		doDump([last], depth);
	});
};


var stashes = [];
Ref.stash = function() {
	this.once('value', function(snap) {
		var val = snap.val();
		stashes.push(val);
		if (val && typeof val == 'object') {
			console.log('Stashed object with ' + Object.keys(val).length + ' keys!');
		} else {
			console.log('Stashed non-object!');
		}
	});
};

dumpStash = function(file) {
	doDump(stashes, file);
	stashes = [];
}

function doDump(data, depth) {
	if (typeof depth == 'string') {
		if (depth.substr(-4) == '.csv') {

			var out = [];

			data.forEach(function(item) {
				if (!Array.isArray(item)) {
					for (var k in item) {
						var row = { _key: k };
						if (typeof item[k] == 'object') {
							for (var prop in item[k]) {
								row[prop] = item[k][prop];
							}
						} else {
							row._value = item[k];
						}
						out.push(row);
					}
				} else {
					out.push.apply(out, item);
				}
			});


			json2csv({
				data: out,
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
		data.forEach(function(item, i) {
			if (i > 0) console.log('--------------------');
			console.log(util.inspect(item, {
				colors: true,
				depth: typeof depth != 'undefined' ? depth : 2
			}));
		});
	}
}

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
