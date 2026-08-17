import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { allEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
import { paletteNames } from '$lib/theme/palettes';
import { paletteCSSVariables } from '$lib/theme/variables';

import { getCategoryStrokeColor } from './colors';

const categories = allEventTypeOptions.map(({ value }) => value);

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8').replace(/\s+/g, ' ');

describe('event category color contract', () => {
  it('routes every event category through its own semantic token', () => {
    for (const category of categories) {
      expect(getCategoryStrokeColor(category)).toBe(
        `rgb(var(--color-event-category-${category}))`,
      );
    }
  });

  it('resolves a distinct category palette in every visual palette and mode', () => {
    for (const palette of paletteNames) {
      for (const mode of ['light', 'dark'] as const) {
        const variables = paletteCSSVariables[palette][mode];
        const colors = categories.map(
          (category) => variables[`--color-event-category-${category}`],
        );

        expect(
          colors.every(Boolean),
          `${palette}/${mode} is missing an event category token`,
        ).toBe(true);
        expect(
          new Set(colors).size,
          `${palette}/${mode} aliases event categories to the same color`,
        ).toBe(categories.length);
      }
    }
  });

  it('keeps each event surface on the shared category color resolver', () => {
    const consumers = [
      {
        name: 'Event History legend',
        path: 'src/lib/components/lines-and-dots/event-history-legend.svelte',
        contract: ['style:color={getCategoryStrokeColor(category)}'],
      },
      {
        name: 'Event History row',
        path: 'src/lib/components/event/event-summary-row.svelte',
        contract: ['style:color={getCategoryStrokeColor(event.category)}'],
      },
      {
        name: 'Timeline category icon',
        path: 'src/lib/components/lines-and-dots/timeline-graph/timeline-graph-row.svelte',
        contract: [
          'style:color={iconColor}',
          "getCategoryStrokeColor( decodedLocalActivity ? 'local-activity' : group.category",
        ],
      },
    ];

    for (const consumer of consumers) {
      const consumerSource = source(consumer.path);
      for (const contract of consumer.contract) {
        expect(consumerSource, `${consumer.name}: ${contract}`).toContain(
          contract,
        );
      }
    }
  });
});
