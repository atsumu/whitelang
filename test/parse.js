'use strict';

const Parse = require('../src/parse');
const Scan = require('../src/scan');
const util = require('util');

var scanned = Scan.top('a.b.c.d');
var node = Parse.top(scanned.tokens);
console.log(node.show());
//console.log(util.inspect(node, false, null, true));
