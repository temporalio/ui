const isUpperCase = (label, index) => {
    const charCode = label.charCodeAt(index);
    return charCode >= 65 && charCode <= 90;
};
export const capitalize = (word) => {
    return word[0].toUpperCase() + word.slice(1);
};
const labelsToAddName = new Set(['workflowType']);
const addNameIfNeeded = (label) => {
    if (labelsToAddName.has(label)) {
        return `${label}Name`;
    }
    return label;
};
export const format = (label) => {
    let result = '';
    let index = 0;
    label = addNameIfNeeded(label);
    while (index < (label === null || label === void 0 ? void 0 : label.length)) {
        const current = label[index];
        const next = label[index + 1];
        if (index === 0) {
            result += label[index].toUpperCase();
            index++;
            continue;
        }
        if (current + next === 'Id') {
            result += ' ID';
            index += 2;
            continue;
        }
        if (isUpperCase(label, index)) {
            result += ' ';
            result += current.toUpperCase();
            index++;
            continue;
        }
        result += current;
        index++;
    }
    return result;
};
