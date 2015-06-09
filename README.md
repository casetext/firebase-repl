firebase-repl
=============

A simple Firebase client REPL.  Expects `FIREBASE_URL` and `FIREBASE_AUTH_SECRET` to be in your environment.

This should be installed globally.

    npm install -g firebase-repl

Then type `fbrepl` to start.

Extras
------

firebase-repl adds a few bonus functions:

- `root` - a ref to the root of your Firebase.
- `fp` - a `Fireproof` ref to the root.
- `Firebase#dump([depth])` - prints the current value of a ref to the console.  `depth` tells `util.inspect` how deep to go into the object graph.  Example:

        root.child('foo').dump();

- `Firebase#count()` - prints the number of keys present in the value.
- `Firebase#has(key)` - prints the child keys which have a grandchild named `key`.
- `Firebase#compareKeys(jsonFile)` - reads an array of keys from a JSON file on disk and prints the name of keys in Firebase that are not named in the array.
- `$()` - returns the value from the last `dump()` call.