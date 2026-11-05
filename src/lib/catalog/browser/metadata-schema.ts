import { z } from 'zod';

const nonEmptyString = z.string().min(1);

const uniqueValues = <Schema extends z.ZodType<string>>(schema: Schema) =>
  z
    .array(schema)
    .min(1)
    .refine((values) => new Set(values).size === values.length, {
      message: 'Values must be unique',
    });

export const catalogWorkspaceControlSchema = z.enum(['crash', 'stop', 'start']);

export const catalogWorkspaceMetadataSchema = z.strictObject({
  title: nonEmptyString.optional(),
  description: nonEmptyString.optional(),
  docsUrl: z.url({ protocol: /^https$/ }).optional(),
  controls: uniqueValues(catalogWorkspaceControlSchema).optional(),
  eject: z
    .strictObject({
      sdks: uniqueValues(nonEmptyString),
    })
    .optional(),
});

export const catalogScenarioSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  title: nonEmptyString,
  description: nonEmptyString.optional(),
  input: z.json(),
});

export const catalogScenariosSchema = z
  .array(catalogScenarioSchema)
  .min(1)
  .refine(
    (scenarios) =>
      new Set(scenarios.map(({ id }) => id)).size === scenarios.length,
    { message: 'Scenario IDs must be unique' },
  );

export type CatalogWorkspaceControl = z.infer<
  typeof catalogWorkspaceControlSchema
>;
export type CatalogWorkspaceMetadata = z.infer<
  typeof catalogWorkspaceMetadataSchema
>;
export type CatalogScenario = z.infer<typeof catalogScenarioSchema>;
