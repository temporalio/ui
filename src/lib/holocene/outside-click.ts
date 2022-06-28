/** Dispatch event on click outside of node */
export function clickOutside(node: Element): { destroy: () => void } {
  const handleClick = (event: Event) => {
    if (
      node &&
      !node.contains(event.target as HTMLElement) &&
      !event.defaultPrevented
    ) {
      node.dispatchEvent(new CustomEvent('click-outside'));
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
}
