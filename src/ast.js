'use strict';

// block
// apply
// string
// symbol

class BaseAst {
  show(indent = 0) {
    throw new Error('implementation is required.');
  }
}

class BlockAst extends BaseAst {
  static create(subtype, children) {
    return new BlockAst(subtype, children);
  }
  constructor(subtype, children) {
    super();
    this.type = 'BlockAst';
    this.subtype = subtype;
    this.children = children;
  }
  show(indent = 0) {
    const i = ' '.repeat(indent);
    var s = i + `BlockAst ${this.subtype} {\n`;
    for (const c of this.children) {
      s += c.show(indent + 2);
    }
    s += i + `}\n`;
    return s;
  }
}

class ApplyAst extends BaseAst {
  static create(subtype, operator, args) {
    return new ApplyAst(subtype, operator, args);
  }
  constructor(subtype, operator, args) {
    super();
    this.type = 'ApplyAst';
    this.subtype = subtype;
    this.operator = operator;
    this.args = args;
  }
  show(indent = 0) {
    const i = ' '.repeat(indent);
    var s = i + `ApplyAst ${this.subtype} ${this.operator.text} {\n`;
    for (const c of this.args) {
      s += c.show(indent + 2);
    }
    s += i + `}\n`;
    return s;
  }
}

class SymbolAst extends BaseAst {
  static create(text) {
    return new SymbolAst(text);
  }
  constructor(text) {
    super();
    this.type = 'SymbolAst';
    this.subtype = 'symbol';
    this.text = text;
  }
  show(indent = 0) {
    const i = ' '.repeat(indent);
    var s = i + `SymbolAst ${this.text}\n`;
    return s;
  }
}

class StringAst extends BaseAst {
  static create(text) {
    return new StringAst(text);
  }
  constructor(text) {
    super();
    this.type = 'StringAst';
    this.text = text;
  }
  show(indent = 0) {
    const i = ' '.repeat(indent);
    var s = i + `StringAst '${this.text}'\n`;
    return s;
  }
}

function fromNode(node) {
  return stmts(node, 'topBlock');
}

function stmts(t, subtype) {
  const cs = [];
  for (const c of t.children) {
    if (c.children.length >= 2) {
      cs.push(stmt(c));
    }
  }
  return BlockAst.create(subtype, cs);
}

function stmt(t) {
  return any(t.children[1]);
}

function any(t) {
  if (t.type === 'infix0' ||
      t.type === 'infix1' ||
      t.type === 'infix2' ||
      false) {
    return ApplyAst.create(t.type, any(t.children[1]), [any(t.children[0]), any(t.children[2])]);
  }
  if (t.type === 'apply') {
    return ApplyAst.create(t.type, any(t.children[0]), args(t.children[1]));
  }
  if (t.type === 'prefix') {
    return ApplyAst.create(t.type, any(t.children[0]), [any(t.children[1])]);
  }
  if (t.type === 'postfix') {
    return ApplyAst.create(t.type, any(t.children[1]), [any(t.children[0])]);
  }
  if (t.type === 'operand') {
    return any(t.children[0]);
  }
  if (t.type === 'braceBlock' ||
      t.type === 'bracketBlock' ||
      t.type === 'parenBlock' ||
      false) {
    return stmts(t.children[1], t.type);
  }
  if (t.type === 'symbol') {
    return SymbolAst.create(t.token.text);
  }
  if (t.type === 'string') {
    return StringAst.create(t.token.text);
  }
  //if (t.type === 'token') {
  //  return {
  //    type: 'token',
  //    text: t.text,
  //  };
  //}
  throw new Error('unknown node type: ' + t.type);
}

function args(t) {
  const as = [];
  for (const c of t.children) {
    as.push(any(c));
  }
  return as;
}

module.exports = { fromNode };
