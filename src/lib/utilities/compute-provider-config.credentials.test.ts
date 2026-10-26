import { describe, expect, it } from 'vitest';

import type { ComputeSection } from '$lib/components/workers/serverless-worker-form/fields/types';

import { credentialOverrides } from './compute-provider-config';

// Stand-ins: the map only carries the components through, and never renders
// them, so their identity is the whole contract.
const modalConnectionPicker = (() => {}) as unknown as ComputeSection;
const somethingElse = (() => {}) as unknown as ComputeSection;

describe('credentialOverrides', () => {
  it('is empty when no consumer supplies one', () => {
    expect(credentialOverrides(undefined)).toEqual({});
    expect(credentialOverrides({})).toEqual({});
    expect(credentialOverrides({ providers: [{ value: 'modal' }] })).toEqual(
      {},
    );
  });

  it('keys each supplied component by its provider', () => {
    expect(
      credentialOverrides({
        providers: [
          { value: 'lambda' },
          { value: 'modal', credentials: modalConnectionPicker },
        ],
      }),
    ).toEqual({ modal: modalConnectionPicker });
  });

  it('carries one per provider, so an override is never shared by accident', () => {
    const overrides = credentialOverrides({
      providers: [
        { value: 'modal', credentials: modalConnectionPicker },
        { value: 'lambda', credentials: somethingElse },
      ],
    });

    expect(overrides.modal).toBe(modalConnectionPicker);
    expect(overrides.lambda).toBe(somethingElse);
    expect(overrides['cloud-run']).toBeUndefined();
  });
});
