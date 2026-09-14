export function composeEventHandlers<E extends Event>(
  ...handlers: (((event: E) => void) | undefined | null)[]
): (event: E) => void {
  return (event) => {
    for (const handler of handlers) {
      handler?.(event);
    }
  };
}
