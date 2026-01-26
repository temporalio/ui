import { get, type Subscriber } from 'svelte/store';

import { startOfDay } from 'date-fns';

import { persistStore } from '$lib/stores/persist-store';
import { type TimestampFormat } from '$lib/utilities/format-date';
import {
  BASE_TIME_FORMAT_OPTIONS,
  getAdjustedTimeformat,
  TIME_UNIT_OPTIONS,
  Timezones,
} from '$lib/utilities/timezone';

type TimeFormatTypes = 'relative' | 'absolute';

export const timestampFormat = persistStore<TimestampFormat>(
  'timestampFormat',
  'medium',
);

const DEFAULT_TIME_FORMAT = BASE_TIME_FORMAT_OPTIONS.LOCAL;
const persistedTimeFormat = persistStore('timeFormat', DEFAULT_TIME_FORMAT);
export const timeFormatType = persistStore(
  'timeFormatType',
  'relative' as TimeFormatTypes,
);

export const relativeTime = persistStore('relativeTime', false);
export const relativeTimeDuration = persistStore('relativeTimeDuration', '');
export const relativeTimeUnit = persistStore(
  'relativeTimeUnit',
  TIME_UNIT_OPTIONS[0],
);

export const startDate = persistStore('startDate', startOfDay(new Date()));
export const startHour = persistStore('startHour', '');
export const startMinute = persistStore('startMinute', '');
export const startSecond = persistStore('startSecond', '');

export const endDate = persistStore('endDate', startOfDay(new Date()));
export const endHour = persistStore('endHour', '');
export const endMinute = persistStore('endMinute', '');
export const endSecond = persistStore('endSecond', '');

const getValidatedTimeFormat = () => {
  const { subscribe, ...rest } = persistedTimeFormat;
  let isValidated = false;

  const validate = () => {
    if (isValidated) return;
    isValidated = true;

    const value = get(persistedTimeFormat);
    if (Object.values(BASE_TIME_FORMAT_OPTIONS).includes(value)) return;
    if (!Timezones[value]) {
      const adjustedTimeformat = getAdjustedTimeformat(value);
      persistedTimeFormat.set(adjustedTimeformat || DEFAULT_TIME_FORMAT);
    }
  };

  return {
    subscribe: (run: Subscriber<string>, invalidate?: () => void) => {
      validate();
      return subscribe(run, invalidate);
    },
    ...rest,
  };
};

export const timeFormat = getValidatedTimeFormat();
