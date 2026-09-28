export const isModifiedClick = (event: MouseEvent | undefined): boolean => {
  if (!event) return false;

  return Boolean(
    event.button ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey,
  );
};
