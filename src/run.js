'use strict';

//-class RunX {
//-  static top(n) {
//-    return Run.stmts(n);
//-  }
//-  static stmts(n) {
//-    var r = null, e = false;
//-    for (const c of n.children) {
//-      [r, e] = Run.stmt(n);
//-    }
//-    return [r, e];
//-  }
//-  static stmt(n) {
//-    var r = null, e = false;
//-    if (n.children.length >= 2) {
//-      [r, e] = Run.exprIn0(n.children[1]);
//-    }
//-    return [r, e];
//-  }
//-  static exprIn0(n) {
//-    var r = null, e = false;
//-    // todo
//-  }
//-}

class Env {
  static create() {
    return new Env();
  }
  constructor() {
    this.stacks = {};
    this.stmtStack = [];
    this.topStmts = null;
    this.topStmtsType = 'seq';
    this.nextStmtsType = 'seq';
    this.push('inop1', '+', args => {
      return args[0] + args[1];
    });
  }
  top(type, name) {
    const t = this.stacks[type];
    if (t === undefined) {
      throw new Error('undefined type: ' + type);
    }
    const s = t[name];
    if (s === undefined || s.length === 0) {
      throw new Error(`undefined name: '${name}' of type '${type}'`);
    }
    return s[s.length - 1];
  }
  push(type, name, value) {
    if (!(type in this.stacks)) {
      this.stacks[type] = {};
    }
    if (!(name in this.stacks[type])) {
      this.stacks[type][name] = [];
    }
    this.stacks[type][name].push(value);
  }
  pop(type, name) {
    this.stacks[type][name].pop();
  }
  apply(f, args) {
    if (typeof f === 'number') {
      return f;
    }
    //if (f === '+') {
    //  console.log('+');
    //  process.exit(1);
    //}
    //const s = this.stacks[f];
    //if (s === undefined) {
    //  throw new Error('not defined: ' + f);
    //}
    //const t = s[s.length - 1];
    return f(args);
  }
  startStmts() {
    this.stmtStack.push([this.topStmts, this.topStmtsType]);
    if (this.topStmtsType === 'seq') {
      this.topStmts = null;
    } else {
      throw new Error('unknown topStmtsType');
    }
    this.topStmtsType = this.nextStmtsType;
    this.nextStmtsType = 'seq';
  }
  endStmts() {
    const stmts = this.topStmts;
    const top = this.stmtStack.pop();
    this.topStmts = top[0];
    this.topStmtsType = top[1];
    return stmts;
  }
  stmt(v) {
    if (this.topStmtsType === 'seq') {
      this.topStmts = v;
    } else {
      throw new Error('unknown topStmtsType');
    }
  }
}

class Run {
  static create() {
    return new Run();
  }
  constructor() {
    this.env = Env.create();
  }
  top(n) {
    //-console.log('top', n);
    if (n.type === 'stmts') {
      return this.stmts(n);
    }
    if (n.type === 'exprIn0' ||
        n.type === 'exprIn1' ||
        n.type === 'exprApply' ||
        n.type === 'exprIn2' ||
        n.type === 'exprPre' ||
        n.type === 'exprPost' ||
        n.type === 'operand' ||
        false) {
      return this.top(n.children[0]);
    }
    if (n.type === 'infix0') {
      return this.infix0(n);
    }
    if (n.type === 'infix1') {
      return this.infix1(n);
    }
    if (n.type === 'apply') {
      return this.apply(n);
    }
    if (n.type === 'infix2') {
      return this.infix2(n);
    }
    if (n.type === 'prefix') {
      return this.prefix(n);
    }
    if (n.type === 'postfix') {
      return this.postfix(n);
    }
    if (n.type === 'args') {
      return this.args(n);
    }
    if (n.type === 'braceBlock' ||
        n.type === 'bracketBlock' ||
        n.type === 'parenBlock' ||
        false) {
      return this.stmts(n.children[1]);
    }
    if (n.type === 'literal') {
      return this.literal(n);
    }
    if (n.type === 'inop0' ||
        n.type === 'inop1' ||
        n.type === 'inop2' ||
        n.type === 'preop' ||
        n.type === 'postop' ||
        false) {
      return this.literal(n);
    }
    if (n.type === 'token') {
      return this.token(n);
    }
    throw new Error('not implemented');
    return this.stmts(n);
  }
  stmts(n) {
    //-console.log('stmts', n);
    this.env.startStmts();
    for (const c of n.children) {
      this.stmt(c);
    }
    return this.env.endStmts();
  }
  stmt(n) {
    //-console.log('stmt', n, n.children);
    if (n.children.length >= 2) {
      const r = this.top(n.children[1]);
      this.env.stmt(r);
    }
  }
  infix0(n) {
    const r0 = this.top(n.children[0]);
    const r2 = this.top(n.children[2]);
    this.env.push(r0.type, r0.name, r2); // todo
  }
  infix1(n) {
    const r0 = this.top(n.children[0]);
    const r1 = this.top(n.children[1]);
    const r2 = this.top(n.children[2]);
    return this.env.apply(r1, [r0, r2]);
  }
  apply(n) {
    const r0 = this.top(n.children[0]);
    const r1 = this.top(n.children[1]);
    return this.env.apply(r0, r1);
  }
  infix2(n) {
    const r0 = this.top(n.children[0]);
    const r1 = this.top(n.children[1]);
    const r2 = this.top(n.children[2]);
    return this.env.apply(r1, [r0, r2]);
  }
  prefix(n) {
    const r0 = this.top(n.children[0]);
    const r1 = this.top(n.children[1]);
    return this.env.apply(r0, [r1]);
  }
  postfix(n) {
    const r0 = this.top(n.children[0]);
    const r1 = this.top(n.children[1]);
    return this.env.apply(r1, [r0]);
  }
  args(n) {
    const rs = [];
    for (const c of n.children) {
      rs.push(this.top(c));
    }
    return rs;
  }
  literal(n) {
    if (n.token.type === 'symbol') {
      //-console.log(n);
      return parseInt(n.token.text);
    }
    if (n.token.type === 'dstring') {
      return n.token.text;
    }
    if (n.token.type === 'sstring') {
      return n.token.text;
    }
    throw new Error('not implemented');
  }
  token(n) {
    if (n.token.type === 'symbol') {
      //-console.log(n);
      return parseInt(n.token.text);
    }
    if (n.token.type === 'dstring') {
      return n.token.text;
    }
    if (n.token.type === 'sstring') {
      return n.token.text;
    }
    if (n.token.type === 'inop0' ||
        n.token.type === 'inop1' ||
        n.token.type === 'inop2' ||
        n.token.type === 'preop' ||
        n.token.type === 'postop' ||
        false) {
      return this.env.top(n.token.type, n.token.text);
    }
    throw new Error('not implemented');
  }
}

module.exports = { Run };
