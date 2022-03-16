<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  import { formatDate } from '$lib/utilities/format-date';

  const { pendingActivities } = $page.stuff.workflow;
  const pendingActivitiesHref = '../../pending-activities';

  onMount(() => {
    window.Prism.highlightAll();
  });
</script>

{#if pendingActivities.length}
  <section class="border-2 border-gray-300 rounded-lg p-4">
    <h3 class="text-lg font-medium mb-4">Pending Activities</h3>
    <table class="w-full table-auto space-x-4">
      {#each pendingActivities as { id, ...pendingActivity }}
        <tr class="border-b-2 border-gray-300 pb-4 last-of-type:border-b-0">
          <th class="text-left font-normal text-gray-500">
            <a href="{pendingActivitiesHref}#{id}">
              {pendingActivity.activityId}
            </a>
          </th>
          <td>
            <div class="flex gap-2">
              <h4>Activity Name</h4>
              <p>
                <span class="bg-gray-300 text-gray-700 px-2">
                  {pendingActivity.activityType?.name}
                </span>
              </p>
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <h3>Last Failure</h3>
              <pre
                style="padding: 0 1em; margin: 0"
                class="rounded-lg"><code class="language-json">{pendingActivity.lastFailure}</code></pre>
            </div>
          </td>
          <td>
            <div class="flex gap-2">
              <h4>Last Heartbeat Time</h4>
              <p>{formatDate(pendingActivity.lastHeartbeatTime)}</p>
            </div>
          </td>
        </tr>
      {/each}
    </table>
    <div class="text-right">
      <a href={pendingActivitiesHref} class="border-b-2 border-blue-600">
        Show all
      </a>
    </div>
  </section>
{/if}
