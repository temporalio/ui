export const triggerMenu = (
  node: HTMLElement,
  keepOpen: boolean,
): { destroy: () => void; update: (open: boolean) => void } => {
  type ExtendedPointerEvent<T> = PointerEvent & {
    currentTarget: EventTarget & T;
    path?: NodeList;
  };

  const handleTriggerClick = () => {
    node.dispatchEvent(new CustomEvent('toggle-menu'));
  };

  const handleDocumentClick = <T extends EventTarget = HTMLElement>(
    event: ExtendedPointerEvent<T>,
  ) => {
    let eventTarget: EventTarget = event.path?.length
      ? event.path[0]
      : event.target;

    if (!eventTarget && event.relatedTarget) eventTarget = event.relatedTarget;

    // Why does this cause a rerender of root layout if node is open?
    if (
      node &&
      !node.contains(eventTarget as Node) &&
      node.ariaExpanded === 'true' &&
      !keepOpen
    ) {
      node.dispatchEvent(new CustomEvent('close-menu'));
      event.stopPropagation();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Enter') {
      node.dispatchEvent(new CustomEvent('close-menu'));
    }
  };

  node.setAttribute('tabindex', '0');
  node.addEventListener('click', handleTriggerClick, false);
  document.addEventListener('click', handleDocumentClick, false);
  document.addEventListener('keyup', handleKeyUp, false);

  return {
    update(open) {
      keepOpen = open;
    },
    destroy() {
      node.removeEventListener('click', handleTriggerClick, false);
      document.removeEventListener('click', handleDocumentClick, false);
      document.removeEventListener('keyup', handleKeyUp, false);
    },
  };
};
