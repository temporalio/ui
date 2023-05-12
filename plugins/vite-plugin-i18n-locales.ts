import { Plugin } from 'vite';
import { generateLocales } from '../scripts/generate-locales';

type PluginOptions = {
  src: string;
  dest: string;
};

export function i18nPlugin(options: PluginOptions): Plugin {
  const { src, dest } = options;

  return {
    name: 'vite-plugin-i18n-generate-locales',
    async buildStart(this) {
      await generateLocales(src, dest, this.error);
    },
  };
}
