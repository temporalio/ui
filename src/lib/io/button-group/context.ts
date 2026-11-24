import { createContext } from 'svelte';

import type { ButtonColorScheme, ButtonSize } from '../button';

export type ButtonGroupContext = {
  readonly colorScheme?: ButtonColorScheme;
  readonly size?: ButtonSize;
};

export const [getButtonGroupContext, setButtonGroupContext] =
  createContext<ButtonGroupContext>();
