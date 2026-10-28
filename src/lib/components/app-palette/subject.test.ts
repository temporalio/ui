import { describe, expect, it } from 'vitest';

import { subjectFromParams } from './subject';

describe('subjectFromParams', () => {
  it('has no subject off namespace routes', () => {
    expect(subjectFromParams({})).toBeUndefined();
  });

  it('gives the namespace on namespace routes', () => {
    expect(subjectFromParams({ namespace: 'ns' })).toEqual({
      kind: 'namespace',
      namespace: 'ns',
    });
  });

  it('gives the workflow and run on workflow routes', () => {
    expect(
      subjectFromParams({ namespace: 'ns', workflow: 'wf', run: 'r1' }),
    ).toEqual({
      kind: 'workflow',
      namespace: 'ns',
      workflowId: 'wf',
      runId: 'r1',
    });
  });

  it('has no subject on imported or archived histories', () => {
    const params = { namespace: 'ns', workflow: 'wf', run: 'r1' };
    expect(
      subjectFromParams(params, '/import/events/[namespace]/[workflow]/[run]'),
    ).toBeUndefined();
    expect(
      subjectFromParams(
        params,
        '/namespaces/[namespace]/archival/[workflow]/[run]',
      ),
    ).toBeUndefined();
  });
});
