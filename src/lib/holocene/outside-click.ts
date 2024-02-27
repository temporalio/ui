import type { Action } from 'svelte/action';

export const clickoutside: Action<Element, (event: MouseEvent) => void> = (
  node: Element,
  handler: (event: MouseEvent) => void,
): { destroy: () => void } => {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !node.contains(event.target as HTMLElement) &&
      !event.defaultPrevented
    ) {
      handler(event);
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
};
