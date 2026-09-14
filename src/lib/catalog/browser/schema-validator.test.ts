import { getAllRegisteredSchemaUris } from '@hyperjump/json-schema/draft-2020-12';
import { describe, expect, it, vi } from 'vitest';

import validateJsonSchema from './schema-validator';
import type { JsonSchema } from './types';

describe('validateJsonSchema', () => {
  it('honors boolean schema semantics', async () => {
    await expect(
      validateJsonSchema(true, { workflow: 'Temporal' }),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(false, { workflow: 'Temporal' }),
    ).resolves.toBe(false);
  });

  it('enforces array uniqueness and containment assertions', async () => {
    const schema = {
      type: 'array',
      uniqueItems: true,
      contains: { const: 'Temporal' },
    };

    await expect(
      validateJsonSchema(schema, ['Temporal', 'Cloud']),
    ).resolves.toBe(true);
    await expect(validateJsonSchema(schema, ['Cloud', 'Cloud'])).resolves.toBe(
      false,
    );
  });

  it('evaluates composed conditional branches', async () => {
    const schema = {
      type: 'object',
      allOf: [
        {
          if: {
            properties: { target: { const: 'cloud' } },
            required: ['target'],
          },
          then: { required: ['cloudRegion'] },
          else: { required: ['localPath'] },
        },
      ],
    };

    await expect(
      validateJsonSchema(schema, { target: 'cloud', cloudRegion: 'us-east-1' }),
    ).resolves.toBe(true);
    await expect(validateJsonSchema(schema, { target: 'cloud' })).resolves.toBe(
      false,
    );
  });

  it('resolves escaped local JSON Pointer segments and array indices', async () => {
    const schema: JsonSchema = {
      $ref: '#/$defs/workflow~1name~0kind/anyOf/0',
      $defs: {
        'workflow/name~kind': {
          anyOf: [{ const: 'Temporal' }, { type: 'number' }],
        },
      },
    };

    await expect(validateJsonSchema(schema, 'Temporal')).resolves.toBe(true);
    await expect(validateJsonSchema(schema, 'Cloud')).resolves.toBe(false);
  });

  it('rejects a non-productive local reference cycle as an invalid schema', async () => {
    await expect(
      validateJsonSchema(
        {
          $defs: {
            cycle: { $ref: '#/$defs/cycle' },
          },
          $ref: '#/$defs/cycle',
        },
        'Temporal',
      ),
    ).rejects.toThrow();
  });

  it('rejects nested external references before fetching schemas', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('A schema fetch was attempted'));

    try {
      for (const referenceKeyword of ['$ref', '$dynamicRef'] as const) {
        await expect(
          validateJsonSchema(
            {
              $defs: {
                locallyReferenced: {
                  allOf: [
                    {
                      properties: {
                        input: {
                          [referenceKeyword]:
                            'https://schemas.example.com/workflow',
                        },
                      },
                      required: ['input'],
                    },
                  ],
                },
              },
              $ref: '#/$defs/locallyReferenced',
            },
            { input: 'Temporal' },
          ),
        ).rejects.toThrow('External JSON Schema references are not supported');
      }

      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('does not treat $ref-shaped const data as a schema reference', async () => {
    const value = { $ref: 'https://example.test/not-a-schema-ref' };

    await expect(validateJsonSchema({ const: value }, value)).resolves.toBe(
      true,
    );
  });

  it('reuses an identical schema across concurrent validations', async () => {
    const schema = {
      type: 'string',
    };
    const registeredSchemaCount = getAllRegisteredSchemaUris().filter((uri) =>
      uri.startsWith('urn:temporal:catalog:schema:'),
    ).length;

    await expect(
      Promise.all([
        validateJsonSchema(schema, 'Temporal'),
        validateJsonSchema(schema, 42),
        validateJsonSchema(schema, 'Cloud'),
      ]),
    ).resolves.toEqual([true, false, true]);
    expect(
      getAllRegisteredSchemaUris().filter((uri) =>
        uri.startsWith('urn:temporal:catalog:schema:'),
      ),
    ).toHaveLength(registeredSchemaCount + 1);
  });

  it('validates a draft-2020-12 local array schema when CSP blocks Function', async () => {
    const functionSpy = vi
      .spyOn(globalThis, 'Function')
      .mockImplementation(() => {
        throw new Error(
          'Refused to evaluate a string as JavaScript due to CSP',
        );
      });

    try {
      expect(
        await validateJsonSchema(
          {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'array',
            items: { $ref: '#/$defs/workflowName' },
            $defs: {
              workflowName: { type: 'string' },
            },
          },
          ['Temporal'],
        ),
      ).toBe(true);
    } finally {
      functionSpy.mockRestore();
    }
  });
});
