'use strict';

const { Scan } = require('../src/scan');
const Parse = require('../src/parse');
const Ast = require('../src/ast');

var tokens = Scan.top('1 + 2 + 3');
var node = Parse.top(tokens);
console.log(node.show());
var ast = Ast.fromNode(node);
console.log(ast.show());
