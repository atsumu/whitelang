'use strict';

const { Parse } = require('../src/parse');
const { Scan } = require('../src/scan');

var tokens = Scan.top('a');
var node = Parse.top(tokens);
console.log(node);
