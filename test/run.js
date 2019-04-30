'use strict';

const { Scan } = require('../src/scan');
const Parse = require('../src/parse');
const Ast = require('../src/ast');
const { Run } = require('../src/run');

var tokens = Scan.top('1 + 2 + 3');
var node = Parse.top(tokens);
console.log(node.show());
var ast = Ast.fromNode(node);
console.log(ast.show());
var run = Run.create();
var result = run.any(ast);
console.log(result);
console.log(run);
