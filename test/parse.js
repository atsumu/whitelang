'use strict';

const Parse = require('../src/parse');
const Scan = require('../src/scan');
const util = require('util');

var scanned = Scan.top('1 + 2 + 3');
var node = Parse.top(scanned.tokens);
console.log(node.show());
//console.log(util.inspect(node, false, null, true));
