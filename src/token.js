class Token {
  static create(type, pos, preSpace, text) {
    return new Token(type, pos, preSpace, text);
  }
  constructor(type, pos, preSpace, text) {
    this.type = type;
    this.pos = pos;
    this.preSpace = preSpace;
    this.text = text;
  }
  isEqualTo(token) {
    return (
      this.type === token.type &&
      this.pos === token.pos &&
      this.preSpace === token.preSpace &&
      this.text === token.text);
  }
}

module.exports = { Token };
