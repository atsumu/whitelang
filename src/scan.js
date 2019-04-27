const { Token } = require('./token');

class Scan {
  static match(str, pos, substr) {
    for (var i = 0; i < substr.length && pos + i < str.length; i++) {
      if (str.charCodeAt(pos + i) !== substr.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  }
  static isSymbolChar(str, pos) {
    return (
      (str.charCodeAt(pos) >= '0'.charCodeAt(0) && str.charCodeAt(pos) <= '9'.charCodeAt(0)) ||
      (str.charCodeAt(pos) >= 'A'.charCodeAt(0) && str.charCodeAt(pos) <= 'Z'.charCodeAt(0)) ||
      (str.charCodeAt(pos) >= 'a'.charCodeAt(0) && str.charCodeAt(pos) <= 'z'.charCodeAt(0)) ||
      (str.charCodeAt(pos) == '_'.charCodeAt(0)));
  }
  static matchChars(str, pos, chars) {
    for (var i = 0; i < chars.length; i++) {
      if (str.charCodeAt(pos) === chars.charCodeAt(i)) {
        return true;
      }
    }
    return false;
  }
  static isOperator(str, pos) {
    return Scan.matchChars(str, pos, '=!#$%&*+,./:;<>?@^`~-');
  }
  static isWhite(str, pos) {
    return Scan.matchChars(str, pos, ' \t\r\n');
  }
  static top(str) {
    var tokens = [];
    var pos = 0;

    tokens.push(Token.create('bol', pos, '', ''));
    while (pos < str.length) {
      var p = pos;
      for (; p < str.length; p++) {
        if (!Scan.matchChars(str, p, ' \t\r')) {
          break;
        }
      }
      var preSpace = str.substr(pos, p - pos);
      pos = p;
      var takePostop = false;
      if (Scan.match(str, pos, '\n')) {
        tokens.push(Token.create('bol', pos, preSpace, '\n'));
        pos += 1;
      } else if (Scan.match(str, pos, '{')) {
        tokens.push(Token.create('openBrace', pos, preSpace, '{'));
        pos += 1;
      } else if (Scan.match(str, pos, '}')) {
        tokens.push(Token.create('closeBrace', pos, preSpace, '}'));
        pos += 1;
        takePostop = true;
      } else if (Scan.match(str, pos, '[')) {
        tokens.push(Token.create('openBracket', pos, preSpace, '['));
        pos += 1;
      } else if (Scan.match(str, pos, ']')) {
        tokens.push(Token.create('closeBracket', pos, preSpace, ']'));
        pos += 1;
        takePostop = true;
      } else if (Scan.match(str, pos, '(')) {
        tokens.push(Token.create('openParen', pos, preSpace, '('));
        pos += 1;
      } else if (Scan.match(str, pos, ')')) {
        tokens.push(Token.create('closeParen', pos, preSpace, ')'));
        pos += 1;
        takePostop = true;
      } else if (Scan.isSymbolChar(str, pos)) {
        var p = pos + 1;
        for (; p < str.length; p++) {
          if (!Scan.isSymbolChar(str, p)) {
            break;
          }
        }
        tokens.push(Token.create('symbol', pos, preSpace, str.substr(pos, p - pos)));
        pos = p;
        takePostop = true;
      } else if (Scan.match(str, pos, '"')) {
        var p = pos + 1;
        for (; p <= str.length; p++) {
          if (p === str.length) {
            throw new Error('');
          }
          if (Scan.match(str, p, '\\')) {
            p++;
            continue;
          }
          if (Scan.match(str, p, '"')) {
            p++;
            break;
          }
        }
        tokens.push(Token.create('dstring', pos, preSpace, str.substr(pos, p - pos)));
        pos = p;
        takePostop = true;
      } else if (Scan.match(str, pos, "'")) {
        var p = pos + 1;
        for (; p <= str.length; p++) {
          if (p === str.length) {
            throw new Error('');
          }
          if (Scan.match(str, p, '\\')) {
            p++;
            continue;
          }
          if (Scan.match(str, p, "'")) {
            p++;
            break;
          }
        }
        tokens.push(Token.create('sstring', pos, preSpace, str.substr(pos, p - pos)));
        pos = p;
        takePostop = true;
      } else if (Scan.isOperator(str, pos)) {
        var p = pos + 1;
        for (; p < str.length; p++) {
          if (!Scan.isOperator(str, p)) {
            break;
          }
        }
        var op = str.substr(pos, p - pos);
        if (p === str.length || Scan.isWhite(str, p)) {
          if (op === '=') {
            tokens.push(Token.create('inop0', pos, preSpace, op));
          } else {
            tokens.push(Token.create('inop1', pos, preSpace, op));
          }
        } else {
          tokens.push(Token.create('preop', pos, preSpace, op));
        }
        pos = p;
      }
      if (Scan.isOperator(str, pos)) {
        var p = pos + 1;
        for (; p < str.length; p++) {
          if (!Scan.isOperator(str, p)) {
            break;
          }
        }
        var op = str.substr(pos, p - pos);
        if (p === str.length || Scan.match(str, p, ' ')) {
          tokens.push(Token.create('postop', pos, '', op));
        } else {
          tokens.push(Token.create('inop2', pos, '', op));
        }
        pos = p;
      }
    }
    //console.log(tokens);
    return tokens;

    var a = "あ".repeat(100000);

    var n = 0;
    var st = now();
    for (var i = 0; i < 100000; i++) {
      n = a[i];
    }
    var et = now();
    console.log(n);
    tlog(st, et);

    var n = 0;
    var st = now();
    for (var i = 0; i < 100000; i++) {
      n = a.charAt(i);
    }
    var et = now();
    console.log(n);
    tlog(st, et);

    var n = 0;
    var st = now();
    for (var i = 0; i < 100000; i++) {
      n += a.charCodeAt(i);
    }
    var et = now();
    console.log(n);
    tlog(st, et);

    var n = 0;
    var st = now();
    for (var i = 0; i < 100000; i++) {
      n += a.charCodeAt(0);
    }
    var et = now();
    console.log(n);
    tlog(st, et);
  }
  
}

module.exports = { Scan };
