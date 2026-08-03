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

// A live-region root that must keep announcing while a trap is active (e.g. the
// toast region hoisted to <body>). Matched on the element itself, never on a
// descendant — a container that merely *holds* a live region (the app shell,
// with its form-error regions) must still be inerted, so the region has to be
// hoisted out to a sibling of the trap for this to spare it.
const LIVE_REGION_SELECTOR = '[data-inert-skip], [aria-live]';

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
        !sibling.inert &&
        !sibling.matches(LIVE_REGION_SELECTOR)
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
