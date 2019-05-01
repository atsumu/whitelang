'use strict';

const Scan = require('../src/scan');
const Parse = require('../src/parse');
const Ast = require('../src/ast');
const { Run } = require('../src/run');

var scanned = Scan.top('1 + 2 + 3');
var node = Parse.top(scanned.tokens);
console.log(node.show());
var ast = Ast.fromNode(node);
console.log(Ast.show(ast));
var run = Run.create();
var result = run.any(ast);
console.log(result);
