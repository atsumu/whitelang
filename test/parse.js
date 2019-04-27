'use strict';

const { Parse } = require('../src/parse');
const { Scan } = require('../src/scan');
const util = require('util');

var tokens = Scan.top('1 + 2 + 3');
var node = Parse.top(tokens);
console.log(node.show());
//console.log(util.inspect(node, false, null, true));
