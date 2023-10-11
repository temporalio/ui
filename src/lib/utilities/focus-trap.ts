export const focusTrap = (node: HTMLElement, enabled: boolean) => {
  let firstFocusable: HTMLElement;
  let lastFocusable: HTMLElement;

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          event.preventDefault();
        }
      } else if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  };

  const setFocus = (fromObserver: boolean = false) => {
    if (enabled === false) return;

    const focusable = Array.from(
      node.querySelectorAll<
        HTMLButtonElement | HTMLInputElement | HTMLDivElement
      >(
        'a[href], button, textarea, input, div[contenteditable="true"], select',
      ),
    ).filter((element) => {
      if (element instanceof HTMLDivElement) return element.isContentEditable;
      return !element.disabled;
    });
    firstFocusable = focusable[0];
    lastFocusable = focusable[focusable.length - 1];

    if (!fromObserver) firstFocusable.focus();

    firstFocusable.addEventListener('keydown', onKeydown);
    lastFocusable.addEventListener('keydown', onKeydown);
  };

  const cleanUp = () => {
    firstFocusable?.removeEventListener('keydown', onKeydown);
    lastFocusable?.removeEventListener('keydown', onKeydown);
  };

  const onChange = (
    mutationRecords: MutationRecord[],
    observer: MutationObserver,
  ) => {
    if (mutationRecords.length) {
      cleanUp();
      setFocus(true);
    }
    return observer;
  };
  const observer = new MutationObserver(onChange);
  observer.observe(node, { childList: true, subtree: true });

  setFocus();

  return {
    update(newArgs: boolean) {
      enabled = newArgs;
      newArgs ? setFocus() : cleanUp();
    },
    destroy() {
      cleanUp();
    },
  };
};
