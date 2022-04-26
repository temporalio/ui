const isUpperCase = (label: string, index: number): boolean => {
  const charCode = label.charCodeAt(index);
  return charCode >= 65 && charCode <= 90;
};

const labelsToAddName = [
  'workflowType',
  // 'taskQueue',
];

const addNameIfNeeded = (label?: string) => {
  if (labelsToAddName.includes(label)) {
    return `${label}Name`;
  }
  return label;
};

export const format = (label?: string): string => {
  let result = '';
  let index = 0;

  label = addNameIfNeeded(label);

  while (index < label?.length) {
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
