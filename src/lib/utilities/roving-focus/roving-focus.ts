export type RovingFocusOrientation = 'horizontal' | 'vertical';

export interface RovingFocusOptions<T> {
  /** Items in navigation order. Read on every call, so it can change while focused. */
  getItems: () => readonly T[];
  getElement: (item: T) => HTMLElement | null | undefined;
  /** The tab stop when nothing in the group has focus, e.g. the selected item. */
  getResetItem?: () => T | undefined;
  /** Defaults to the element's `disabled` or `aria-disabled="true"`. */
  isDisabled?: (item: T) => boolean;
  orientation?: RovingFocusOrientation;
  loop?: boolean;
  /** Called after a key moves focus, not when focus arrives by click or Tab. */
  onNavigate?: (item: T, element: HTMLElement) => void;
}

function isElementDisabled(element: HTMLElement): boolean {
  return (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true'
  );
}

/**
 * Roving tabindex for a group: one tab stop, arrow keys and Home/End move
 * focus between items, and the tab stop returns to `getResetItem` once focus
 * leaves the group. Attach `onkeydown`, `onfocusin` and `onfocusout` to the
 * group's container and set each item's `tabindex` from `tabIndex(item)`.
 * Selection is left to the caller. Pass a reactive `focused` cell to make
 * `tabStop` and `tabIndex` reactive.
 */
export function createRovingFocus<T>(
  options: RovingFocusOptions<T>,
  focused: { current: T | undefined } = { current: undefined },
) {
  function isDisabled(item: T): boolean {
    if (options.isDisabled) {
      return options.isDisabled(item);
    }
    const element = options.getElement(item);
    return element ? isElementDisabled(element) : false;
  }

  function isAvailable(items: readonly T[], item: T | undefined): item is T {
    return item !== undefined && items.includes(item) && !isDisabled(item);
  }

  function tabStop(): T | undefined {
    const items = options.getItems();
    if (isAvailable(items, focused.current)) {
      return focused.current;
    }
    const resetItem = options.getResetItem?.();
    if (isAvailable(items, resetItem)) {
      return resetItem;
    }
    return firstEnabled(items);
  }

  function itemForTarget(
    items: readonly T[],
    target: EventTarget | null,
  ): T | undefined {
    return items.find((item) => options.getElement(item) === target);
  }

  function firstEnabled(candidates: readonly T[]): T | undefined {
    return candidates.find((item) => !isDisabled(item));
  }

  function following(list: readonly T[], index: number, wrap: boolean): T[] {
    const after = list.slice(index + 1);
    return wrap ? [...after, ...list.slice(0, index)] : after;
  }

  function focusItem(item: T): boolean {
    const element = options.getElement(item);
    if (!element) {
      return false;
    }
    focused.current = item;
    element.focus();
    options.onNavigate?.(item, element);
    return true;
  }

  function onkeydown(event: KeyboardEvent) {
    const items = options.getItems();
    const current = itemForTarget(items, event.target);
    if (current === undefined) {
      return;
    }

    const loop = options.loop ?? true;
    const vertical = options.orientation === 'vertical';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    const reversed = [...items].reverse();
    const index = items.indexOf(current);
    const reversedIndex = items.length - 1 - index;

    let target: T | undefined;
    switch (event.key) {
      case nextKey:
        target = firstEnabled(following(items, index, loop));
        break;
      case prevKey:
        target = firstEnabled(following(reversed, reversedIndex, loop));
        break;
      case 'Home':
        target = firstEnabled(items);
        break;
      case 'End':
        target = firstEnabled(reversed);
        break;
      default:
        return;
    }

    event.preventDefault();
    if (target === undefined || target === current) {
      return;
    }
    focusItem(target);
  }

  function onfocusin(event: FocusEvent) {
    const item = itemForTarget(options.getItems(), event.target);
    if (item !== undefined) {
      focused.current = item;
    }
  }

  function onfocusout(event: FocusEvent) {
    const container = event.currentTarget;
    const next = event.relatedTarget;
    if (
      container instanceof Node &&
      next instanceof Node &&
      container.contains(next)
    ) {
      return;
    }
    focused.current = undefined;
  }

  return {
    tabStop,
    tabIndex: (item: T): 0 | -1 => (item === tabStop() ? 0 : -1),
    focusItem,
    onkeydown,
    onfocusin,
    onfocusout,
  };
}

export type RovingFocus<T> = ReturnType<typeof createRovingFocus<T>>;
