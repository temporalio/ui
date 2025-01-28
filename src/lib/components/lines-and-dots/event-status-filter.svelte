<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { clearActiveEvents } from '$lib/stores/active-events';
  import { eventStatusFilter } from '$lib/stores/filters';

  const options = [
    {
      label: 'Pending and Failed Only',
      value: 'pending',
    },
  ];

  const onOptionClick = () => {
    clearActiveEvents();
    $eventStatusFilter = !$eventStatusFilter;
  };
</script>

<div class="flex flex-wrap items-center items-center justify-center gap-4">
  {#each options as option}
    <div class="flex items-center">
      <Checkbox
        type="checkbox"
        onclick={onOptionClick}
        checked={$eventStatusFilter}
      />
      <div
        role="button"
        tabindex="0"
        class="flex cursor-pointer select-none items-center text-sm"
        on:click={onOptionClick}
        on:keydown={(e) => e.key === 'Enter' && onOptionClick}
      >
        <span class="block">{option.label}</span>
      </div>
    </div>
  {/each}
</div>
