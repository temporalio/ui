<script>import Panel from '../panel.svelte';
import WorkflowStatus from '../workflow-status.svelte';
import { formatDate } from '../../utilities/format-date';
import { timeFormat } from '../../stores/time-format';
import { fetchWorkflow } from '../../services/workflow-service';
import { decodeURIForSvelte } from '../../utilities/encode-uri';
import EmptyState from '../../holocene/empty-state.svelte';
import { routeForWorkflow } from '../../utilities/route-for';
import Link from '../../holocene/link.svelte';
export let recentRuns = [];
export let namespace;
</script>

<Panel>
  <h2 class="mb-4 text-2xl">Recent Runs</h2>
  {#each recentRuns.slice(0, 5) as run (run.startWorkflowResult.workflowId)}
    {#await fetchWorkflow({ namespace, workflowId: decodeURIForSvelte(run.startWorkflowResult.workflowId), runId: run.startWorkflowResult.runId }, fetch) then workflow}
      <div class="row">
        <div class="w-28">
          <WorkflowStatus status={workflow.status} />
        </div>
        <div class="w-96">
          <Link
            sveltekit:prefetch
            href={routeForWorkflow({
              workflow: run.startWorkflowResult.workflowId,
              run: run.startWorkflowResult.runId,
              namespace,
            })}
          >
            {run.startWorkflowResult.workflowId}
          </Link>
        </div>
        <div class="ml-auto">
          <p>{formatDate(run.actualTime, $timeFormat)}</p>
        </div>
      </div>
    {/await}
  {/each}
  {#if !recentRuns.length}
    <EmptyState title={'No Recent Runs'} />
  {/if}
</Panel>

<style>
  .row {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    display: inline-flex;
    height: 2.5rem;
    width: 100%;
    border-bottom-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity));
    padding-top: 0.25rem;
    padding-bottom: 0.25rem
}</style>
