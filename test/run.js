'use strict';

const { Scan } = require('../src/scan');
const { Parse } = require('../src/parse');
const { Run } = require('../src/run');

var tokens = Scan.top('1 + 2 + 3');
var node = Parse.top(tokens);
console.log(node.show());
var run = Run.create();
var result = run.top(node);
console.log(result);
console.log(run);
