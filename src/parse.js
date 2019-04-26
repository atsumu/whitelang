'use strict';

class Node {
  static createNode(type, children) {
    return new Node(type, children, null);
  }
  static createToken(token) {
    return new Node('token', [], token);
  }
  constructor(type, children, token) {
    this.type = type;
    this.children = children;
    this.token = token;
  }
}

class Parse {
  static result(n, p) {
    return { n, p };
  }
  static top(tokens) {
    const r = Parse.stmts(tokens, 0);
    return r.n;
  }
  static stmts(ts, p) {
    let r0;
    let ns = [];
    while (r0 = Parse.stmt(ts, p)) {
      ns.push(r0.n);
      p = r0.p;
    }
    return Parse.result(Node.createNode('stmts', ns), p);
  }
  static stmt(ts, p) {
    let r0, r1;
    if ((r0 = Parse.bol(ts, p)) &&
        (r1 = Parse.exprIn0(ts, r0.p))) {
      return Parse.result(Node.createNode('stmt', [r0.n, r1.n]), r1.p);
    }
    if (r0 = Parse.bol(ts, p)) {
      return Parse.result(Node.createNode('stmt', [r0.n]), r0.p);
    }
    return null;
  }
  static exprIn0(ts, p) {
    let r;
    if ((r = Parse.infix0(ts, p)) ||
        (r = Parse.exprIn1(ts, p))) {
      return Parse.result(Node.createNode('exprIn0', [r.n]), r.p);
    }
    return null;
  }
  static exprIn1(ts, p) {
    let r;
    if ((r = Parse.infix1(ts, p)) ||
        (r = Parse.exprBlock(ts, p))) {
      return Parse.result(Node.createNode('exprIn1', [r.n]), r.p);
    }
    return null;
  }
  static exprBlock(ts, p) {
    let r;
    if ((r = Parse.block(ts, p)) ||
        (r = Parse.exprApply(ts, p))) {
      return Parse.result(Node.createNode('exprBlock', [r.n]), r.p);
    }
    return null;
  }
  static exprApply(ts, p) {
    let r;
    if ((r = Parse.apply(ts, p)) ||
        (r = Parse.exprIn2(ts, p))) {
      return Parse.result(Node.createNode('exprApply', [r.n]), r.p);
    }
    return null;
  }
  static exprIn2(ts, p) {
    let r;
    if ((r = Parse.infix2(ts, p)) ||
        (r = Parse.exprPre(ts, p))) {
      return Parse.result(Node.createNode('exprIn2', [r.n]), r.p);
    }
    return null;
  }
  static exprPre(ts, p) {
    let r;
    if ((r = Parse.prefix(ts, p)) ||
        (r = Parse.exprPost(ts, p))) {
      return Parse.result(Node.createNode('exprPre', [r.n]), r.p);
    }
    return null;
  }
  static exprPost(ts, p) {
    let r;
    if ((r = Parse.postfix(ts, p)) ||
        (r = Parse.literal(ts, p))) {
      return Parse.result(Node.createNode('exprPost', [r.n]), r.p);
    }
    return null;
  }
  static infix0(ts, p) {
    let r0, r1, r2;
    if ((r0 = Parse.exprIn1(ts, p)) &&
        (r1 = Parse.inop0(ts, r0.p)) &&
        (r2 = Parse.exprIn0(ts, r1.p))) {
      return Parse.result(Node.createNode('infix0', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static infix1(ts, p) {
    let r0, r1, r2;
    if ((r0 = Parse.apply(ts, p)) &&
        (r1 = Parse.inop1(ts, r0.p)) &&
        (r2 = Parse.exprIn1(ts, r1.p))) {
      return Parse.result(Node.createNode('infix1', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static apply(ts, p) {
    let r0, r1, r2;
    if ((r0 = Parse.exprIn2(ts, p)) &&
        (r1 = Parse.args(ts, r0.p)) &&
        (r2 = Parse.blockOpt(ts, r1.p))) {
      return Parse.result(Node.createNode('apply', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static infix2(ts, p) {
    let r0, r1, r2;
    if ((r0 = Parse.exprPre(ts, p)) &&
        (r1 = Parse.inop2(ts, r0.p)) &&
        (r2 = Parse.exprIn2(ts, r1.p))) {
      return Parse.result(Node.createNode('infix2', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static prefix(ts, p) {
    let r0, r1;
    if ((r0 = Parse.preop(ts, p)) &&
        (r1 = Parse.exprPost(ts, r0.p))) {
      return Parse.result(Node.createNode('prefix', [r0.n, r1.n]), r1.p);
    }
    return null;
  }
  static postfix(ts, p) {
    let r0, r1;
    if ((r0 = Parse.literal(ts, p)) &&
        (r1 = Parse.postop(ts, r0.p))) {
      return Parse.result(Node.createNode('postfix', [r0.n, r1.n]), r1.p);
    }
    return null;
  }
  static args(ts, p) {
    let r0;
    let ns = [];
    while (r0 = Parse.literal(ts, p)) {
      ns.push(r0.n);
      p = r0.p;
    }
    return Parse.result(Node.createNode('args', ns), p);
  }
  static blockOpt(ts, p) {
    let r0;
    if (r0 = Parse.block(ts, p)) {
      return Parse.result(Node.createNode('blockOpt', [r0.n]), r0.p);
    }
    return Parse.result(Node.createNode('blockOpt', []), p);
  }
  static block(ts, p) {
    let r0, r1, r2;
    if ((r0 = Parse.open(ts, p)) &&
        (r1 = Parse.stmts(ts, r0.p)) &&
        (r2 = Parse.close(ts, r1.p))) {
      return Parse.result(Node.createNode('block', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static bol(ts, p) {
    if (Parse._typeMatch(ts, p, 'bol')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static open(ts, p) {
    if (Parse._typeMatch(ts, p, 'open')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static close(ts, p) {
    if (Parse._typeMatch(ts, p, 'close')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static literal(ts, p) {
    if (Parse._typeMatch(ts, p, 'symbol') ||
        Parse._typeMatch(ts, p, 'dstring') ||
        Parse._typeMatch(ts, p, 'sstring')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static inop0(ts, p) {
    if (Parse._typeMatch(ts, p, 'inop0')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static inop1(ts, p) {
    if (Parse._typeMatch(ts, p, 'inop1')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static inop2(ts, p) {
    if (Parse._typeMatch(ts, p, 'inop2')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static preop(ts, p) {
    if (Parse._typeMatch(ts, p, 'preop')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static postop(ts, p) {
    if (Parse._typeMatch(ts, p, 'postop')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static _typeMatch(ts, p, t) {
    return p < ts && ts[p].type === t;
  }
}

module.exports = { Parse };
