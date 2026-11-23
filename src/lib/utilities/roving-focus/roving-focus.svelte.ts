import { createRovingFocus, type RovingFocusOptions } from './roving-focus';

class FocusedItem<T> {
  current = $state.raw<T | undefined>();
}

export function createRovingFocusState<T>(options: RovingFocusOptions<T>) {
  return createRovingFocus(options, new FocusedItem<T>());
}
