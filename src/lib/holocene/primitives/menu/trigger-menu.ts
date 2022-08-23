export const triggerMenu = (node: HTMLElement): { destroy: () => void } => {
  type ExtendedPointerEvent<T> = PointerEvent & {
    currentTarget: EventTarget & T;
    path?: NodeList;
  };

  const handleTriggerClick = (event: PointerEvent) => {
    node.dispatchEvent(new CustomEvent('toggle-menu'));
  };

  const handleDocumentClick = <T extends EventTarget = HTMLElement>(
    event: ExtendedPointerEvent<T>,
  ) => {
    let eventTarget: EventTarget = event.path?.length
      ? event.path[0]
      : event.target;

    if (!eventTarget && event.relatedTarget) eventTarget = event.relatedTarget;

    if (node && !node.contains(eventTarget as Node)) {
      node.dispatchEvent(new CustomEvent('close-menu'));
      event.stopPropagation();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event?.key === 'Escape') {
      node.dispatchEvent(new CustomEvent('close-menu'));
    }
  };

  node.setAttribute('tabindex', '0');
  node.addEventListener('click', handleTriggerClick, false);
  document.addEventListener('click', handleDocumentClick, false);
  document.addEventListener('keyup', handleKeyUp, false);

  return {
    destroy() {
      node.removeEventListener('click', handleTriggerClick, false);
      document.removeEventListener('click', handleDocumentClick, false);
      document.removeEventListener('keyup', handleKeyUp, false);
    },
  };
};
