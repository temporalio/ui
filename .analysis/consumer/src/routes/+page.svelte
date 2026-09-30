<script>
  import '../app.css';
  import { WorkflowStatus } from '@forkbombeu/temporal-ui';

  const demoStatuses = [
    'Running',
    'Completed',
    'Failed',
    'Canceled',
    'Terminated',
    'TimedOut',
    'ContinuedAsNew',
  ];
</script>

<main class="space-y-4 p-8">
  <h1 class="text-2xl font-bold">Host app (Tailwind 4)</h1>
  <div class="flex flex-wrap gap-2">
    {#each demoStatuses as status (status)}
      <WorkflowStatus {status} />
    {/each}
  </div>
  <a class="text-blue-600 underline" href="/namespaces/default/workflows/demo/run-1"
    >history</a
  >
</main>
