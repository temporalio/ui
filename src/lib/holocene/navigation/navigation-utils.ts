import type { NavLinkItem } from '$lib/types/global';

export type { NavLinkItem };

export function isNavLinkItem(
  item: NavLinkItem,
): item is Extract<NavLinkItem, { href: string }> {
  return 'href' in item;
}

export function isNavDividerItem(
  item: NavLinkItem,
): item is Extract<NavLinkItem, { divider: true }> {
  return 'divider' in item;
}
