import type { NavLinkListItem } from '$lib/types/global';

export type { NavLinkListItem };

export function isNavLinkItem(
  item: NavLinkListItem,
): item is Extract<NavLinkListItem, { href: string }> {
  return 'href' in item;
}

export function isNavDividerItem(
  item: NavLinkListItem,
): item is Extract<NavLinkListItem, { divider: true }> {
  return 'divider' in item;
}
