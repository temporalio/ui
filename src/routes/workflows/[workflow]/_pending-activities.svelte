<script lang="ts">
  import type { PendingActivityInfo } from '$types/temporal/api/workflow/v1/message';

  import PendingActivity from './_pending-activity.svelte';

  export let activities: PendingActivityInfo[];
</script>

<div>
  <h3 class="text-lg mt-6 mb-2">Pending Activities</h3>
  {#each activities as activity}
    <PendingActivity {activity} />
  {/each}
</div>
