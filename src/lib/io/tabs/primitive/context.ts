import { createContext } from 'svelte';

import type { RovingFocusOrientation } from '$lib/utilities/roving-focus';

export type TabsOrientation = RovingFocusOrientation;
export type TabsActivation = 'automatic' | 'manual';

export interface TabsContextType<T extends string = string> {
  readonly selectedTab: T;
  readonly tabs: T[];
  readonly orientation: TabsOrientation;
  readonly activation: TabsActivation;
  isTabDisabled: (tab: T) => boolean;
  getTabId: (tab: T) => string;
  getPanelId: (tab: T) => string;
  setSelectedTab: (tab: T) => void;
}

const [getCtx, setCtx] = createContext<TabsContextType>();

export function getTabsContext<T extends string>(): TabsContextType<T> {
  return getCtx() as unknown as TabsContextType<T>;
}

export function setTabsContext<T extends string>(
  ctx: TabsContextType<T>,
): void {
  setCtx(ctx as unknown as TabsContextType);
}
