import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

type ClickOutsideHandler = (event: MouseEvent) => void;

export type ClickOutsideOptions = {
  handler: ClickOutsideHandler;
  /** Detached DOM boundaries, such as portal roots, that belong to the control. */
  include?: () => Iterable<Element | null | undefined>;
};

type ClickOutsideParameter = ClickOutsideHandler | ClickOutsideOptions;

const toOptions = (parameter: ClickOutsideParameter): ClickOutsideOptions =>
  typeof parameter === 'function' ? { handler: parameter } : parameter;

export const clickoutside = ((
  node: Element,
  parameter: ClickOutsideParameter,
) => {
  let options = toOptions(parameter);
  let pointerDownInside = false;

  const isInside = (event: MouseEvent | PointerEvent) => {
    const path = event.composedPath();
    const boundaries = [node, ...(options.include?.() ?? [])];

    return boundaries.some(
      (boundary) =>
        boundary &&
        (path.includes(boundary) ||
          (event.target instanceof Node && boundary.contains(event.target))),
    );
  };

  const handlePointerDown = (event: PointerEvent) => {
    pointerDownInside = event.button === 0 && isInside(event);
  };

  const handleClick = (event: MouseEvent) => {
    if (event.detail > 0 && pointerDownInside) {
      pointerDownInside = false;
      return;
    }

    if (!isInside(event) && !event.defaultPrevented) {
      options.handler(event);
    }
  };

  const destroyPointerDown = on(document, 'pointerdown', handlePointerDown, {
    capture: true,
  });
  const destroyClick = on(document, 'click', handleClick, { capture: true });

  return {
    update: (nextParameter: ClickOutsideParameter) => {
      options = toOptions(nextParameter);
    },
    destroy: () => {
      destroyPointerDown();
      destroyClick();
    },
  };
}) satisfies Action<Element, ClickOutsideParameter>;
