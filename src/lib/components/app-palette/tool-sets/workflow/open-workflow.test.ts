import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

vi.mock('$lib/services/workflow-service', () => ({
  fetchWorkflow: vi.fn(),
}));

import { goto } from '$app/navigation';

import { appPalette } from '$lib/components/app-palette/app-palette-state.svelte';
import type { PaletteContext } from '$lib/components/app-palette/types';
import { fetchWorkflow } from '$lib/services/workflow-service';

import { openWorkflow } from './open-workflow';

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
    vi.mocked(fetchWorkflow).mockReset();
    appPalette.open = true;
  });

  it('shows the error when the fetch fails', async () => {
    vi.mocked(fetchWorkflow).mockResolvedValue({
      error: {
        message: 'Request unauthorized',
        statusCode: 403,
        statusText: 'Forbidden',
        response: new Response(null, { status: 403 }),
      },
    });
    const context = ctx();
    await openWorkflow(context, 'ns', 'order-1');

    expect(context.toast).toHaveBeenCalledWith('Request unauthorized', 'error');
    expect(goto).not.toHaveBeenCalled();
  });

  it('says the workflow is not found when there is no workflow', async () => {
    vi.mocked(fetchWorkflow).mockResolvedValue({});
    const context = ctx();
    await openWorkflow(context, 'ns', 'order-1');

    expect(context.toast).toHaveBeenCalledWith(
      'No workflow order-1 in ns',
      'warning',
    );
  });

  describe('with a workflow', () => {
    function found() {
      let resolve: (value: object) => void = () => {};
      vi.mocked(fetchWorkflow).mockReturnValue(
        new Promise((done) => (resolve = done)),
      );
      return () => resolve({ workflow: { id: 'order-1', runId: 'run-1' } });
    }

    it('closes the palette and opens the workflow', async () => {
      const resolve = found();
      const context = ctx();
      const opening = openWorkflow(context, 'ns', 'order-1');
      resolve();
      await opening;

      expect(context.close).toHaveBeenCalled();
      expect(goto).toHaveBeenCalledWith(
        expect.stringMatching(/\/namespaces\/ns\/workflows\/order-1\/run-1/),
      );
    });

    it('does not navigate when the user closed the palette during the fetch', async () => {
      const resolve = found();
      const context = ctx();
      const opening = openWorkflow(context, 'ns', 'order-1');
      appPalette.open = false;
      resolve();
      await opening;

      expect(goto).not.toHaveBeenCalled();
    });

    it('does not navigate when the user closed and opened the palette again', async () => {
      const resolve = found();
      const context = ctx();
      const opening = openWorkflow(context, 'ns', 'order-1');
      appPalette.open = false;
      appPalette.open = true;
      resolve();
      await opening;

      expect(goto).not.toHaveBeenCalled();
    });
  });
});
