import { describe, expect, it } from 'vitest';

import { matchesRules, paletteEnv, visibleToolSets } from './rules';
import type {
  PaletteContext,
  PaletteFacts,
  PaletteRules,
  PaletteTool,
  PaletteToolSet,
} from './types';

const tool = (id: string, rules?: PaletteTool['rules']): PaletteTool => ({
  id,
  section: id,
  rules,
  items: () => [],
});

describe('paletteEnv', () => {
  it('treats the dev server as local, even with a production flag', () => {
    expect(paletteEnv(true, false)).toBe('local');
    expect(paletteEnv(true, true)).toBe('local');
  });

  it('splits built apps into staging and production', () => {
    expect(paletteEnv(false, false)).toBe('staging');
    expect(paletteEnv(false, true)).toBe('production');
  });
});

describe('matchesRules', () => {
  it('allows everything when no rules are set', () => {
    expect(matchesRules(undefined, { env: 'production' })).toBe(true);
    expect(matchesRules({}, { env: 'production' })).toBe(true);
  });

  it('matches the env list', () => {
    const rules: PaletteRules = { env: ['local', 'staging'] };
    expect(matchesRules(rules, { env: 'staging' })).toBe(true);
    expect(matchesRules(rules, { env: 'production' })).toBe(false);
  });
});

describe('visibleToolSets', () => {
  const sets: PaletteToolSet[] = [
    {
      id: 'user',
      label: 'User',
      key: 'u',
      tools: [tool('nav')],
    },
    {
      id: 'dev',
      label: 'Dev',
      key: 'd',
      variant: 'dev',
      rules: { env: ['local', 'staging'] },
      tools: [tool('flags'), tool('cleanup', { env: ['local'] })],
    },
  ];

  const ids = (visible: PaletteToolSet[]) =>
    visible.map((set) => [set.id, set.tools.map(({ id }) => id)]);

  it('shows every set and tool locally', () => {
    expect(ids(visibleToolSets(sets, { env: 'local' }))).toEqual([
      ['user', ['nav']],
      ['dev', ['flags', 'cleanup']],
    ]);
  });

  it('drops tools whose rules do not match', () => {
    expect(ids(visibleToolSets(sets, { env: 'staging' }))).toEqual([
      ['user', ['nav']],
      ['dev', ['flags']],
    ]);
  });

  it('drops sets whose rules do not match', () => {
    expect(ids(visibleToolSets(sets, { env: 'production' }))).toEqual([
      ['user', ['nav']],
    ]);
  });

  it('drops a set when none of its tools match', () => {
    const only: PaletteToolSet[] = [
      { id: 'x', label: 'X', key: 'x', tools: [tool('a', { env: ['local'] })] },
    ];
    expect(visibleToolSets(only, { env: 'staging' })).toEqual([]);
  });
});

describe('user rules', () => {
  const facts = {
    env: 'production',
    flags: new Set(['beta-search']),
    can: (permission: string) => permission === 'namespace.list',
  } satisfies PaletteFacts;

  it('never matches a user rule before the user loads', () => {
    const anonymous: PaletteFacts = { env: 'production' };
    expect(matchesRules({ flags: ['beta-search'] }, anonymous)).toBe(false);
    expect(matchesRules({ permissions: ['usage.get'] }, anonymous)).toBe(false);
  });

  it('needs every listed flag and permission', () => {
    expect(matchesRules({ flags: ['beta-search'] }, facts)).toBe(true);
    expect(matchesRules({ flags: ['beta-search', 'dark-mode'] }, facts)).toBe(
      false,
    );
    expect(matchesRules({ permissions: ['namespace.list'] }, facts)).toBe(true);
    expect(
      matchesRules({ permissions: ['namespace.list', 'usage.get'] }, facts),
    ).toBe(false);
  });

  it('needs every kind of rule to match', () => {
    expect(
      matchesRules(
        { env: ['production'], flags: ['beta-search'] },
        { ...facts, env: 'staging' },
      ),
    ).toBe(false);
  });

  it('filters items by their rules each time a tool lists them', () => {
    const ctx: PaletteContext = {
      push: () => {},
      pop: () => {},
      close: () => {},
      toast: () => {},
      namespace: () => undefined,
      subject: () => undefined,
    };
    const [visible] = visibleToolSets(
      [
        {
          id: 'nav',
          label: 'Nav',
          key: 'g',
          tools: [
            {
              id: 'pages',
              section: 'Pages',
              items: () => [
                { id: 'open', title: 'Open', actions: [] },
                {
                  id: 'usage',
                  title: 'Usage',
                  rules: { permissions: ['usage.get'] },
                  actions: [],
                },
              ],
            },
          ],
        },
      ],
      facts,
    );
    expect(visible.tools[0].items(ctx).map(({ id }) => id)).toEqual(['open']);
  });
});
