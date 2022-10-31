<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ changeMonth: { month: string } }>();

  const handleChange = (month: string) => {
    dispatch('changeMonth', { month });
  };

  import { monthNames } from '$lib/utilities/calendar';
</script>

<div class="flex flex-wrap gap-4 text-center">
  {#each monthNames as month}
    <div class="cell" on:click={() => handleChange(month)}>
      {month}
    </div>
  {/each}
</div>

<style lang="postcss">
  .cell {
    @apply rounded border p-2 cursor-pointer bg-gray-300 hover:bg-blue-700 hover:text-white;
  }
</style>
