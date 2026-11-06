export const IS_MAC =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);

// The modifier the palette uses: Cmd on Apple devices, Ctrl elsewhere. It is
// written in front of a key, as in ⌘K or Ctrl+K.
export const MOD = IS_MAC ? '⌘' : 'Ctrl+';

const SHIFT = IS_MAC ? '⇧' : 'Shift+';
const ALT = IS_MAC ? '⌥' : 'Alt+';

// The keys that open the palette, always with MOD. `key` is the
// KeyboardEvent key in lowercase, and `code` is the physical key, which
// matches when a non-Latin layout reports another letter.
export interface PaletteShortcut {
  key: string;
  code: string;
  shift?: boolean;
  alt?: boolean;
}

// A user's choice. `off` turns the shortcut off, and the menu item still
// opens the palette.
export type PaletteShortcutSetting = PaletteShortcut | 'off';

export const DEFAULT_SHORTCUT: PaletteShortcut = { key: 'k', code: 'KeyK' };

const KEY_NAMES: Record<string, string> = {
  ' ': 'Space',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
};

function keyName(key: string): string {
  const name = KEY_NAMES[key];
  if (name) return name;
  if (key.length === 1) return key.toUpperCase();
  return key.charAt(0).toUpperCase() + key.slice(1);
}

// The shortcut as the palette writes it, such as ⌘K or Ctrl+Shift+P.
export function shortcutLabel({ key, shift, alt }: PaletteShortcut): string {
  return `${MOD}${alt ? ALT : ''}${shift ? SHIFT : ''}${keyName(key)}`;
}

export function hasMod(event: KeyboardEvent): boolean {
  return IS_MAC ? event.metaKey : event.ctrlKey;
}

// Latin layouts such as Dvorak keep their own letter. Other layouts report
// another character, so the physical key also counts.
function isKey(event: KeyboardEvent, shortcut: PaletteShortcut): boolean {
  const pressed = event.key.toLowerCase();
  if (pressed === shortcut.key) return true;
  return !/^[a-z]$/.test(pressed) && event.code === shortcut.code;
}

// MOD and the key, with Shift and Alt exactly as the shortcut sets them.
// The default has no Alt, so AltGr, which sends Ctrl+Alt on Windows, does
// not open the palette while it types a letter.
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: PaletteShortcut,
): boolean {
  if (event.altKey !== !!shortcut.alt) return false;
  if (event.shiftKey !== !!shortcut.shift) return false;
  return hasMod(event) && isKey(event, shortcut);
}

const MODIFIER_KEYS = new Set(['meta', 'control', 'shift', 'alt', 'capslock']);

// Browsers keep these for themselves, and Enter and Tab belong to the
// palette, so a shortcut on them would never work.
const RESERVED_CODES = new Set([
  'KeyT',
  'KeyN',
  'KeyW',
  'KeyQ',
  'Enter',
  'Tab',
]);

export type RecordedShortcut =
  | { kind: 'waiting' }
  | { kind: 'needs-mod' }
  | { kind: 'reserved'; label: string }
  | { kind: 'recorded'; shortcut: PaletteShortcut };

// Reads a key press as a new shortcut. A modifier pressed alone is the
// start of a shortcut, so it waits for the next key.
export function recordShortcut(event: KeyboardEvent): RecordedShortcut {
  const key = event.key.toLowerCase();
  if (MODIFIER_KEYS.has(key)) return { kind: 'waiting' };
  if (!hasMod(event)) return { kind: 'needs-mod' };

  const shortcut: PaletteShortcut = {
    key,
    code: event.code,
    shift: event.shiftKey,
    alt: event.altKey,
  };
  if (RESERVED_CODES.has(event.code)) {
    return { kind: 'reserved', label: shortcutLabel(shortcut) };
  }
  return { kind: 'recorded', shortcut };
}

function isShortcut(value: unknown): value is PaletteShortcut {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    'code' in value &&
    typeof value.key === 'string' &&
    typeof value.code === 'string' &&
    value.key !== ''
  );
}

// Storage can be missing or blocked (private windows, blocked site data), so
// every access is guarded. Without storage the app's shortcut applies.
export function loadShortcutSetting(
  key: string,
): PaletteShortcutSetting | undefined {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (parsed === 'off') return 'off';
    return isShortcut(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function saveShortcutSetting(
  key: string,
  setting: PaletteShortcutSetting | undefined,
): void {
  try {
    if (setting === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(setting));
  } catch {
    // The choice then lasts until the page reloads.
  }
}
