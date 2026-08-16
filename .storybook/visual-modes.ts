export const redesignViewports = {
  redesignMobile: {
    name: 'Redesign mobile (375px)',
    styles: { width: '375px', height: '812px' },
    type: 'mobile',
  },
  redesignTablet: {
    name: 'Redesign tablet (768px)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet',
  },
  redesignDesktop: {
    name: 'Redesign desktop (1440px)',
    styles: { width: '1440px', height: '900px' },
    type: 'desktop',
  },
} as const;

export const redesignVisualModes = {
  '375px light': {
    palette: 'precision',
    theme: 'light',
    viewport: { value: 'redesignMobile', isRotated: false },
  },
  '375px dark': {
    palette: 'precision',
    theme: 'dark',
    viewport: { value: 'redesignMobile', isRotated: false },
  },
  '375px vaporwave dark': {
    palette: 'vaporwave',
    theme: 'dark',
    viewport: { value: 'redesignMobile', isRotated: false },
  },
  '768px light': {
    palette: 'precision',
    theme: 'light',
    viewport: { value: 'redesignTablet', isRotated: false },
  },
  '768px dark': {
    palette: 'precision',
    theme: 'dark',
    viewport: { value: 'redesignTablet', isRotated: false },
  },
  '1440px light': {
    palette: 'precision',
    theme: 'light',
    viewport: { value: 'redesignDesktop', isRotated: false },
  },
  '1440px dark': {
    palette: 'precision',
    theme: 'dark',
    viewport: { value: 'redesignDesktop', isRotated: false },
  },
  '1440px ember light': {
    palette: 'ember',
    theme: 'light',
    viewport: { value: 'redesignDesktop', isRotated: false },
  },
  '1440px ember dark': {
    palette: 'ember',
    theme: 'dark',
    viewport: { value: 'redesignDesktop', isRotated: false },
  },
  '1440px vaporwave light': {
    palette: 'vaporwave',
    theme: 'light',
    viewport: { value: 'redesignDesktop', isRotated: false },
  },
  '1440px vaporwave dark': {
    palette: 'vaporwave',
    theme: 'dark',
    viewport: { value: 'redesignDesktop', isRotated: false },
  },
} as const;

export const redesignVisualParameters = {
  chromatic: {
    modes: redesignVisualModes,
    pauseAnimationAtEnd: true,
    prefersReducedMotion: 'reduce',
  },
} as const;

// Media emulation belongs on the story-level Chromatic configuration. It
// cannot be nested inside a named visual mode.
export const redesignForcedColorsParameters = {
  chromatic: {
    forcedColors: 'active',
    pauseAnimationAtEnd: true,
    prefersReducedMotion: 'reduce',
  },
} as const;
