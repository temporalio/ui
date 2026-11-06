export const IS_MAC =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);

// The modifier the palette uses: Cmd on Apple devices, Ctrl elsewhere. It is
// written in front of a key, as in ⌘K or Ctrl+K.
export const MOD = IS_MAC ? '⌘' : 'Ctrl+';

// The keys that open the palette: one letter or number, with any mix of
// modifiers. At least one of Cmd (`meta`), Ctrl or Alt is set, so the
// shortcut never blocks typing. `key` is the letter or number in lowercase,
// and `code` is the physical key, which matches when a layout or Alt reports
// another character.
export interface PaletteShortcut {
  key: string;
  code: string;
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
}

// A user's choice. `off` turns the shortcut off, and the menu item still
// opens the palette.
export type PaletteShortcutSetting = PaletteShortcut | 'off';

// MOD as shortcut flags.
const MOD_FLAGS: Pick<PaletteShortcut, 'meta' | 'ctrl'> = IS_MAC
  ? { meta: true }
  : { ctrl: true };

export const DEFAULT_SHORTCUT: PaletteShortcut = {
  key: 'k',
  code: 'KeyK',
  ...MOD_FLAGS,
};

const ALPHANUMERIC = /^[a-z0-9]$/;

// Apple writes modifiers as symbols in the order Control, Option, Shift,
// Command. Other platforms write names joined with +.
export function shortcutLabel({
  key,
  meta,
  ctrl,
  alt,
  shift,
}: PaletteShortcut): string {
  const letter = key.toUpperCase();
  if (IS_MAC) {
    return `${ctrl ? '⌃' : ''}${alt ? '⌥' : ''}${shift ? '⇧' : ''}${meta ? '⌘' : ''}${letter}`;
  }
  return [
    ctrl && 'Ctrl',
    alt && 'Alt',
    shift && 'Shift',
    meta && 'Meta',
    letter,
  ]
    .filter(Boolean)
    .join('+');
}

export function hasMod(event: KeyboardEvent): boolean {
  return IS_MAC ? event.metaKey : event.ctrlKey;
}

// The letter or number of a physical key, such as `k` for KeyK.
function keyOfCode(code: string): string | undefined {
  const match = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(code);
  if (!match) return undefined;
  return (match[1] ?? match[2]).toLowerCase();
}

// Latin layouts such as Dvorak keep their own letter. Other layouts, Alt on
// Apple keyboards and Shift on a number report another character, so the
// physical key also counts.
function isKey(event: KeyboardEvent, shortcut: PaletteShortcut): boolean {
  const pressed = event.key.toLowerCase();
  if (pressed === shortcut.key) return true;
  return !/^[a-z]$/.test(pressed) && event.code === shortcut.code;
}

// Every modifier exactly as the shortcut sets it, and the key. A shortcut
// without Alt does not match AltGr, which sends Ctrl+Alt on Windows, so the
// palette does not open while AltGr types a letter.
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: PaletteShortcut,
): boolean {
  if (event.metaKey !== !!shortcut.meta) return false;
  if (event.ctrlKey !== !!shortcut.ctrl) return false;
  if (event.altKey !== !!shortcut.alt) return false;
  if (event.shiftKey !== !!shortcut.shift) return false;
  return isKey(event, shortcut);
}

function hasTypingGuard({ meta, ctrl, alt }: PaletteShortcut): boolean {
  return Boolean(meta || ctrl || alt);
}

const MODIFIER_KEYS = new Set(['meta', 'control', 'shift', 'alt', 'capslock']);

// The browser keeps these with MOD for tabs and windows, so a shortcut on
// them would never reach the page.
const RESERVED_KEYS = new Set(['t', 'n', 'w', 'q']);

export type RecordedShortcut =
  | { kind: 'waiting' }
  | { kind: 'needs-key' }
  | { kind: 'needs-mod' }
  | { kind: 'reserved'; label: string }
  | { kind: 'recorded'; shortcut: PaletteShortcut };

// The letter or number pressed. Alt on Apple keyboards types a symbol, so the
// physical key names it then.
function recordedKey(event: KeyboardEvent): string | undefined {
  const pressed = event.key.toLowerCase();
  if (ALPHANUMERIC.test(pressed)) return pressed;
  return keyOfCode(event.code);
}

// Reads a key press as a new shortcut. A modifier pressed alone is the
// start of a shortcut, so it waits for the next key.
export function recordShortcut(event: KeyboardEvent): RecordedShortcut {
  if (MODIFIER_KEYS.has(event.key.toLowerCase())) return { kind: 'waiting' };

  const key = recordedKey(event);
  if (!key) return { kind: 'needs-key' };

  const shortcut: PaletteShortcut = {
    key,
    code: event.code,
    meta: event.metaKey,
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
  };
  if (!hasTypingGuard(shortcut)) return { kind: 'needs-mod' };
  if (hasMod(event) && RESERVED_KEYS.has(key)) {
    return { kind: 'reserved', label: shortcutLabel(shortcut) };
  }
  return { kind: 'recorded', shortcut };
}

function flag(value: object, name: string): boolean {
  return Object.getOwnPropertyDescriptor(value, name)?.value === true;
}

// Shortcuts saved before each modifier was stored always used MOD.
function readShortcut(value: unknown): PaletteShortcut | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  if (!('key' in value) || !('code' in value)) return undefined;
  if (typeof value.key !== 'string' || typeof value.code !== 'string') {
    return undefined;
  }
  if (!ALPHANUMERIC.test(value.key)) return undefined;

  const shortcut: PaletteShortcut = {
    key: value.key,
    code: value.code,
    meta: flag(value, 'meta'),
    ctrl: flag(value, 'ctrl'),
    alt: flag(value, 'alt'),
    shift: flag(value, 'shift'),
  };
  if (!('meta' in value) && !('ctrl' in value)) {
    return { ...shortcut, ...MOD_FLAGS };
  }
  return hasTypingGuard(shortcut) ? shortcut : undefined;
}

// Storage can be missing or blocked (private windows, blocked site data), so
// every access is guarded. Without storage the app's shortcut applies.
export function loadShortcutSetting(
  key: string,
): PaletteShortcutSetting | undefined {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (parsed === 'off') return 'off';
    return readShortcut(parsed);
  } catch {
    return undefined;
  }
}

// Every flag is written, so a load can tell this format from the old one.
function storedSetting(
  setting: PaletteShortcutSetting,
): PaletteShortcutSetting {
  if (setting === 'off') return 'off';
  return {
    key: setting.key,
    code: setting.code,
    meta: !!setting.meta,
    ctrl: !!setting.ctrl,
    alt: !!setting.alt,
    shift: !!setting.shift,
  };
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
    localStorage.setItem(key, JSON.stringify(storedSetting(setting)));
  } catch {
    // The choice then lasts until the page reloads.
  }
}
