import { describe, expect, it } from 'vitest';

import {
  assertScenarioInputs,
  findInvalidScenarioInputs,
} from './scenario-inputs';
import type { CatalogScenario } from '../browser/metadata-schema';

const example = {
  id: 'money-transfer',
  input: {
    defaultValue: { amount: 100 },
    schema: {
      type: 'object',
      properties: { amount: { type: 'integer', minimum: 1 } },
      required: ['amount'],
    },
  },
};

describe('scenario inputs', () => {
  it('accepts scenario inputs that match the example input schema', async () => {
    await expect(
      findInvalidScenarioInputs([
        {
          ...example,
          scenarios: [
            { id: 'happy-path', title: 'Happy path', input: { amount: 5 } },
          ],
        },
      ]),
    ).resolves.toEqual([]);
  });

  it('accepts examples without scenarios', async () => {
    await expect(findInvalidScenarioInputs([example])).resolves.toEqual([]);
  });

  it('names each scenario whose input does not match', async () => {
    const scenarios: CatalogScenario[] = [
      { id: 'happy-path', title: 'Happy path', input: { amount: 5 } },
      { id: 'zero', title: 'Zero', input: { amount: 0 } },
      { id: 'missing', title: 'Missing', input: {} },
    ];
    const examples = [{ ...example, scenarios }];

    await expect(findInvalidScenarioInputs(examples)).resolves.toEqual([
      { exampleId: 'money-transfer', scenarioId: 'zero' },
      { exampleId: 'money-transfer', scenarioId: 'missing' },
    ]);
    await expect(assertScenarioInputs(examples)).rejects.toThrow(
      "Catalog scenario inputs do not match their example's input schema: money-transfer/zero, money-transfer/missing",
    );
  });
});
