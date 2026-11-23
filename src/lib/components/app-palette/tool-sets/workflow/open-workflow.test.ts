import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

import { goto } from '$app/navigation';

import { appPalette } from '$lib/components/app-palette/app-palette-state.svelte';
import type { PaletteContext } from '$lib/components/app-palette/types';

import { openWorkflow, workflowHref } from './open-workflow';

function ctx(): PaletteContext {
  return {
    push: vi.fn(),
    pop: vi.fn(),
    close: vi.fn(),
    toast: vi.fn(),
    namespace: () => 'ns',
    subject: () => undefined,
  };
}

describe('openWorkflow', () => {
  beforeEach(() => {
    vi.mocked(goto).mockReset();
    appPalette.open = true;
  });

  it('opens the run without a request first, then closes the palette', async () => {
    const context = ctx();
    await openWorkflow(context, 'other', 'order-1', 'run-1');

    expect(goto).toHaveBeenCalledWith(
      expect.stringMatching(/\/namespaces\/other\/workflows\/order-1\/run-1/),
    );
    expect(context.close).toHaveBeenCalled();
    expect(context.toast).not.toHaveBeenCalled();
  });

  it('opens the workflow page, which picks the latest run, without a run ID', () => {
    expect(workflowHref('ns', 'order/1')).toMatch(
      /\/namespaces\/ns\/workflows\/order%2F1$/,
    );
  });

  it('does not close a palette the user opened again during navigation', async () => {
    let finish: () => void = () => {};
    vi.mocked(goto).mockReturnValue(new Promise((done) => (finish = done)));
    const context = ctx();
    const opening = openWorkflow(context, 'ns', 'order-1', 'run-1');
    appPalette.open = false;
    appPalette.open = true;
    finish();
    await opening;

    expect(context.close).not.toHaveBeenCalled();
  });
});
