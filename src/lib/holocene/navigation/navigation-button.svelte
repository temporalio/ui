<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';

  import Icon from '../icon/icon.svelte';

  export let onClick: () => void = () => {};
  export let label: string;
  export let icon: IconName | undefined = undefined;
  export let tooltip = label;
  export let animate = false;
  export let active = false;
  export let disabled = false;
</script>

<div
  role="button"
  on:click={onClick}
  on:keypress={onClick}
  tabindex="0"
  data-testid={$$props['data-testid']}
  class:disabled
  class="relative mb-1 flex items-center p-1 pl-2 text-sm font-medium whitespace-nowrap hover:bg-white hover:text-black hover:group-[.surface-primary]:bg-black hover:group-[.surface-primary]:text-white dark:hover:group-[.surface-primary]:bg-white dark:hover:group-[.surface-primary]:text-black"
>
  {#if icon}
    <div
      class="flex h-6 w-6 items-center after:absolute after:top-0 after:left-[calc(100%_+_1.5rem)] after:hidden after:h-8 after:items-center after:bg-slate-800 after:p-1 after:px-2 after:text-xs after:text-white after:content-[attr(data-tooltip)] hover:group-data-[nav=closed]:after:flex"
      data-tooltip={tooltip}
    >
      <Icon name={icon} {animate} {active} />
    </div>
  {/if}
  <div class="opacity-0 transition-opacity group-data-[nav=open]:opacity-100">
    {label}
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .disabled {
    @apply text-subtle pointer-events-none cursor-not-allowed;
  }
</style>
