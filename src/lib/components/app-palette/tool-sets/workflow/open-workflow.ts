import { goto } from '$app/navigation';

import { appPalette } from '$lib/components/app-palette/app-palette-state.svelte';
import type { PaletteContext } from '$lib/components/app-palette/types';
import {
  routeForEventHistory,
  routeForWorkflows,
} from '$lib/utilities/route-for';

// The workflow page loads the workflow and shows its own not found and
// permission errors. Without a run ID, the page opens the latest run.
export function workflowHref(
  namespace: string,
  workflowId: string,
  runId?: string,
): string {
  if (runId) {
    return routeForEventHistory({
      namespace,
      workflow: workflowId,
      run: runId,
    });
  }
  return `${routeForWorkflows({ namespace })}/${encodeURIComponent(workflowId)}`;
}

// The palette stays open, showing that it is working, until the page loads.
export async function openWorkflow(
  ctx: PaletteContext,
  namespace: string,
  workflowId: string,
  runId?: string,
): Promise<void> {
  const sessionOpen = appPalette.sessionCheck();
  await goto(workflowHref(namespace, workflowId, runId));
  if (sessionOpen()) ctx.close();
}
