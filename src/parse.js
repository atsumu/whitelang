'use strict';

class Node {
  static createNode(type, children) {
    return new Node(type, children, null, null);
  }
  static createToken(context, token) {
    return new Node('token', [], context, token);
  }
  constructor(type, children, context, token) {
    this.type = type;
    this.children = children;
    this.context = context;
    this.token = token;
  }
  show(indent = 0) {
    const i = ' '.repeat(indent);
    if (this.type === 'token') {
      const t = this.token;
      return i + `(${t.type} ${t.pos} ${this.context} '${t.text}')\n`;
    } else {
      var s = i + `${this.type} {\n`;
      for (const c of this.children) {
        s += c.show(indent + 2);
      }
      s += i + '}\n';
      return s;
    }
  }
}

function _debug(ts, p, n) {
  // console.log(n, p, ts[p]);
}

function result(n, p) {
  return { n, p };
}

function _token(ts, p, type) {
  _debug(ts, p, type);
  if (p < ts.length && ts[p].type === type) {
    return result(Node.createToken(type, ts[p]), p + 1);
  }
  return null;
}

function top(tokens) {
  _debug(tokens, 0, 'top');
  const r = stmts(tokens, 0);
  return r.n;
}

function stmts(ts, p) {
  _debug(ts, p, 'stmts');
  let r0;
  let ns = [];
  while (r0 = stmt(ts, p)) {
    ns.push(r0.n);
    p = r0.p;
  }
  return result(Node.createNode('stmts', ns), p);
}

function stmt(ts, p) {
  _debug(ts, p, 'stmt');
  let r0, r1;
  if ((r0 = bol(ts, p)) &&
      (r1 = exprIn0(ts, r0.p))) {
    return result(Node.createNode('stmt', [r0.n, r1.n]), r1.p);
  }
  if (r0 = bol(ts, p)) {
    return result(Node.createNode('stmt', [r0.n]), r0.p);
  }
  return null;
}

function exprIn0(ts, p) {
  _debug(ts, p, 'exprIn0');
  let r;
  if ((r = infix0(ts, p)) ||
      (r = exprIn1(ts, p))) {
    return result(r.n, r.p);
  }
  return null;
}

function exprIn1(ts, p) {
  _debug(ts, p, 'exprIn1');
  let r;
  if ((r = infix1(ts, p)) ||
      (r = exprApply(ts, p))) {
    return result(r.n, r.p);
  }
  return null;
}

function exprApply(ts, p) {
  _debug(ts, p, 'exprApply');
  let r;
  if ((r = apply(ts, p)) ||
      (r = exprIn2(ts, p))) {
    return result(r.n, r.p);
  }
  return null;
}

function exprIn2(ts, p) {
  _debug(ts, p, 'exprIn2');
  let r;
  if ((r = infix2(ts, p)) ||
      (r = exprPre(ts, p))) {
    return result(r.n, r.p);
  }
  return null;
}

function exprPre(ts, p) {
  _debug(ts, p, 'exprPre');
  let r;
  if ((r = prefix(ts, p)) ||
      (r = exprPost(ts, p))) {
    return result(r.n, r.p);
  }
  return null;
}

function exprPost(ts, p) {
  _debug(ts, p, 'exprPost');
  let r;
  if ((r = postfix(ts, p)) ||
      (r = operand(ts, p))) {
    return result(r.n, r.p);
  }
  return null;
}

function infix0(ts, p) {
  _debug(ts, p, 'infix0');
  let r0, r1, r2;
  if ((r0 = exprIn1(ts, p)) &&
      (r1 = inop0(ts, r0.p)) &&
      (r2 = exprIn0(ts, r1.p))) {
    return result(Node.createNode('infix0', [r0.n, r1.n, r2.n]), r2.p);
  }
  return null;
}

function infix1(ts, p) {
  _debug(ts, p, 'infix1');
  let r0, r1, r2;
  if ((r0 = apply(ts, p)) &&
      (r1 = inop1(ts, r0.p)) &&
      (r2 = exprIn1(ts, r1.p))) {
    return result(Node.createNode('infix1', [r0.n, r1.n, r2.n]), r2.p);
  }
  return null;
}

