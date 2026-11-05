import { describe, expect, it } from 'vitest';

import {
  componentExports,
  componentTable,
  renderConsumerAgents,
} from './generate-consumer-agents.mjs';

describe('componentExports', () => {
  it('returns component exports and skips recipes and types', () => {
    const barrel = `
export { default as Button } from './button.svelte';
export { default as ButtonLink } from './link.svelte';
export { buttonRecipe } from './recipe';
export type { ButtonProps } from './button.svelte';
`;
    expect(componentExports(barrel)).toEqual(['Button', 'ButtonLink']);
  });

  it('reads multi-line export lists', () => {
    const barrel = `
export {
  default as RoundnessGroup,
  roundnessGroupRecipe,
} from './roundness-group.svelte';
`;
    expect(componentExports(barrel)).toEqual(['RoundnessGroup']);
  });
});

describe('componentTable', () => {
  it('lists each barrel with its import path and summarizes large ones', () => {
    const icons = Array.from(
      { length: 5 },
      (_, i) => `export { default as Icon${i} } from './icons/${i}.svelte';`,
    ).join('\n');

    const table = componentTable('@temporalio/ui', [
      { dir: 'badge', source: "export { default as Badge } from './b';" },
      { dir: 'icon', source: icons },
      { dir: 'empty', source: "export type { Thing } from './t';" },
    ]);

    expect(table.split('\n')).toEqual([
      '| Component                   | Import                    |',
      '| --------------------------- | ------------------------- |',
      '| `Badge`                     | `@temporalio/ui/io/badge` |',
      '| Icons (`Icon0`, `Icon1`, …) | `@temporalio/ui/io/icon`  |',
    ]);
  });
});

describe('renderConsumerAgents', () => {
  it('replaces the placeholder with the table', () => {
    expect(renderConsumerAgents('a\n<!-- io-components -->\nb', '| t |')).toBe(
      'a\n| t |\nb',
    );
  });

  it('throws when the placeholder is missing', () => {
    expect(() => renderConsumerAgents('a', '| t |')).toThrow(/io-components/);
  });
});
