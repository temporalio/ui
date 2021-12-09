<script lang="ts">
  import Activity from './_pending-activity.svelte';

  export let activities: PendingActivity[];
  let showActivities = activities && activities.length;
</script>

{#if showActivities}
  <div class="mb-6 w-full">
    <h3 class="text-lg mb-2 font-semibold">Pending Activities</h3>
    {#each activities as activity}
      <Activity {activity} />
    {/each}
  </div>
{/if}
