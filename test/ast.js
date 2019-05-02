'use strict';

const Scan = require('../src/scan');
const Parse = require('../src/parse');
const Ast = require('../src/ast');

//var scanned = Scan.top('1 + 2 + 3');
var scanned = Scan.top('a.b.c.d');
var node = Parse.top(scanned.tokens);
console.log(node.show());
var ast = Ast.fromNode(node);
console.log(Ast.show(ast));
