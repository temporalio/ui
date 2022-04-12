const isUpperCase = (label: string, index: number): boolean => {
  const charCode = label.charCodeAt(index);
  return charCode >= 65 && charCode <= 90;
};

export const format = (label?: string): string => {
  let result = '';
  let index = 0;

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
