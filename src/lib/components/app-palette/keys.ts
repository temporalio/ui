export const IS_MAC =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);

// The modifier the palette uses: Cmd on Apple devices, Ctrl elsewhere. It is
// written in front of a key, as in ⌘K or Ctrl+K.
export const MOD = IS_MAC ? '⌘' : 'Ctrl+';
