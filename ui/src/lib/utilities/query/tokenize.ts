import { isConditional, isParenthesis, isQuote, isSpace } from '../is';

type Tokens = string[];

export const tokenize = (string: string): Tokens => {
  const tokens: Tokens = [];
  const addBufferToTokens = (): void => {
    if (buffer) {
      tokens.push(buffer);
      buffer = '';
    }
  };

  let buffer = '';
  let cursor = 0;

  while (cursor < string.length) {
    const character = string[cursor];

    if (isParenthesis(character)) {
      buffer += character;
      addBufferToTokens();
      cursor++;
      continue;
    }

    if (isConditional(character)) {
      // Conditional can be up to three characters long (!==)
      const midConditional = `${string[cursor]}${string[cursor + 1]}`;
      const maxConditional = `${string[cursor]}${string[cursor + 1]}${
        string[cursor + 2]
      }`;
      if (isConditional(maxConditional)) {
        addBufferToTokens();
        buffer += maxConditional;
        cursor += 3;
        continue;
      } else if (isConditional(midConditional)) {
        addBufferToTokens();
        buffer += midConditional;
        cursor += 2;
        continue;
      } else {
        addBufferToTokens();
        buffer += character;
        cursor++;
        continue;
      }
    }

    if (isSpace(character) || isQuote(character)) {
      addBufferToTokens();
      cursor++;
      continue;
    }

    buffer += character;
    cursor++;
  }

  addBufferToTokens();

  return tokens;
};
