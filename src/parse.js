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
  show(indent = 0) {
    const i = ' '.repeat(indent);
    if (this.type === 'token') {
      const t = this.token;
      return i + `(${t.type} ${t.pos} '${t.text}')\n`;
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

class Parse {
  static _debug(ts, p, n) {
    // console.log(n, p, ts[p]);
  }
  static result(n, p) {
    return { n, p };
  }
  static top(tokens) {
    Parse._debug(tokens, 0, 'top');
    const r = Parse.stmts(tokens, 0);
    return r.n;
  }
  static stmts(ts, p) {
    Parse._debug(ts, p, 'stmts');
    let r0;
    let ns = [];
    while (r0 = Parse.stmt(ts, p)) {
      ns.push(r0.n);
      p = r0.p;
    }
    return Parse.result(Node.createNode('stmts', ns), p);
  }
  static stmt(ts, p) {
    Parse._debug(ts, p, 'stmt');
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
    Parse._debug(ts, p, 'exprIn0');
    let r;
    if ((r = Parse.infix0(ts, p)) ||
        (r = Parse.exprIn1(ts, p))) {
      return Parse.result(Node.createNode('exprIn0', [r.n]), r.p);
    }
    return null;
  }
  static exprIn1(ts, p) {
    Parse._debug(ts, p, 'exprIn1');
    let r;
    if ((r = Parse.infix1(ts, p)) ||
        (r = Parse.exprApply(ts, p))) {
      return Parse.result(Node.createNode('exprIn1', [r.n]), r.p);
    }
    return null;
  }
  static exprApply(ts, p) {
    Parse._debug(ts, p, 'exprApply');
    let r;
    if ((r = Parse.apply(ts, p)) ||
        (r = Parse.exprIn2(ts, p))) {
      return Parse.result(Node.createNode('exprApply', [r.n]), r.p);
    }
    return null;
  }
  static exprIn2(ts, p) {
    Parse._debug(ts, p, 'exprIn2');
    let r;
    if ((r = Parse.infix2(ts, p)) ||
        (r = Parse.exprPre(ts, p))) {
      return Parse.result(Node.createNode('exprIn2', [r.n]), r.p);
    }
    return null;
  }
  static exprPre(ts, p) {
    Parse._debug(ts, p, 'exprPre');
    let r;
    if ((r = Parse.prefix(ts, p)) ||
        (r = Parse.exprPost(ts, p))) {
      return Parse.result(Node.createNode('exprPre', [r.n]), r.p);
    }
    return null;
  }
  static exprPost(ts, p) {
    Parse._debug(ts, p, 'exprPost');
    let r;
    if ((r = Parse.postfix(ts, p)) ||
        (r = Parse.operand(ts, p))) {
      return Parse.result(Node.createNode('exprPost', [r.n]), r.p);
    }
    return null;
  }
  static infix0(ts, p) {
    Parse._debug(ts, p, 'infix0');
    let r0, r1, r2;
    if ((r0 = Parse.exprIn1(ts, p)) &&
        (r1 = Parse.inop0(ts, r0.p)) &&
        (r2 = Parse.exprIn0(ts, r1.p))) {
      return Parse.result(Node.createNode('infix0', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static infix1(ts, p) {
    Parse._debug(ts, p, 'infix1');
    let r0, r1, r2;
    if ((r0 = Parse.apply(ts, p)) &&
        (r1 = Parse.inop1(ts, r0.p)) &&
        (r2 = Parse.exprIn1(ts, r1.p))) {
      return Parse.result(Node.createNode('infix1', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static apply(ts, p) {
    Parse._debug(ts, p, 'apply');
    let r0, r1;
    if ((r0 = Parse.exprIn2(ts, p)) &&
        (r1 = Parse.args(ts, r0.p))) {
      return Parse.result(Node.createNode('apply', [r0.n, r1.n]), r1.p);
    }
    return null;
  }
  static infix2(ts, p) {
    Parse._debug(ts, p, 'infix2');
    let r0, r1, r2;
    if ((r0 = Parse.exprPre(ts, p)) &&
        (r1 = Parse.inop2(ts, r0.p)) &&
        (r2 = Parse.exprIn2(ts, r1.p))) {
      return Parse.result(Node.createNode('infix2', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static prefix(ts, p) {
    Parse._debug(ts, p, 'prefix');
    let r0, r1;
    if ((r0 = Parse.preop(ts, p)) &&
        (r1 = Parse.exprPost(ts, r0.p))) {
      return Parse.result(Node.createNode('prefix', [r0.n, r1.n]), r1.p);
    }
    return null;
  }
  static postfix(ts, p) {
    Parse._debug(ts, p, 'postfix');
    let r0, r1;
    if ((r0 = Parse.operand(ts, p)) &&
        (r1 = Parse.postop(ts, r0.p))) {
      return Parse.result(Node.createNode('postfix', [r0.n, r1.n]), r1.p);
    }
    return null;
  }
  static args(ts, p) {
    Parse._debug(ts, p, 'args');
    let r0;
    let ns = [];
    while (r0 = Parse.exprIn2(ts, p)) {
      ns.push(r0.n);
      p = r0.p;
    }
    return Parse.result(Node.createNode('args', ns), p);
  }
  static operand(ts, p) {
    Parse._debug(ts, p, 'operand');
    let r;
    if ((r = Parse.literal(ts, p)) ||
        (r = Parse.braceBlock(ts, p)) ||
        (r = Parse.bracketBlock(ts, p)) ||
        (r = Parse.parenBlock(ts, p))) {
      return Parse.result(Node.createNode('operand', [r.n]), r.p);
    }
    return null;
  }
  static braceBlock(ts, p) {
    Parse._debug(ts, p, 'braceBlock');
    let r0, r1, r2;
    if ((r0 = Parse.openBrace(ts, p)) &&
        (r1 = Parse.stmts(ts, r0.p)) &&
        (r2 = Parse.closeBrace(ts, r1.p))) {
      return Parse.result(Node.createNode('braceBlock', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static bracketBlock(ts, p) {
    Parse._debug(ts, p, 'bracketBlock');
    let r0, r1, r2;
    if ((r0 = Parse.openBracket(ts, p)) &&
        (r1 = Parse.stmts(ts, r0.p)) &&
        (r2 = Parse.closeBracket(ts, r1.p))) {
      return Parse.result(Node.createNode('bracketBlock', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static parenBlock(ts, p) {
    Parse._debug(ts, p, 'parenBlock');
    let r0, r1, r2;
    if ((r0 = Parse.openParen(ts, p)) &&
        (r1 = Parse.stmts(ts, r0.p)) &&
        (r2 = Parse.closeParen(ts, r1.p))) {
      return Parse.result(Node.createNode('parenBlock', [r0.n, r1.n, r2.n]), r2.p);
    }
    return null;
  }
  static bol(ts, p) {
    Parse._debug(ts, p, 'bol');
    if (Parse._typeMatch(ts, p, 'bol')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static openBrace(ts, p) {
    Parse._debug(ts, p, 'openBrace');
    if (Parse._typeMatch(ts, p, 'openBrace')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static closeBrace(ts, p) {
    Parse._debug(ts, p, 'closeBrace');
    if (Parse._typeMatch(ts, p, 'closeBrace')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static openBracket(ts, p) {
    Parse._debug(ts, p, 'openBracket');
    if (Parse._typeMatch(ts, p, 'openBracket')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static closeBracket(ts, p) {
    Parse._debug(ts, p, 'closeBracket');
    if (Parse._typeMatch(ts, p, 'closeBracket')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static openParen(ts, p) {
    Parse._debug(ts, p, 'openParen');
    if (Parse._typeMatch(ts, p, 'openParen')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static closeParen(ts, p) {
    Parse._debug(ts, p, 'closeParen');
    if (Parse._typeMatch(ts, p, 'closeParen')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static literal(ts, p) {
    Parse._debug(ts, p, 'literla');
    if (Parse._typeMatch(ts, p, 'symbol') ||
        Parse._typeMatch(ts, p, 'dstring') ||
        Parse._typeMatch(ts, p, 'sstring')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static inop0(ts, p) {
    Parse._debug(ts, p, 'inop0');
    if (Parse._typeMatch(ts, p, 'inop0')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static inop1(ts, p) {
    Parse._debug(ts, p, 'inop1');
    if (Parse._typeMatch(ts, p, 'inop1')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static inop2(ts, p) {
    Parse._debug(ts, p, 'inop2');
    if (Parse._typeMatch(ts, p, 'inop2')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static preop(ts, p) {
    Parse._debug(ts, p, 'preop');
    if (Parse._typeMatch(ts, p, 'preop')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static postop(ts, p) {
    Parse._debug(ts, p, 'postop');
    if (Parse._typeMatch(ts, p, 'postop')) {
      return Parse.result(Node.createToken(ts[p]), p + 1);
    }
    return null;
  }
  static _typeMatch(ts, p, t) {
    return p < ts.length && ts[p].type === t;
  }
}

module.exports = { Parse };
