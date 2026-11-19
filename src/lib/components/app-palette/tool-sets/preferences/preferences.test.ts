import { get } from 'svelte/store';

import { beforeEach, describe, expect, it } from 'vitest';

import type {
  PaletteContext,
  PaletteItem,
  PaletteTool,
  PaletteView,
} from '$lib/components/app-palette/types';
import {
  hourFormat,
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';
import { useDarkModePreference } from '$lib/utilities/dark-mode';

import theme from './theme.svelte';
import time from './time.svelte';

function context() {
  const pushed: PaletteView[] = [];
  const ctx: PaletteContext = {
    push: (view) => pushed.push(view),
    pop: () => {},
    close: () => {},
    toast: () => {},
    namespace: () => undefined,
    subject: () => undefined,
  };
  return { ctx, pushed };
}

function item(tool: PaletteTool, id: string): PaletteItem {
  const { ctx } = context();
  const found = tool.items(ctx).find((entry) => entry.id === id);
  if (!found) throw new Error(`No item ${id}`);
  return found;
}

async function choose(tool: PaletteTool, itemId: string, choiceId: string) {
  const { ctx, pushed } = context();
  await item(tool, itemId).actions[0].run(ctx);
  const choice = pushed[0].items().find((entry) => entry.id === choiceId);
  if (!choice) throw new Error(`No choice ${choiceId}`);
  await choice.actions[0].run(ctx);
  return pushed[0];
}

describe('preference tools', () => {
  beforeEach(() => {
    useDarkModePreference.set('system');
    timeFormat.set('local');
    timestampFormat.set('medium');
    hourFormat.set('system');
    relativeTime.set(false);
  });

  it('sets the theme and marks the current one', async () => {
    expect(item(theme, 'theme').accessory?.label).toBe('System');

    const view = await choose(theme, 'theme', 'dark');
    expect(get(useDarkModePreference)).toBe(true);
    expect(item(theme, 'theme').accessory?.label).toBe('Dark');
    expect(view.items().find(({ id }) => id === 'dark')?.accessory?.label).toBe(
      'Current',
    );

    await choose(theme, 'theme', 'light');
    expect(get(useDarkModePreference)).toBe(false);
  });

  it('sets the timezone and turns off relative time away from local', async () => {
    relativeTime.set(true);
    await choose(time, 'timezone', 'utc');
    expect(get(timeFormat)).toBe('UTC');
    expect(get(relativeTime)).toBe(false);
  });

  it('lists named timezones after Local and UTC', async () => {
    const { ctx, pushed } = context();
    await item(time, 'timezone').actions[0].run(ctx);
    const ids = pushed[0].items().map(({ id }) => id);
    expect(ids.slice(0, 2)).toEqual(['local', 'utc']);
    expect(ids.length).toBeGreaterThan(2);
  });

  it('sets the timestamp format', async () => {
    await choose(time, 'timestamp-format', 'iso');
    expect(get(timestampFormat)).toBe('iso');
  });

  it('sets the hour format, and blocks it for ISO timestamps', async () => {
    await choose(time, 'hour-format', '24');
    expect(get(hourFormat)).toBe('24');

    timestampFormat.set('iso');
    expect(item(time, 'hour-format').disabled).toBeTruthy();
  });

  it('turns relative time on in the local timezone', async () => {
    timeFormat.set('UTC');
    const { ctx } = context();
    await item(time, 'relative-time').actions[0].run(ctx);
    expect(get(relativeTime)).toBe(true);
    expect(get(timeFormat)).toBe('local');

    await item(time, 'relative-time').actions[0].run(ctx);
    expect(get(relativeTime)).toBe(false);
  });
});
