// Not using createContext: its getter throws when no parent sets the context,
// but Button is often used outside a ButtonGroup.
import { getContext, setContext } from 'svelte';

import type { ButtonColorScheme, ButtonSize } from './recipe';

export type ButtonContext = {
  readonly colorScheme?: ButtonColorScheme;
  readonly size?: ButtonSize;
};

const buttonContextKey = Symbol('io-button');

export const setButtonContext = (context: ButtonContext) =>
  setContext(buttonContextKey, context);

export const getButtonContext = (): ButtonContext =>
  getContext<ButtonContext | undefined>(buttonContextKey) ?? {};
