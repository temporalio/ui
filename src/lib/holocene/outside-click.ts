import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

export const clickoutside = ((
  node: Element,
  handler: (event: MouseEvent) => void,
) => {
  let pointerDownInside = false;

  const handlePointerDown = (event: PointerEvent) => {
    pointerDownInside =
      event.button === 0 &&
      Boolean(node?.contains(event.target as HTMLElement));
  };

  const handleClick = (event: MouseEvent) => {
    if (event.detail > 0 && pointerDownInside) {
      pointerDownInside = false;
      return;
    }

    if (
      node &&
      !node.contains(event.target as HTMLElement) &&
      !event.defaultPrevented
    ) {
      handler(event);
    }
  };

  const destroyPointerDown = on(document, 'pointerdown', handlePointerDown, {
    capture: true,
  });
  const destroyClick = on(document, 'click', handleClick, { capture: true });

  return {
    destroy: () => {
      destroyPointerDown();
      destroyClick();
    },
  };
}) satisfies Action<Element, (event: MouseEvent) => void>;
