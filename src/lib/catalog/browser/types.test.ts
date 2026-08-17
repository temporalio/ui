import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  BrowserCatalogDescriptor,
  JsonObject,
  JsonSchema,
  JsonValue,
} from './types';

describe('browser catalog types', () => {
  it('exposes named descriptor types without Node or executable imports', () => {
    expectTypeOf<
      BrowserCatalogDescriptor['input']['defaultValue']
    >().toMatchTypeOf<JsonValue>();
    expectTypeOf<
      BrowserCatalogDescriptor['input']['schema']
    >().toMatchTypeOf<JsonSchema>();

    const source = readFileSync(
      resolve('src/lib/catalog/browser/types.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/from ['"]node:/);
    expect(source).not.toMatch(/from ['"][^'"]*\/worker\//);
  });

  it('types standalone execution options as JSON objects', () => {
    type Execution = BrowserCatalogDescriptor['execution'];
    type ActivityExecution = Extract<
      Execution,
      { kind: 'standalone-activity' }
    >;
    type NexusExecution = Extract<
      Execution,
      { kind: 'standalone-nexus-operation' }
    >;

    expectTypeOf<ActivityExecution['timeouts']>().toEqualTypeOf<JsonObject>();
    expectTypeOf<ActivityExecution['policies']>().toEqualTypeOf<JsonObject>();
    expectTypeOf<NexusExecution['policies']>().toEqualTypeOf<JsonObject>();
  });
});
