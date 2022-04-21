import { isOperator, isQuote, isSpace } from '../is';

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

    if (isOperator(character)) {
      addBufferToTokens();
      buffer += character;
      cursor++;
      continue;
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
