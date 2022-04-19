<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  import { formatDate } from '$lib/utilities/format-date';
  import { routeForPendingActivities } from '$lib/utilities/route-for';
  import Link from '$lib/components/link.svelte';
  import Copyable from '$lib/components/copyable.svelte';

  const { pendingActivities } = $page.stuff.workflow;
  const { namespace, workflow, run } = $page.params;

  const href = routeForPendingActivities({ namespace, workflow, run });

  onMount(() => {
    window.Prism.highlightAll();
  });
</script>

{#if pendingActivities.length}
  <section class="border-2 border-gray-300 rounded-lg p-4">
    <h3 class="text-lg font-medium mb-4">Pending Activities</h3>
    <section class="w-full table-auto space-x-4">
      {#each pendingActivities as { id, ...pendingActivity } (id)}
        <a
          class="block md:flex content-between w-full border-b-2 border-gray-300 p-2 last-of-type:border-b-0 hover:bg-gray-50 gap-4 items-center"
          {href}
        >
          <div class="md:w-1/12 text-left font-normal text-gray-500 w-40">
            {pendingActivity.activityId}
          </div>
          <div class="w-full md:w-1/4">
            <div class="flex gap-2 items-center">
              <h4>Activity Name</h4>
              <p>
                <span class="bg-gray-300 text-gray-700 px-2 text-sm">
                  {pendingActivity.activityType}
                </span>
              </p>
            </div>
          </div>
          <div class="w-full md:w-5/12">
            <div class="flex gap-2 items-center">
              <h3 class="whitespace-nowrap">Last Failure</h3>
              {#if pendingActivity.lastFailure}
                <Copyable content={pendingActivity.lastFailure?.message}>
                  <pre
                    class="w-full rounded-lg"><code class="language-json">{pendingActivity.lastFailure?.message}</code></pre>
                </Copyable>
              {:else}
                <span class="bg-gray-300 text-gray-700 px-2 text-sm"
                  >(Empty)</span
                >
              {/if}
            </div>
          </div>
          <div class="w-full md:w-1/4">
            <div class="flex gap-2">
              <h4>Last Heartbeat Time</h4>
              <p>{formatDate(pendingActivity.lastHeartbeatTime)}</p>
            </div>
          </div>
        </a>
      {/each}
    </section>
    <div class="text-right">
      <Link {href}>Show all</Link>
    </div>
  </section>
{/if}
