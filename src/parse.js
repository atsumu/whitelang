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

function _result(n, p) {
  return { n, p };
}

function _token(ts, p, type) {
  _debug(ts, p, type);
  if (p < ts.length && ts[p].type === type) {
    return _result(Node.createToken(type, ts[p]), p + 1);
  }
  return null;
}

function _or(ts, p, type, ...fs) {
  _debug(ts, p, type);
  for (var i = 0; i < fs.length; i++) {
    var r = fs[i](ts, p);
    if (r) {
      return r;
    }
  }
  return null;
}

function _and(ts, p, type, ...fs) {
  _debug(ts, p, type);
  var rs = [];
  for (var i = 0; i < fs.length; i++) {
    var r = fs[i](ts, p);
    if (!r) {
      return null;
    }
    rs.push(r.n);
    p = r.p;
  }
  return _result(Node.createNode(type, rs), p);
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
  return _result(Node.createNode('stmts', ns), p);
}

function stmt(ts, p) {
  _debug(ts, p, 'stmt');
  let r0, r1;
  if ((r0 = bol(ts, p)) &&
      (r1 = exprIn0(ts, r0.p))) {
    return _result(Node.createNode('stmt', [r0.n, r1.n]), r1.p);
  }
  if (r0 = bol(ts, p)) {
    return _result(Node.createNode('stmt', [r0.n]), r0.p);
  }
  return null;
}

const exprIn0 = (ts, p) => _or(ts, p, 'exprIn0', infix0, exprIn1);
const exprIn1 = (ts, p) => _or(ts, p, 'exprIn1', infix1, exprApply);
const exprApply = (ts, p) => _or(ts, p, 'exprApply', apply, exprIn2);
const exprIn2 = (ts, p) => _or(ts, p, 'exprIn2', infix2, exprPre);
const exprPre = (ts, p) => _or(ts, p, 'exprPre', prefix, exprPost);
const exprPost = (ts, p) => _or(ts, p, 'exprPost', postfix, operand);

const infix0 = (ts, p) => _and(ts, p, 'infix0', exprIn1, inop0, exprIn0);
const infix1 = (ts, p) => _and(ts, p, 'infix1', apply, inop1, exprIn1);
const apply = (ts, p) => _and(ts, p, 'apply', exprIn2, args);
const infix2 = (ts, p) => _and(ts, p, 'infix2', exprPre, inop2, exprIn2);
const prefix = (ts, p) => _and(ts, p, 'prefix', preop, exprPost);
const postfix = (ts, p) => _and(ts, p, 'postifx', operand, postop);

function args(ts, p) {
  _debug(ts, p, 'args');
  let r0;
  let ns = [];
  while (r0 = exprIn2(ts, p)) {
    ns.push(r0.n);
    p = r0.p;
  }
  return _result(Node.createNode('args', ns), p);
}

const operand = (ts, p) => _or(ts, p, 'operand', symbol, dstring, sstring, braceBlock, bracketBlock, parenBlock);
const braceBlock = (ts, p) => _and(ts, p, 'braceBlock', openBrace, stmts, closeBrace);
const bracketBlock = (ts, p) => _and(ts, p, 'bracketBlock', openBracket, stmts, closeBracket);
const parenBlock = (ts, p) => _and(ts, p, 'parenBlock', openParen, stmts, closeParen);

const bol = (ts, p) => _token(ts, p, 'bol');
const openBrace = (ts, p) => _token(ts, p, 'openBrace');
const closeBrace = (ts, p) => _token(ts, p, 'closeBrace');
const openBracket = (ts, p) => _token(ts, p, 'openBracket');
const closeBracket = (ts, p) => _token(ts, p, 'closeBracket');
const openParen = (ts, p) => _token(ts, p, 'openParen');
const closeParen = (ts, p) => _token(ts, p, 'closeParen');
const symbol = (ts, p) => _token(ts, p, 'symbol');
const dstring = (ts, p) => _token(ts, p, 'dstring');
const sstring = (ts, p) => _token(ts, p, 'sstring');
const inop0 = (ts, p) => _token(ts, p, 'inop0');
const inop1 = (ts, p) => _token(ts, p, 'inop1');
const inop2 = (ts, p) => _token(ts, p, 'inop2');
const preop = (ts, p) => _token(ts, p, 'preop');
const postop = (ts, p) => _token(ts, p, 'postop');

module.exports = { top };
