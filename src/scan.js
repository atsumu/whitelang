const { Token } = require('./token');

function match(str, pos, substr) {
  for (var i = 0; i < substr.length && pos + i < str.length; i++) {
    if (str.charCodeAt(pos + i) !== substr.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}

function isNumberChar(str, pos) {
  return str.charCodeAt(pos) >= '0'.charCodeAt(0) && str.charCodeAt(pos) <= '9'.charCodeAt(0);
}

function isSymbolChar(str, pos) {
  return (
    (str.charCodeAt(pos) >= '0'.charCodeAt(0) && str.charCodeAt(pos) <= '9'.charCodeAt(0)) ||
    (str.charCodeAt(pos) >= 'A'.charCodeAt(0) && str.charCodeAt(pos) <= 'Z'.charCodeAt(0)) ||
    (str.charCodeAt(pos) >= 'a'.charCodeAt(0) && str.charCodeAt(pos) <= 'z'.charCodeAt(0)) ||
    (str.charCodeAt(pos) == '_'.charCodeAt(0)));
}

function matchChars(str, pos, chars) {
  for (var i = 0; i < chars.length; i++) {
    if (str.charCodeAt(pos) === chars.charCodeAt(i)) {
      return true;
    }
  }
  return false;
}

function isOperator(str, pos) {
  return matchChars(str, pos, '!#$%&*+,./:;<=>?@^`|~-');
}

function isWhite(str, pos) {
  return matchChars(str, pos, ' \t\r\n');
}

function top(str) {
  var tokens = [];
  var pos = 0;
  var line = 1;

  tokens.push(Token.create('bol', pos, line, '', ''));
  while (pos < str.length) {
    var p = pos;
    for (; p < str.length; p++) {
      if (!matchChars(str, p, ' \t\r')) {
        break;
      }
    }
    var preSpace = str.substr(pos, p - pos);
    pos = p;
    var takePostop = false;
    if (match(str, pos, '\n')) {
      line += 1;
      tokens.push(Token.create('bol', pos, line, preSpace + '\n', ''));
      pos += 1;
    } else if (match(str, pos, '{')) {
      tokens.push(Token.create('openBrace', pos, line, preSpace, '{'));
      pos += 1;
    } else if (match(str, pos, '}')) {
      tokens.push(Token.create('closeBrace', pos, line, preSpace, '}'));
      pos += 1;
      takePostop = true;
    } else if (match(str, pos, '[')) {
      tokens.push(Token.create('openBracket', pos, line, preSpace, '['));
      pos += 1;
    } else if (match(str, pos, ']')) {
      tokens.push(Token.create('closeBracket', pos, line, preSpace, ']'));
      pos += 1;
      takePostop = true;
    } else if (match(str, pos, '(')) {
      tokens.push(Token.create('openParen', pos, line, preSpace, '('));
      pos += 1;
    } else if (match(str, pos, ')')) {
      tokens.push(Token.create('closeParen', pos, line, preSpace, ')'));
      pos += 1;
      takePostop = true;
    } else if (isNumberChar(str, pos)) {
      var p = pos + 1;
      for (; p < str.length; p++) {
        if (!isNumberChar(str, p)) {
          break;
        }
      }
      if (p + 1 < str.length && match(str, p, '.') && isNumberChar(str, p + 1)) {
        for (p += 2; p < str.length; p++) {
          if (!isNumberChar(str, p)) {
            break;
          }
        }
      }
      tokens.push(Token.create('symbol', pos, line, preSpace, str.substr(pos, p - pos)));
      pos = p;
      takePostop = true;
    } else if (isSymbolChar(str, pos)) {
      var p = pos + 1;
      for (; p < str.length; p++) {
        if (!isSymbolChar(str, p)) {
          break;
        }
      }
      tokens.push(Token.create('symbol', pos, line, preSpace, str.substr(pos, p - pos)));
      pos = p;
      takePostop = true;
    } else if (match(str, pos, '"')) {
      var p = pos + 1;
      for (; p <= str.length; p++) {
        if (p === str.length) {
          return {
            status: 'error',
            message: `unexpected EOF in double quoted string started at pos=${pos} (line=${line})`,
          };
          throw new Error('');
        }
        if (match(str, p, '\\')) {
          p++;
          continue;
        }
        if (match(str, p, '"')) {
          p++;
          break;
        }
      }
      tokens.push(Token.create('dstring', pos, line, preSpace, str.substr(pos, p - pos)));
      pos = p;
      takePostop = true;
    } else if (match(str, pos, "'")) {
      var p = pos + 1;
      for (; p <= str.length; p++) {
        if (p === str.length) {
          return {
            status: 'error',
            message: `unexpected EOF in single quoted string started at pos=${pos} (line=${line})`,
          };
        }
        if (match(str, p, '\\')) {
          p++;
          continue;
        }
        if (match(str, p, "'")) {
          p++;
          break;
        }
      }
      tokens.push(Token.create('sstring', pos, line, preSpace, str.substr(pos, p - pos)));
      pos = p;
      takePostop = true;
    } else if (isOperator(str, pos)) {
      var p = pos + 1;
      for (; p < str.length; p++) {
        if (!isOperator(str, p)) {
          break;
        }
      }
      var op = str.substr(pos, p - pos);
      if (p === str.length || isWhite(str, p)) {
        if (op === '=') {
          tokens.push(Token.create('inop0', pos, line, preSpace, op));
        } else {
          tokens.push(Token.create('inop1', pos, line, preSpace, op));
        }
      } else {
        tokens.push(Token.create('preop', pos, line, preSpace, op));
      }
      pos = p;
    } else {
      return {
        status: 'error',
        message: `unknown char: '${str.charAt(pos)}' at pos=${pos} (line=${line})`,
      };
    }
    if (takePostop) {
      if (isOperator(str, pos)) {
        var p = pos + 1;
        for (; p < str.length; p++) {
          if (!isOperator(str, p)) {
            break;
          }
        }
        var op = str.substr(pos, p - pos);
        if (p === str.length || match(str, p, ' ')) {
          tokens.push(Token.create('postop', pos, line, '', op));
        } else {
          tokens.push(Token.create('inop2', pos, line, '', op));
        }
        pos = p;
      }
    }
  }
  return {
    status: 'ok',
    string: str,
    tokens,
  };
}

module.exports = { top };
