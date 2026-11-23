import { fromStore } from 'svelte/store';

import type { PaletteTool } from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';
import { IconSun } from '$lib/io/icon';
import {
  type DarkModePreference,
  useDarkModePreference,
} from '$lib/utilities/dark-mode';

import { type Choice, choiceView, currentLabel } from './choice-view';

const preference = fromStore(useDarkModePreference);

function themes(): Choice<DarkModePreference>[] {
  return [
    {
      id: 'system',
      label: translate('palette-preferences.theme-system'),
      value: 'system',
    },
    {
      id: 'light',
      label: translate('palette-preferences.theme-light'),
      value: false,
    },
    {
      id: 'dark',
      label: translate('palette-preferences.theme-dark'),
      value: true,
    },
  ];
}

const tool: PaletteTool = {
  id: 'theme',
  get section() {
    return translate('palette-preferences.appearance-section');
  },
  icon: IconSun,
  order: 10,
  items: () => [
    {
      id: 'theme',
      title: translate('palette-preferences.theme'),
      keywords: ['dark', 'light', 'mode', 'appearance'],
      accessory: { label: currentLabel(themes(), preference.current) },
      actions: [
        {
          title: translate('palette-preferences.choose'),
          run: (ctx) =>
            ctx.push(
              choiceView({
                id: 'theme',
                title: translate('palette-preferences.theme'),
                placeholder: translate('palette-preferences.theme-filter'),
                choices: themes,
                current: () => preference.current,
                pick: (value) => useDarkModePreference.set(value),
              }),
            ),
        },
      ],
    },
  ],
};

export default tool;
