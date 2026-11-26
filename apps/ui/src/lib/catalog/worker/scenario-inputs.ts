import validateJsonSchema from '../browser/schema-validator.js';
import type { BrowserCatalogMetadata } from '../browser/types';

type ScenarioExample = Pick<
  BrowserCatalogMetadata,
  'id' | 'input' | 'scenarios'
>;

export type InvalidScenarioInput = {
  exampleId: string;
  scenarioId: string;
};

export const findInvalidScenarioInputs = async (
  examples: readonly ScenarioExample[],
): Promise<InvalidScenarioInput[]> => {
  const checks = examples.flatMap((example) =>
    (example.scenarios ?? []).map(async (scenario) => ({
      exampleId: example.id,
      scenarioId: scenario.id,
      valid: await validateJsonSchema(example.input.schema, scenario.input),
    })),
  );
  const results = await Promise.all(checks);

  return results
    .filter(({ valid }) => !valid)
    .map(({ exampleId, scenarioId }) => ({ exampleId, scenarioId }));
};

export const assertScenarioInputs = async (
  examples: readonly ScenarioExample[],
) => {
  const invalid = await findInvalidScenarioInputs(examples);
  if (invalid.length === 0) return;

  const names = invalid
    .map(({ exampleId, scenarioId }) => `${exampleId}/${scenarioId}`)
    .join(', ');
  throw new Error(
    `Catalog scenario inputs do not match their example's input schema: ${names}`,
  );
};
