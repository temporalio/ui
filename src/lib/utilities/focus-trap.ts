export const getFocusableElements = (node: HTMLElement) =>
  Array.from(
    node.querySelectorAll<HTMLElement>(
      '[href], button, textarea, input, div[contentEditable="true"], select, [tabindex][tabindex="0"]',
    ),
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      !(element.getAttribute('tabindex') === '-1'),
  );

// Make everything outside `node`'s ancestor chain `inert` — removing it from
// the focus order, tab sequence, pointer events, and the accessibility tree.
// Walks up to <body>, marking the siblings at each level. Returns a function
// that clears only the elements this call inerted (pre-existing `inert` state
// is left untouched). This delegates containment to the platform rather than
// re-implementing it with keydown wrapping.
const inertBackground = (node: HTMLElement): (() => void) => {
  const inerted: HTMLElement[] = [];
  let current: HTMLElement = node;

  while (current !== document.body && current.parentElement) {
    for (const sibling of Array.from(current.parentElement.children)) {
      if (
        sibling !== current &&
        sibling instanceof HTMLElement &&
        !sibling.inert
      ) {
        sibling.inert = true;
        inerted.push(sibling);
      }
    }
    current = current.parentElement;
  }

  return () => {
    for (const element of inerted) element.inert = false;
  };
};

export const focusTrap = (node: HTMLElement, enabled: boolean) => {
  let active = false;
  let releaseBackground: () => void = () => {};
  let previouslyFocused: HTMLElement | null = null;

  const activate = () => {
    if (active) return;
    active = true;

    previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    releaseBackground = inertBackground(node);

    const [firstFocusable] = getFocusableElements(node);
    (firstFocusable ?? node).focus();
  };

  const deactivate = () => {
    if (!active) return;
    active = false;

    releaseBackground();
    releaseBackground = () => {};

    if (previouslyFocused && document.body.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  };

  if (enabled) activate();

  return {
    update(newArgs: boolean) {
      enabled = newArgs;
      if (enabled) {
        activate();
      } else {
        deactivate();
      }
    },
    destroy() {
      deactivate();
    },
  };
};
