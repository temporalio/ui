import { createContext } from 'svelte';

export interface TabsContextType<T extends string = string> {
  selectedTab: T;
  tabs: T[];
  getButtonIdForTab: (tab: string) => string;
  getPanelIdForTab: (tab: string) => string;
  setSelectedTab: (tab: string) => void;
}

const [getCtx, setCtx] = createContext<TabsContextType>();

export function getTabsContext<T extends string>(): TabsContextType<T> {
  return getCtx() as TabsContextType<T>;
}

export function setTabsContext<T extends string>(
  ctx: TabsContextType<T>,
): void {
  setCtx(ctx);
}
