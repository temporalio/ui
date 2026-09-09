import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/sveltekit';
import '../src/app.css';
import './preview.css';
import i18next from 'i18next';

import { i18nNamespaces } from '../src/lib/i18n';
import resources from '../src/lib/i18n/locales';
import { defaultThemeName, themes } from '../src/lib/theme/io/themes';

i18next.init({
  fallbackLng: 'en',
  load: 'languageOnly',
  ns: i18nNamespaces,
  defaultNS: 'common',
  detection: {
    order: ['querystring', 'localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupQuerystring: 'lng',
    lookupLocalStorage: 'locale',
  },
  resources,
});

const storybookThemes = Object.fromEntries(
  Object.keys(themes).map((name) => [name, name]),
);

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      defaultTheme: defaultThemeName,
      themes: storybookThemes,
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    backgrounds: {
      disable: true,
    },
    controls: {
      exclude: /^id|name|class|data-\w+|on\w+/,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
