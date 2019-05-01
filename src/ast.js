'use strict';

function createBlockAst(subtype, children) {
  return {
    type: 'BlockAst',
    subtype,
    children,
  };
}

function createAssignAst(left, right) {
  return {
    type: 'AssignAst',
    left,
    right,
  }
}

function createApplyAst(operator, args) {
  return {
    type: 'ApplyAst',
    operator,
    args,
  };
}

function createRefAst(context, text) {
  return {
    type: 'RefAst',
    subtype: context,
    text,
  };
}

function createStringAst(text) {
  return {
    type: 'StringAst',
    text,
  };
}

function show(ast, indent = 0) {
  const i = ' '.repeat(indent);
  if (ast.type === 'BlockAst') {
    var s = i + `Block ${ast.subtype} {\n`;
    for (const c of ast.children) {
      s += show(c, indent + 2) + '\n';
    }
    s += i + `}`;
    return s;
  }
  if (ast.type === 'AssignAst') {
    var s = i + 'Assign {\n';
    s += i + '  left:\n';
    s += show(ast.left, indent + 4) + '\n';
    s += i + '  right:\n';
    s += show(ast.right, indent + 4) + '\n';
    s += i + `}`;
    return s;
  }
  if (ast.type === 'ApplyAst') {
    var s = i + 'Apply {\n';
    s += i + '  operator:\n';
    s += show(ast.operator, indent + 4) + '\n';
    s += i + '  args:\n';
    for (const c of ast.args) {
      s += show(c, indent + 4) + '\n';
    }
    s += i + `}`;
    return s;
  }
  if (ast.type === 'RefAst') {
    var s = i + `Ref ${ast.subtype} '${ast.text}'`;
    return s;
  }
  if (ast.type === 'StringAst') {
    var s = i + `String '${ast.text}'`;
    return s;
  }
  throw new Error('unknown ast type: ' + ast.type);
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
  return createBlockAst(subtype, cs);
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
  if (t.type === 'infix0') {
    return createAssignAst(any(t.children[0]), any(t.children[2]));
  }
  if (t.type === 'infix1' ||
      t.type === 'infix2' ||
      false) {
    return createApplyAst(any(t.children[1]), [any(t.children[0]), any(t.children[2])]);
  }
  if (t.type === 'apply') {
    return createApplyAst(any(t.children[0]), args(t.children[1]));
  }
  if (t.type === 'prefix') {
    return createApplyAst(any(t.children[0]), [any(t.children[1])]);
  }
  if (t.type === 'postfix') {
    return createApplyAst(any(t.children[1]), [any(t.children[0])]);
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
      return createRefAst(t.token.type, t.token.text);
    }
    if (t.token.type === 'dstring' ||
        t.token.type === 'sstring') {
      return createStringAst(t.token.text);
    }
    throw new Error('unknown token context: ' + t.token.type);
  }
  throw new Error('unknown node type: ' + t.type);
}

module.exports = { show, fromNode };
