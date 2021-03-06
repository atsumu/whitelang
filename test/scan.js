'use strict';

const Scan = require('../src/scan');
const { Token } = require('../src/token');

function test(scanned, expected) {
  const actual = scanned.tokens;
  const min = Math.min(actual.length, expected.length);
  const errors = [];

  if (actual.length !== expected.length) {
    errors.push(['actual.length !== expected.length', {
      'actual.length': actual.length,
      'expected.length': expected.length,
    }]);
  }

  for (var i = 0; i < min; i++) {
    if (!actual[i].isEqualTo(expected[i])) {
      errors.push(['actual[i] !== expected[i]', {
        'i': i,
        'actual[i]': actual[i],
        'expected[i]': expected[i],
      }]);
      break;
    }
  }

  if (errors.length) {
    console.log('errors:');
    errors.map(e => {
      console.log(e);
    });

    throw new Error('test failed.');
  }
}

function test_error(actual, expected) {
  if (actual.message !== expected) {
    console.log(['actual.message !== expected', {
      'actual.message': actual.message,
      'expected': expected,
    }]);
    throw new Error('test failed.');
  }
}

test(Scan.top(''), [
  Token.create('bol', 0, 1, '', ''),
]);

test(Scan.top('{'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('openBrace', 0, 1, '', '{'),
]);

test(Scan.top('}'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('closeBrace', 0, 1, '', '}'),
]);

test(Scan.top('['), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('openBracket', 0, 1, '', '['),
]);

test(Scan.top(']'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('closeBracket', 0, 1, '', ']'),
]);

test(Scan.top('('), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('openParen', 0, 1, '', '('),
]);

test(Scan.top(')'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('closeParen', 0, 1, '', ')'),
]);

test(Scan.top('a'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 0, 1, '', 'a'),
]);

test(Scan.top('"a"'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('dstring', 0, 1, '', '"a"'),
]);

test(Scan.top("'a'"), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('sstring', 0, 1, '', "'a'"),
]);

test(Scan.top('='), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('inop0', 0, 1, '', '='),
]);

test(Scan.top('+'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('inop1', 0, 1, '', '+'),
]);

test(Scan.top('\n'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('bol', 0, 2, '\n', ''),
]);

test(Scan.top(' a'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 1, 1, ' ', 'a'),
]);

test(Scan.top(' \n'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('bol', 1, 2, ' \n', ''),
]);

test(Scan.top('a = b'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 0, 1, '', 'a'),
  Token.create('inop0', 2, 1, ' ', '='),
  Token.create('symbol', 4, 1, ' ', 'b'),
]);

test(Scan.top('a + b'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 0, 1, '', 'a'),
  Token.create('inop1', 2, 1, ' ', '+'),
  Token.create('symbol', 4, 1, ' ', 'b'),
]);

test(Scan.top('a.b'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 0, 1, '', 'a'),
  Token.create('inop2', 1, 1, '', '.'),
  Token.create('symbol', 2, 1, '', 'b'),
]);

test(Scan.top('a.'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 0, 1, '', 'a'),
  Token.create('postop', 1, 1, '', '.'),
]);

test(Scan.top('.a'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('preop', 0, 1, '', '.'),
  Token.create('symbol', 1, 1, '', 'a'),
]);

test(Scan.top('a. b'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 0, 1, '', 'a'),
  Token.create('postop', 1, 1, '', '.'),
  Token.create('symbol', 3, 1, ' ', 'b'),
]);

test(Scan.top('a .b'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('symbol', 0, 1, '', 'a'),
  Token.create('preop', 2, 1, ' ', '.'),
  Token.create('symbol', 3, 1, '', 'b'),
]);

test(Scan.top('{+3}'), [
  Token.create('bol', 0, 1, '', ''),
  Token.create('openBrace', 0, 1, '', '{'),
  Token.create('preop', 1, 1, '', '+'),
  Token.create('symbol', 2, 1, '', '3'),
  Token.create('closeBrace', 3, 1, '', '}'),
]);

test_error(Scan.top('"'), 'unexpected EOF in double quoted string started at pos=0 (line=1)');
test_error(Scan.top("'"), 'unexpected EOF in single quoted string started at pos=0 (line=1)');
test_error(Scan.top("\f"), "unknown char: '\f' at pos=0 (line=1)");
