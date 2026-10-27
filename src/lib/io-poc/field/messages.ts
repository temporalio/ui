export interface FieldMessageIds {
  helperTextId: string;
  errorTextId: string;
  describedBy: string | undefined;
}

export const getFieldMessageIds = (
  baseId: string,
  {
    helperText,
    showError,
    errorFirst = false,
  }: { helperText?: string; showError?: boolean; errorFirst?: boolean },
): FieldMessageIds => {
  const helperTextId = `${baseId}-helper-text`;
  const errorTextId = `${baseId}-error-text`;
  const ids = [helperText ? helperTextId : '', showError ? errorTextId : ''];
  if (errorFirst) ids.reverse();
  return {
    helperTextId,
    errorTextId,
    describedBy: ids.filter(Boolean).join(' ') || undefined,
  };
};
