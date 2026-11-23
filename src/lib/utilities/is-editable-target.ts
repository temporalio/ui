// Input types that do not take typed text, so single-key shortcuts stay usable
// while one of them has focus.
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

/**
 * Whether a keyboard event originates from an element the user types into.
 * Global keyboard shortcuts should ignore these events so that typing in an
 * input, such as the payload of a signal, is not intercepted.
 */
export const isEditableTarget = (event: Event): boolean => {
  const { target } = event;
  if (target instanceof HTMLInputElement) {
    return !NON_TEXT_INPUT_TYPES.has(target.type);
  }
  return (
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable === true)
  );
};
