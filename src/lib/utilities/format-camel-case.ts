const isUpperCase = (label: string, index: number): boolean => {
  const charCode = label.charCodeAt(index);
  return charCode >= 65 && charCode <= 90;
};

export const capitalize = (word: string): string => {
  return word[0].toUpperCase() + word.slice(1);
};

const labelsToAddName: Readonly<Set<string>> = new Set(['workflowType']);
const labelsToChange: Readonly<{ [key: string]: string }> = {
  workflowExecutionWorkflowId: 'workflowId',
  workflowExecutionRunId: 'runId',
  protocolInstanceId: 'updateId',
  metaUpdateId: 'updateId',
};

const formatLabel = (label?: string): string => {
  if (!label) return '';

  // Add name if needed
  if (labelsToAddName.has(label)) {
    return `${label}Name`;
  }
  // Change label if needed
  if (labelsToChange[label]) {
    return labelsToChange[label];
  }

  return label;
};

export const format = (label?: string): string => {
  if (!label) return '';

  let result = '';
  let index = 0;

  label = formatLabel(label);

  while (index < label.length) {
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
