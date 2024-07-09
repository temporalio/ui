<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';

  import Icon from '../icon/icon.svelte';

  export let onClick: () => void;
  export let label: string;
  export let icon: IconName | undefined = undefined;
  export let tooltip = label;
  export let animate = false;
  export let active = false;
</script>

<div
  role="button"
  on:click={onClick}
  on:keypress={onClick}
  tabindex="0"
  data-testid={$$props['data-testid']}
  class="relative mb-1 flex items-center whitespace-nowrap rounded-lg p-1 pl-2 text-sm font-medium hover:bg-white hover:text-black group-[.surface-primary]:hover:bg-black group-[.surface-primary]:hover:text-white group-[.surface-primary]:dark:hover:bg-white group-[.surface-primary]:dark:hover:text-black"
>
  <div
    class="flex h-6 w-6 items-center after:absolute after:left-[calc(100%_+_1.5rem)] after:top-0 after:hidden after:h-8 after:items-center after:rounded-md after:bg-slate-800 after:p-1 after:px-2 after:text-xs after:text-white after:content-[attr(data-tooltip)] group-data-[nav=closed]:hover:after:flex"
    data-tooltip={tooltip}
  >
    {#if icon}
      <Icon name={icon} {animate} {active} />
    {/if}
  </div>
  <div class="opacity-0 transition-opacity group-data-[nav=open]:opacity-100">
    {label}
  </div>
</div>
