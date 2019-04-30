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
      s += c.show(indent + 2) + '\n';
    }
    s += i + `}`;
    return s;
  }
}

class ApplyAst extends BaseAst {
  static create(operator, args) {
    return new ApplyAst(operator, args);
  }
  constructor(operator, args) {
    super();
    this.type = 'ApplyAst';
    this.operator = operator;
    this.args = args;
  }
  show(indent = 0) {
    const i = ' '.repeat(indent);
    var s = i + 'ApplyAst {\n';
    s += i + '  operator:\n';
    s += this.operator.show(indent + 4) + '\n';
    s += i + '  args:\n';
    for (const c of this.args) {
      s += c.show(indent + 4) + '\n';
    }
    s += i + `}`;
    return s;
  }
}

class RefAst extends BaseAst {
  static create(context, text) {
    return new RefAst(context, text);
  }
  constructor(context, text) {
    super();
    this.type = 'RefAst';
    this.subtype = context;
    this.text = text;
  }
  show(indent = 0) {
    const i = ' '.repeat(indent);
    var s = i + `RefAst ${this.subtype} '${this.text}'`;
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
    var s = i + `StringAst '${this.text}'`;
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

function args(t) {
  const as = [];
  for (const c of t.children) {
    as.push(any(c));
  }
  return as;
}

function any(t) {
  if (t.type === 'infix0' ||
      t.type === 'infix1' ||
      t.type === 'infix2' ||
      false) {
    return ApplyAst.create(any(t.children[1]), [any(t.children[0]), any(t.children[2])]);
  }
  if (t.type === 'apply') {
    return ApplyAst.create(any(t.children[0]), args(t.children[1]));
  }
  if (t.type === 'prefix') {
    return ApplyAst.create(any(t.children[0]), [any(t.children[1])]);
  }
  if (t.type === 'postfix') {
    return ApplyAst.create(any(t.children[1]), [any(t.children[0])]);
  }
  if (t.type === 'braceBlock' ||
      t.type === 'bracketBlock' ||
      t.type === 'parenBlock' ||
      false) {
    return stmts(t.children[1], t.type);
  }
  if (t.type === 'token') {
    if (t.token.type === 'symbol' ||
        t.token.type === 'inop0' ||
        t.token.type === 'inop1' ||
        t.token.type === 'inop2' ||
        t.token.type === 'preop' ||
        t.token.type === 'postop' ||
        false) {
      return RefAst.create(t.token.type, t.token.text);
    }
    if (t.token.type === 'dstring' ||
        t.token.type === 'sstring') {
      return StringAst.create(t.token.text);
    }
    throw new Error('unknown token context: ' + t.token.type);
  }
  throw new Error('unknown node type: ' + t.type);
}

module.exports = { fromNode };
