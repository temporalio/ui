import { describe, expect, it } from 'vitest';

import { colorScales } from '$lib/theme/io/themes';
import type { WorkflowStatus } from '$lib/types/workflows';

import { getWorkflowStatusFavicon } from './get-workflow-status-favicon';

const decode = (dataUri: string | undefined) =>
  decodeURIComponent((dataUri ?? '').replace('data:image/svg+xml,', ''));

describe('getWorkflowStatusFavicon', () => {
  it('colors the icon by workflow status', () => {
    expect(decode(getWorkflowStatusFavicon('Running'))).toContain(
      `fill="${colorScales.blue[11]}"`,
    );
    expect(decode(getWorkflowStatusFavicon('Completed'))).toContain(
      `fill="${colorScales.green[11]}"`,
    );
    expect(decode(getWorkflowStatusFavicon('Failed'))).toContain(
      `fill="${colorScales.red[11]}"`,
    );
    expect(decode(getWorkflowStatusFavicon('TimedOut'))).toContain(
      `fill="${colorScales.persimmon[11]}"`,
    );
    expect(decode(getWorkflowStatusFavicon('Terminated'))).toContain(
      `fill="${colorScales.amber[11]}"`,
    );
    expect(decode(getWorkflowStatusFavicon('Canceled'))).toContain(
      `fill="${colorScales.slate[9]}"`,
    );
  });

  it('gives every status a distinct icon from its neighbours in the badge palette', () => {
    expect(getWorkflowStatusFavicon('Failed')).not.toBe(
      getWorkflowStatusFavicon('TimedOut'),
    );
    expect(getWorkflowStatusFavicon('Failed')).not.toBe(
      getWorkflowStatusFavicon('Terminated'),
    );
  });

  it('returns a data URI holding an svg', () => {
    const icon = getWorkflowStatusFavicon('Running');
    expect(icon?.startsWith('data:image/svg+xml,')).toBe(true);
    expect(decode(icon)).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(icon).not.toContain('#');
  });

  it('has no icon for an unknown or missing status', () => {
    expect(getWorkflowStatusFavicon(null)).toBeUndefined();
    expect(getWorkflowStatusFavicon(undefined)).toBeUndefined();
    expect(
      getWorkflowStatusFavicon('Unspecified' as WorkflowStatus),
    ).toBeUndefined();
  });
});
