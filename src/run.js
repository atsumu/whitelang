'use strict';

class Env {
  static create() {
    return new Env();
  }
  constructor() {
    this.stacks = {};
    this.stmtStack = [];
    this.currBlock = null;
    this.currBlockType = 'seq';
    this.nextBlockType = 'seq';
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
  startBlock() {
    this.stmtStack.push([this.currBlock, this.currBlockType]);
    if (this.currBlockType === 'seq') {
      this.currBlock = null;
    } else {
      throw new Error('unknown currBlockType');
    }
    this.currBlockType = this.nextBlockType;
    this.nextBlockType = 'seq';
  }
  endBlock() {
    const stmts = this.currBlock;
    const top = this.stmtStack.pop();
    this.currBlock = top[0];
    this.currBlockType = top[1];
    return stmts;
  }
  stmt(v) {
    if (this.currBlockType === 'seq') {
      this.currBlock = v;
    } else {
      throw new Error('unknown currBlockType');
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
  any(t) {
    if (t.type === 'BlockAst') {
      return this.block(t);
    }
    if (t.type === 'AssignAst') {
      return this.assign(t);
    }
    if (t.type === 'ApplyAst') {
      return this.apply(t);
    }
    if (t.type === 'SymbolAst') {
      return this.symbol(t);
    }
    if (t.type === 'StringAst') {
      return this.string(t);
    }
    throw new Error('not implemented ast type: ' + t.type);
  }
  block(t) {
    this.env.startBlock();
    for (const c of t.children) {
      this.stmt(c);
    }
    return this.env.endBlock();
  }
  stmt(t) {
    const r = this.any(t);
    this.env.stmt(r);
  }
  assign(t) {
    const r0 = this.any(t.args[0]);
    const r1 = this.any(t.args[1]);
    return this.env.push(r0.subtype, r0.text, r1); // todo: assign
  }
  apply(t) {
    const op = this.any(t.operator);
    const as = [];
    for (const a of t.args) {
      as.push(this.any(a));
    }
    return this.env.apply(op, as);
  }
  symbol(t) {
    const i = parseInt(t.text);
    if (isNaN(i)) {
      return this.env.top('inop1', t.text);
    }
    return i;
  }
  string(t) {
    return t.text;
  }
}

module.exports = { Run };
