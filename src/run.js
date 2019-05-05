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
    this.values = {};
    this.macros = {};
    this.methods = {};
    this.stmtStack = [];
    this.currBlock = null;
    this.currBlockType = 'blockTypeSeq';
    this.nextBlockType = 'blockTypeSeq';
    this.setValue('inop1', '+', args => {
      return args[0] + args[1];
    });
    this.setValue('inop1', '-', args => {
      return args[0] - args[1];
    });
    this.setValue('inop1', '*', args => {
      return args[0] * args[1];
    });
    this.setValue('inop1', '/', args => {
      return args[0] / args[1];
    });
    const pipe = args => {
      return Ast.createApplyAst(args[1].operator, [
        ...args[1].args,
        args[0],
      ]);
    };
    this.macroPush('inop1', '|', pipe);
    this.macroPush('inop1', '.', pipe);
    this.setValue('symbol', 'stdin', args => {
      return createRecord('Stdin', {});
    });
    this.registerMethod('Stdin', 'read', args => {
      return fs.readFileSync('/dev/stdin', { encoding: 'utf8' });
    });
    this.setValue('symbol', 'stdout', args => {
      return createRecord('Stdout', {});
    });
    this.registerMethod('Stdout', 'write', args => {
      return fs.writeSync(1, args[0]);
    });
    this.setValue('internal', 'fieldOrMethod', args => {
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
      throw new Error(`field or method not exists: ${a0.type}.${a1}`);
    });
    this.macroPush('inop2', '.', args => {
      return Ast.createApplyAst(Ast.createRefAst('internal', 'fieldOrMethod'), [
        Ast.createApplyAst(args[0], []),
        args[1].type === 'RefAst' ? Ast.createStringAst(args[1].text) : args[1],
      ]);
    });
    this.registerMethod('String', 'split', args => {
      const sep = args.length >= 2 ? args[1] : ' ';
      return args[0].split(sep);
    });
    this.registerMethod('Array', 'map', args => {
      return args[0].map(args[1]);
    });
    this.setValue('symbol', 'int', args => {
      return parseInt(args[0]);
    });
    this.setValue('symbol', 'floor', args => {
      return Math.floor(args[0]);
    });
    this.setValue('symbol', 'debug', args => {
      return args[0];
    });
  }
  getValue(tokenType, name) {
    const t = this.values[tokenType];
    if (t === undefined) {
      throw new Error('undefined tokenType: ' + tokenType);
    }
    const s = t[name];
    if (s === undefined) {
      throw new Error(`undefined name: '${name}' of tokenType '${tokenType}'`);
    }
    return s;
  }
  setValue(tokenType, name, value) {
    if (!(tokenType in this.values)) {
      this.values[tokenType] = {};
    }
    if (!(name in this.values[tokenType])) {
      this.values[tokenType][name] = [];
    }
    this.values[tokenType][name] = value;
  }
  macroTop(tokenType, name) {
    const t = this.macros[tokenType];
    if (t === undefined) {
      return null;
      //-throw new Error('undefined tokenType: ' + tokenType);
    }
    const s = t[name];
    if (s === undefined || s.length === 0) {
      return null;
      throw new Error(`undefined macro name: '${name}' of tokenType '${tokenType}'`);
    }
    return s[s.length - 1];
  }
  macroPush(tokenType, name, value) {
    if (!(tokenType in this.macros)) {
      this.macros[tokenType] = {};
    }
    if (!(name in this.macros[tokenType])) {
      this.macros[tokenType][name] = [];
    }
    this.macros[tokenType][name].push(value);
  }
  registerMethod(tokenType, name, f) {
    if (!(tokenType in this.methods)) {
      this.methods[tokenType] = {};
    }
    this.methods[tokenType][name] = f;
  }
  callMethod(record, name, args) {
    return this.methods[record.tokenType][name](args);
  }
  apply(f, args) {
    if (typeof f === 'number') {
      return f;
    }
    return f(args);
  }
  startBlock() {
    this.stmtStack.push([this.currBlock, this.currBlockType]);
    if (this.currBlockType === 'blockTypeSeq') {
      this.currBlock = null;
    } else {
      throw new Error('unknown currBlockType');
    }
    this.currBlockType = this.nextBlockType;
    this.nextBlockType = 'blockTypeSeq';
  }
  endBlock() {
    const stmts = this.currBlock;
    const top = this.stmtStack.pop();
    this.currBlock = top[0];
    this.currBlockType = top[1];
    return stmts;
  }
  stmt(v) {
    if (this.currBlockType === 'blockTypeSeq') {
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
    const m = this.macroTop(op.tokenType, op.text);
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
    const r1 = this.any(t.right);
    if (t.left.length == 1) {
      const l = t.left[0];
      this.env.setValue(l.tokenType, l.text, r1);
    } else {
      for (var i = 0; i < t.left.length; i++) {
        const l = t.left[i];
        this.env.setValue(l.tokenType, l.text, r1[i]);
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
      return this.env.getValue(t.tokenType, t.text);
    }
    return i;
  }
  string(t) {
    return t.text;
  }
}

module.exports = { Run };
