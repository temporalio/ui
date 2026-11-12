import { goto } from '$app/navigation';

import { appPalette } from '$lib/components/app-palette/app-palette-state.svelte';
import type { PaletteContext } from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';
import { fetchWorkflow } from '$lib/services/workflow-service';
import { routeForEventHistory } from '$lib/utilities/route-for';

// Opens the workflow only when it exists, so a wrong ID or namespace shows a
// message instead of an empty page.
export async function openWorkflow(
  ctx: PaletteContext,
  namespace: string,
  workflowId: string,
  runId?: string,
): Promise<void> {
  const sessionOpen = appPalette.sessionCheck();
  const { workflow, error } = await fetchWorkflow({
    namespace,
    workflowId,
    runId,
  });
  const notFound = translate('palette-workflow.not-found', {
    workflowId,
    namespace,
  });
  if (error) {
    ctx.toast(error.message ?? notFound, 'error');
    return;
  }
  if (!workflow) {
    ctx.toast(notFound, 'warning');
    return;
  }
  if (!sessionOpen()) return;

  // The palette stays open, showing that it is working, until the page loads.
  await goto(
    routeForEventHistory({
      namespace,
      workflow: workflow.id,
      run: workflow.runId,
    }),
  );
  if (sessionOpen()) ctx.close();
}
