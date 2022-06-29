<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import type { IconName } from '$holocene/icon/paths';

  export let label: string;
  export let icon: IconName = undefined;
  export let showDropdown: boolean = false;

  let width: number;
</script>

<div
  class="inline-block {$$props.class}"
  bind:clientWidth={width}
  on:click={() => (showDropdown = !showDropdown)}
>
  <div class="dropdown-button">
    {#if icon}
      <div class="ml-4">
        <Icon name={icon} scale={0.6} stroke="currentcolor" />
      </div>
    {/if}
    <span class="ml-2 mr-8">{label}</span>
    <div class="mr-2">
      <Icon scale={0.8} name={showDropdown ? 'caretUp' : 'caretDown'} />
    </div>
  </div>

  {#if showDropdown}
    <div class="dropdown" style="width: {width}px;">
      <slot />
    </div>
  {/if}
</div>

<style lang="postcss">
  .dropdown-button {
    @apply flex flex-row items-center justify-between gap-4 rounded-lg border border-gray-300 py-4;
  }

  .dropdown {
    @apply absolute z-50 mt-1 p-4 border border-gray-300 rounded-lg shadow-md bg-white;
  }
</style>
