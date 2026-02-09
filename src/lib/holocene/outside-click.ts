import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

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

  const destroy = on(document, 'click', handleClick, { capture: true });

  return { destroy };
};