function apply(ts, p) {
  _debug(ts, p, 'apply');
  let r0, r1;
  if ((r0 = exprIn2(ts, p)) &&
      (r1 = args(ts, r0.p))) {
    return result(Node.createNode('apply', [r0.n, r1.n]), r1.p);
  }
  return null;
}

function infix2(ts, p) {
  _debug(ts, p, 'infix2');
  let r0, r1, r2;
  if ((r0 = exprPre(ts, p)) &&
      (r1 = inop2(ts, r0.p)) &&
      (r2 = exprIn2(ts, r1.p))) {
    return result(Node.createNode('infix2', [r0.n, r1.n, r2.n]), r2.p);
  }
  return null;
}

function prefix(ts, p) {
  _debug(ts, p, 'prefix');
  let r0, r1;
  if ((r0 = preop(ts, p)) &&
      (r1 = exprPost(ts, r0.p))) {
    return result(Node.createNode('prefix', [r0.n, r1.n]), r1.p);
  }
  return null;
}

function postfix(ts, p) {
  _debug(ts, p, 'postfix');
  let r0, r1;
  if ((r0 = operand(ts, p)) &&
      (r1 = postop(ts, r0.p))) {
    return result(Node.createNode('postfix', [r0.n, r1.n]), r1.p);
  }
  return null;
}

function args(ts, p) {
  _debug(ts, p, 'args');
  let r0;
  let ns = [];
  while (r0 = exprIn2(ts, p)) {
    ns.push(r0.n);
    p = r0.p;
  }
  return result(Node.createNode('args', ns), p);
}

function operand(ts, p) {
  _debug(ts, p, 'operand');
  let r;
  if ((r = literal(ts, p)) ||
      (r = braceBlock(ts, p)) ||
      (r = bracketBlock(ts, p)) ||
      (r = parenBlock(ts, p))) {
    return result(r.n, r.p);
  }
  return null;
}

function braceBlock(ts, p) {
  _debug(ts, p, 'braceBlock');
  let r0, r1, r2;
  if ((r0 = openBrace(ts, p)) &&
      (r1 = stmts(ts, r0.p)) &&
      (r2 = closeBrace(ts, r1.p))) {
    return result(Node.createNode('braceBlock', [r0.n, r1.n, r2.n]), r2.p);
  }
  return null;
}

function bracketBlock(ts, p) {
  _debug(ts, p, 'bracketBlock');
  let r0, r1, r2;
  if ((r0 = openBracket(ts, p)) &&
      (r1 = stmts(ts, r0.p)) &&
      (r2 = closeBracket(ts, r1.p))) {
    return result(Node.createNode('bracketBlock', [r0.n, r1.n, r2.n]), r2.p);
  }
  return null;
}

function parenBlock(ts, p) {
  _debug(ts, p, 'parenBlock');
  let r0, r1, r2;
  if ((r0 = openParen(ts, p)) &&
      (r1 = stmts(ts, r0.p)) &&
      (r2 = closeParen(ts, r1.p))) {
    return result(Node.createNode('parenBlock', [r0.n, r1.n, r2.n]), r2.p);
  }
  return null;
}

function bol(ts, p) {
  return _token(ts, p, 'bol');
}

function openBrace(ts, p) {
  return _token(ts, p, 'openBrace');
}

function closeBrace(ts, p) {
  return _token(ts, p, 'closeBrace');
}

function openBracket(ts, p) {
  return _token(ts, p, 'openBracket');
}

function closeBracket(ts, p) {
  return _token(ts, p, 'closeBracket');
}

function openParen(ts, p) {
  return _token(ts, p, 'openParen');
}

function closeParen(ts, p) {
  return _token(ts, p, 'closeParen');
}

function literal(ts, p) {
  var r;
  return (
    _token(ts, p, 'symbol') ||
    _token(ts, p, 'dstring') ||
    _token(ts, p, 'sstring'));
}

function inop0(ts, p) {
  return _token(ts, p, 'inop0');
}

function inop1(ts, p) {
  return _token(ts, p, 'inop1');
}

function inop2(ts, p) {
  return _token(ts, p, 'inop2');
}

function preop(ts, p) {
  return _token(ts, p, 'preop');
}

function postop(ts, p) {
  return _token(ts, p, 'postop');
}

module.exports = { top };
