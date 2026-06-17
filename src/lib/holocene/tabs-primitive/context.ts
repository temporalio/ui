import { createContext } from 'svelte';

export interface TabsContextType<T extends string = string> {
  getIdForTab: (tab: T) => string;
  getPanelIdForTab: (tab: T) => string;
  selectedTab: T;
  tabs: T[];
  setSelectedTab: (selectedTab: T) => void;
}

const [getCtx, setCtx] = createContext<TabsContextType>();

export function getTabsContext<
  T extends string = string,
>(): TabsContextType<T> {
  const ctx = getCtx();

  if (!ctx) {
    throw new Error('Tabs context not found — did you call setTabsContext?');
  }

  return ctx as TabsContextType<T>;
}

export function setTabsContext<T extends string = string>(
  ctx: TabsContextType<T>,
) {
  return setCtx(ctx);
}
