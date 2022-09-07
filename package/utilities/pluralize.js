export const pluralize = (word, count) => {
    if (count === 1) {
        return word;
    }
    return `${word}s`;
};
