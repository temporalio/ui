<script lang="ts">
  import type { PendingActivityInfo } from '$types/temporal/api/workflow/v1/message';

  import PendingActivity from './_pending-activity.svelte';

  export let activities: PendingActivityInfo[];
  let showActivities = activities && activities.length;
</script>

{#if showActivities}
  <div class="mb-6 w-full">
    <h3 class="text-lg mb-2">Pending Activities</h3>
    {#each activities as activity}
      <PendingActivity {activity} />
    {/each}
  </div>
{/if}
