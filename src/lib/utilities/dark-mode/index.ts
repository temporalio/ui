import DarkMode from './dark-mode.svelte';

export default DarkMode;
export {
  useDarkMode,
  useDarkModePreference,
  getNextDarkModePreference,
} from './dark-mode';

export type { DarkModePreference, ThemeOverride } from './dark-mode';
