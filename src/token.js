class Token {
  static create(type, pos, line, preSpace, text) {
    return new Token(type, pos, line, preSpace, text);
  }
  constructor(type, pos, line, preSpace, text) {
    this.type = type;
    this.pos = pos;
    this.line = line;
    this.preSpace = preSpace;
    this.text = text;
  }
  isEqualTo(token) {
    return (
      this.type === token.type &&
      this.pos === token.pos &&
      this.line === token.line &&
      this.preSpace === token.preSpace &&
      this.text === token.text);
  }
}

module.exports = { Token };
