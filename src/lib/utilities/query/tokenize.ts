import {
  isBacktick,
  isConditional,
  isEndParenthesis,
  isInConditional,
  isOperator,
  isParenthesis,
  isQuote,
  isSpace,
} from '../is';

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

  const getTokenWithSpaces = (
    breakCondition: (value: unknown) => boolean,
    inclusive = false,
  ) => {
    for (let i = inclusive ? cursor : cursor + 1; i < string.length; i++) {
      const character = string[i];

      if (breakCondition(character)) {
        if (inclusive) buffer += character;
        addBufferToTokens();
        cursor = i + 1;
        return;
      }
      buffer += character;
    }
    cursor++;
  };

  while (cursor < string.length) {
    const character = string[cursor];

    if (isBacktick(character)) {
      const isPotentialStartofAttribute =
        cursor === 0 ||
        (isSpace(string[cursor - 1]) &&
          isOperator(tokens[tokens.length - 1])) ||
        isParenthesis(string[cursor - 1]);
      const hasClosingBacktick = string.slice(cursor + 1).includes(character);

      if (isPotentialStartofAttribute && hasClosingBacktick) {
        addBufferToTokens();
        getTokenWithSpaces(isBacktick);
        continue;
      }
    }

    if (isParenthesis(character)) {
      const prevToken = tokens[tokens.length - 1];
      if (isInConditional(prevToken)) {
        getTokenWithSpaces(isEndParenthesis, true);
        continue;
      } else {
        buffer += character;
        addBufferToTokens();
        cursor++;
        continue;
      }
    }

    // Conditional can be up to three characters long (!==)
    // TODO: Fix for starts_with
    const midConditional = `${string[cursor]}${string[cursor + 1]}`;
    const maxConditional = `${string[cursor]}${string[cursor + 1]}${
      string[cursor + 2]
    }`;
    if (isConditional(maxConditional)) {
      buffer += maxConditional;
      addBufferToTokens();
      cursor += 3;
      continue;
    } else if (isConditional(midConditional)) {
      buffer += midConditional;
      addBufferToTokens();
      cursor += 2;
      continue;
    } else if (isConditional(character)) {
      addBufferToTokens();
      buffer += character;
      cursor++;
      continue;
    }

    if (isQuote(character)) {
      addBufferToTokens();

      const isPotentialStartOfValue = isConditional(string[cursor - 1]);
      const hasClosingQuote = string.slice(cursor + 1).includes(character);
      if (isPotentialStartOfValue && hasClosingQuote) {
        const isClosingQuote = (value: unknown) => value === character;
        getTokenWithSpaces(isClosingQuote);
        continue;
      }
      cursor++;
      continue;
    }

    if (isSpace(character)) {
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
