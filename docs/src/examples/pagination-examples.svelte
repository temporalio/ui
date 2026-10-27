<script lang="ts">
  import { Pagination } from '$lib/io-ark/pagination';

  const workflows = Array.from({ length: 87 }, (_, index) => ({
    id: `order-fulfillment-${(index + 1).toString().padStart(4, '0')}`,
    status: index % 7 === 0 ? 'Failed' : 'Completed',
  }));

  let page = $state(1);
  let pageSize = $state(10);
  let footerPage = $state(3);

  const visible = $derived(
    workflows.slice((page - 1) * pageSize, page * pageSize),
  );
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-4">
    <ul class="divide-y divide-primary rounded border border-primary">
      {#each visible.slice(0, 3) as workflow (workflow.id)}
        <li class="flex justify-between px-4 py-2 font-mono text-xs">
          <span>{workflow.id}</span>
          <span class="font-sans text-secondary">{workflow.status}</span>
        </li>
      {/each}
    </ul>
    <Pagination
      count={workflows.length}
      bind:page
      bind:pageSize
      pageSizeOptions={[10, 25, 50]}
      label="Workflow pages"
    />
  </div>

  <div class="rounded border border-primary">
    <div class="px-4 py-3 text-sm text-secondary">Pending activities</div>
    <Pagination
      class="border-t border-primary px-4 py-2"
      count={340}
      bind:page={footerPage}
      pageSize={25}
      variant="compact"
      label="Pending activity pages"
    />
  </div>
</div>
