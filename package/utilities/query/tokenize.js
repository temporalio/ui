import { isOperator, isQuote, isSpace } from '../is';
export const tokenize = (string) => {
    const tokens = [];
    const addBufferToTokens = () => {
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
