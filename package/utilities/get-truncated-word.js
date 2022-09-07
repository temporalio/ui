export const getTruncatedWord = (word, width) => {
    if (word.length * 8.15 > width) {
        const truncLength = Math.floor(width / 8.15) - 4;
        if (truncLength > 0) {
            const trunc = word.slice(0, truncLength);
            return `${trunc}...`;
        }
        else {
            return '...';
        }
    }
    return word;
};
