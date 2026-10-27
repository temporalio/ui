import type { IconComponent } from '$lib/io/icon';

export interface MenuActionEntry {
  type?: 'item';
  value: string;
  label: string;
  description?: string;
  Icon?: IconComponent;
  disabled?: boolean;
  danger?: boolean;
  href?: string;
  target?: string;
}

export interface MenuSeparatorEntry {
  type: 'separator';
}

export interface MenuGroupEntry {
  type: 'group';
  label?: string;
  items: MenuEntry[];
}

export interface MenuCheckboxEntry {
  type: 'checkbox';
  value: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export interface MenuRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MenuRadioEntry {
  type: 'radio';
  label?: string;
  value: string;
  options: MenuRadioOption[];
  onValueChange?: (value: string) => void;
}

export interface MenuSubmenuEntry {
  type: 'submenu';
  value: string;
  label: string;
  Icon?: IconComponent;
  items: MenuEntry[];
}

export type MenuEntry =
  | MenuActionEntry
  | MenuSeparatorEntry
  | MenuGroupEntry
  | MenuCheckboxEntry
  | MenuRadioEntry
  | MenuSubmenuEntry;

export const getActionValues = (items: MenuEntry[]): string[] =>
  items.flatMap((entry) => {
    if (entry.type === 'group' || entry.type === 'submenu')
      return getActionValues(entry.items);
    if (!entry.type || entry.type === 'item') return [entry.value];
    return [];
  });
