import { fromStore } from 'svelte/store';

import type {
  PaletteItem,
  PaletteTool,
} from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';
import { IconClock } from '$lib/io/icon';
import {
  hourFormat,
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';
import type { HourFormat } from '$lib/utilities/format-date';
import {
  BASE_TIME_FORMAT_OPTIONS,
  TimezoneOptions,
} from '$lib/utilities/timezone';

import { type Choice, choiceView, currentLabel } from './choice-view';

const timezone = fromStore(timeFormat);
const timestamp = fromStore(timestampFormat);
const hours = fromStore(hourFormat);
const relative = fromStore(relativeTime);

// The same rules as the timezone menu in the header.
export function selectTimezone(value: string) {
  if (relative.current && value !== BASE_TIME_FORMAT_OPTIONS.LOCAL) {
    relativeTime.set(false);
  }
  timeFormat.set(value);
}

export function setRelativeTime(on: boolean) {
  if (on && timezone.current !== BASE_TIME_FORMAT_OPTIONS.LOCAL) {
    timeFormat.set(BASE_TIME_FORMAT_OPTIONS.LOCAL);
  }
  relativeTime.set(on);
}

function timezones(): Choice<string>[] {
  return [
    {
      id: 'local',
      label: translate('palette-preferences.timezone-local'),
      value: BASE_TIME_FORMAT_OPTIONS.LOCAL,
    },
    {
      id: 'utc',
      label: translate('palette-preferences.timezone-utc'),
      value: BASE_TIME_FORMAT_OPTIONS.UTC,
    },
    ...TimezoneOptions.map(({ label, value, abbr }) => ({
      id: value,
      label: abbr ? `${label} (${abbr})` : label,
      value,
    })),
  ];
}

function timestampFormats(): Choice<string>[] {
  return (['short', 'medium', 'long', 'iso'] as const).map((format) => ({
    id: format,
    label: translate(`palette-preferences.timestamp-${format}`),
    value: format,
  }));
}

function hourFormats(): Choice<HourFormat>[] {
  return (['system', '12', '24'] as const).map((format) => ({
    id: format,
    label: translate(`palette-preferences.hour-${format}`),
    value: format,
  }));
}

function chooser<T>(
  id: string,
  title: string,
  placeholder: string,
  choices: () => Choice<T>[],
  current: () => T,
  pick: (value: T) => void,
  keywords: string[],
): PaletteItem {
  return {
    id,
    title,
    keywords,
    accessory: { label: currentLabel(choices(), current()) },
    actions: [
      {
        title: translate('palette-preferences.choose'),
        run: (ctx) =>
          ctx.push(
            choiceView({ id, title, placeholder, choices, current, pick }),
          ),
      },
    ],
  };
}

const tool: PaletteTool = {
  id: 'time',
  get section() {
    return translate('palette-preferences.time-section');
  },
  icon: IconClock,
  order: 20,
  items: () => {
    const hourItem = chooser(
      'hour-format',
      translate('palette-preferences.hour-format'),
      translate('palette-preferences.hour-format-filter'),
      hourFormats,
      () => hours.current,
      (value) => hourFormat.set(value),
      ['12', '24', 'clock'],
    );

    return [
      chooser(
        'timezone',
        translate('palette-preferences.timezone'),
        translate('palette-preferences.timezone-filter'),
        timezones,
        () => timezone.current,
        selectTimezone,
        ['utc', 'local', 'zone', 'time'],
      ),
      chooser(
        'timestamp-format',
        translate('palette-preferences.timestamp-format'),
        translate('palette-preferences.timestamp-format-filter'),
        timestampFormats,
        () => timestamp.current,
        (value) => timestampFormat.set(value),
        ['iso', 'date', 'time'],
      ),
      timestamp.current === 'iso'
        ? {
            ...hourItem,
            disabled: translate('palette-preferences.hour-format-iso'),
          }
        : hourItem,
      {
        id: 'relative-time',
        title: translate('palette-preferences.relative-time'),
        subtitle: translate('palette-preferences.relative-time-subtitle'),
        keywords: ['ago', 'time'],
        accessory: relative.current
          ? { label: translate('palette-preferences.on'), tone: 'success' }
          : { label: translate('palette-preferences.off'), tone: 'neutral' },
        actions: [
          {
            title: relative.current
              ? translate('palette-preferences.turn-off')
              : translate('palette-preferences.turn-on'),
            run: () => setRelativeTime(!relative.current),
          },
        ],
      },
    ];
  },
};

export default tool;
