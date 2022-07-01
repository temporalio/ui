<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import { clickOutside } from '$holocene/outside-click';
  import type { IconName } from '$holocene/icon/paths';

  export let label: string;
  export let icon: IconName = undefined;
  export let readonly: boolean = false;

  let showDropdown: boolean = false;

  let width: number;
  const handleClick = () => {
    if (!readonly) {
      showDropdown = !showDropdown;
    }
  };
</script>

<div
  class="inline-block {$$props.class}"
  bind:clientWidth={width}
  on:click={handleClick}
  use:clickOutside
  on:click-outside={() => (showDropdown = false)}
>
  <div class="dropdown-button" class:readonly>
    {#if icon}
      <div class="ml-4 flex items-center">
        <Icon
          name={icon}
          strokeWidth={1}
          width={12}
          height={12}
          stroke="currentcolor"
        />
      </div>
    {/if}
    <span class="ml-2 mr-8">{label}</span>
    {#if !readonly}
      <div class="mr-2">
        <Icon scale={0.8} name={showDropdown ? 'caretUp' : 'caretDown'} />
      </div>
    {/if}
  </div>

  {#if showDropdown && $$slots.default}
    <div class="dropdown" style="width: {width}px;">
      <slot />
    </div>
  {/if}
</div>

<style lang="postcss">
  .dropdown-button {
    @apply flex cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-300 py-4;
  }

  .dropdown-button.readonly {
    @apply cursor-default;
  }

  .dropdown {
    @apply absolute z-50 mt-1 min-w-max rounded-lg border border-gray-300 bg-white p-4 shadow-md;
  }
</style>
