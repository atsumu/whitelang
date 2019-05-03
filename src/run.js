'use strict';

const Ast = require('../src/ast');
const fs = require('fs');

function _debug(f, t) {
  console.log('DEBUG:', f, Ast.show(t));
}

function createRecord(type, props) {
  return {
    type,
    props,
  };
}

class Env {
  static create() {
    return new Env();
  }
  constructor() {
    this.stacks = {};
    this.macros = {};
    this.methods = {};
    this.stmtStack = [];
    this.currBlock = null;
    this.currBlockType = 'seq';
    this.nextBlockType = 'seq';
    this.push('inop1', '+', args => {
      return args[0] + args[1];
    });
    this.push('inop1', '-', args => {
      return args[0] - args[1];
    });
    this.push('inop1', '*', args => {
      return args[0] * args[1];
    });
    this.push('inop1', '/', args => {
      return args[0] / args[1];
    });
    this.macroPush('inop1', '|', args => {
      console.log('inop1 |', args.map(Ast.show).join('\n'));
      return Ast.createApplyAst(args[1].operator, [
        ...args[1].args,
        args[0],
      ]);
    });
    this.push('symbol', 'stdin', args => {
      return createRecord('Stdin', {});
    });
    this.registerMethod('Stdin', 'read', args => {
      return fs.readFileSync('/dev/stdin', { encoding: 'utf8' });
    });
    this.push('symbol', 'stdout', args => {
      return createRecord('Stdout', {});
    });
    this.registerMethod('Stdout', 'write', args => {
      console.log('write', args);
      return fs.writeSync(1, args[0]);
    });
    this.push('internal', 'fieldOrMethod', args => {
      const a0 = args[0];
      const a1 = args[1];
      if (typeof a0 === 'string') {
        const type = 'String';
        if (type in this.methods && a1 in this.methods[type]) {
          return as => this.methods[type][a1]([a0, ...as]);
        }
        throw new Error(`method not exists: String.${a1}`);
      }
      if (Array.isArray(a0)) {
        const type = 'Array';
        if (type in this.methods && a1 in this.methods[type]) {
          return as => this.methods[type][a1]([a0, ...as]);
        }
        throw new Error(`method not exists: Array.${a1}`);
      }
      if (a1 in a0) {
        return a0[a1];
      }
      if (a0.type in this.methods && a1 in this.methods[a0.type]) {
        return this.methods[a0.type][a1];
      }
      console.log('a0', a0);
      throw new Error(`field or method not exists: ${a0.type}.${a1}`);
    });
    this.macroPush('inop2', '.', args => {
      console.log('.', args);
      return Ast.createApplyAst(Ast.createRefAst('internal', 'fieldOrMethod'), [
        Ast.createApplyAst(args[0], []),
        args[1].type === 'RefAst' ? Ast.createStringAst(args[1].text) : args[1],
      ]);
    });
    this.registerMethod('String', 'split', args => {
      console.log('String.split args', args);
      const sep = args.length >= 2 ? args[1] : ' ';
      console.log('String.split sep', sep);
      return args[0].split(sep);
    });
    this.registerMethod('Array', 'map', args => {
      console.log('Array.map args', args);
      return args[0].map(args[1]);
    });
    this.push('symbol', 'int', args => {
      return parseInt(args[0]);
    });
    this.push('symbol', 'floor', args => {
      console.log('floor', args);
      return Math.floor(args[0]);
    });
    this.push('symbol', 'debug', args => {
      console.log('debug:', args[0]);
      return args[0];
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
  macroTop(type, name) {
    const t = this.macros[type];
    if (t === undefined) {
      return null;
      //-throw new Error('undefined type: ' + type);
    }
    const s = t[name];
    if (s === undefined || s.length === 0) {
      return null;
      throw new Error(`undefined macro name: '${name}' of type '${type}'`);
    }
    return s[s.length - 1];
  }
  macroPush(type, name, value) {
    if (!(type in this.macros)) {
      this.macros[type] = {};
    }
    if (!(name in this.macros[type])) {
      this.macros[type][name] = [];
    }
    this.macros[type][name].push(value);
  }
  registerMethod(type, name, f) {
    if (!(type in this.methods)) {
      this.methods[type] = {};
    }
    this.methods[type][name] = f;
  }
  callMethod(record, name, args) {
    return this.methods[record.type][name](args);
  }
  apply(f, args) {
    if (typeof f === 'number') {
      return f;
    }
    console.log('f', typeof f, f);
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
  expand(t) {
    if (t.type !== 'ApplyAst') {
      throw new Exception('expand not implemented type: ' + t.type);
    }
    const op = t.operator;
    if (op.type !== 'RefAst') {
      return t;
    }
    console.log('op', op);
    const m = this.macroTop(op.subtype, op.text);
    console.log('macroTop', m);
    if (m === null) {
      return t;
    }
    return m(t.args);
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
    _debug('any', t);
    if (t.type === 'BlockAst') {
      return this.block(t);
    }
    if (t.type === 'AssignAst') {
      return this.assign(t);
    }
    if (t.type === 'ApplyAst') {
      return this.apply(t);
    }
    if (t.type === 'FieldAst') {
      return this.field(t);
    }
    if (t.type === 'RefAst') {
      return this.ref(t);
    }
    if (t.type === 'StringAst') {
      return this.string(t);
    }
    throw new Error('not implemented ast type: ' + t.type);
  }
  block(t) {
    _debug('block', t);
    this.env.startBlock();
    for (const c of t.children) {
      this.stmt(c);
    }
    return this.env.endBlock();
  }
  stmt(t) {
    _debug('stmt', t);
    const r = this.any(t);
    return this.env.stmt(r);
  }
  assign(t) {
    _debug('assign', t);
    console.log(Ast.show(t));
    const r1 = this.any(t.right);
    if (t.left.length == 1) {
      const l = t.left[0];
      this.env.push(l.subtype, l.text, r1);
    } else {
      for (var i = 0; i < t.left.length; i++) {
        const l = t.left[i];
        this.env.push(l.subtype, l.text, r1[i]);
      }
    }
    return r1;
  }
  apply(t) {
    t = this.env.expand(t);
    _debug('apply', t);
    const op = this.any(t.operator);
    const as = [];
    for (const a of t.args) {
      as.push(this.any(a));
    }
    return this.env.apply(op, as);
  }
  field(t) {
    _debug('field', t);
    const r = this.any(t.record);
    return r[t.field.text];
  }
  ref(t) {
    _debug('ref', t);
    const i = parseFloat(t.text);
    if (isNaN(i)) {
      return this.env.top(t.subtype, t.text);
    }
    return i;
  }
  string(t) {
    return t.text;
  }
}

module.exports = { Run };
