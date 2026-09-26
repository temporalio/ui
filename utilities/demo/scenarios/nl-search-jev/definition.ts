import { DEMO_SEARCHES } from './dataset';
import type { Options } from './scenario';
import { defineScenario } from '../../definition';

const scenarioOptions: Options = {};

export const definition = defineScenario({
  name: 'nl-search-jev',
  title: 'Natural-language workflow search and the Jev decision trace',
  feature: 'Jev',
  summary:
    'Starts a fixed set of workflows with known ids, types, statuses, and the custom search attributes CustomerTier and Attempts. Each search below has one right answer against that data, and the Why? panel shows how Jev chose each filter.',
  server: {
    source: 'auto',
    searchAttributes: {
      CustomerTier: 'Keyword',
      Attempts: 'Int',
    },
  },
  worker: { enabled: false },
  ui: { rebuildUiServer: true },
  scenario: scenarioOptions,
  preview: {
    notes: [
      ...DEMO_SEARCHES.map(
        ({ text, expect }) =>
          `Search "${text}" on the Workflows page. It must give ${expect}.`,
      ),
      'After a search, open Why? The panel must show one stage for each value Jev read, with the attribute and comparison it chose and their probabilities.',
      'Run a second search with the panel open. The carousel must move to the new search.',
      'Step back in the carousel. The filters, the list, and the search box must change to that search.',
      'Open order-1002 and select Review with Jev. Routine rows must collapse into toggle rows.',
      'To record the demo video: pnpm exec esno utilities/demo/scenarios/nl-search-jev/record.ts',
    ],
  },
});
