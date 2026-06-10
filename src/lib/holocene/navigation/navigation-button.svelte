<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';

  import Icon from '../icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { navOpen } from '$lib/stores/nav-open';

  export let onClick: () => void = () => {};
  export let label: string;
  export let icon: IconName | undefined = undefined;
  export let tooltip = label;
  export let animate = false;
  export let active = false;
  export let disabled = false;
  export let className = '';
  export { className as class };
</script>

<div
  role="button"
  on:click={onClick}
  on:keypress={onClick}
  tabindex="0"
  data-testid={$$props['data-testid']}
  data-track-name="navigation-button"
  data-track-intent="action"
  data-track-text={label}
  class={merge(
    'relative mb-2 flex items-center whitespace-nowrap pl-1 text-sm hover:bg-black hover:bg-opacity-25 group-[.surface-black]:hover:bg-white group-[.surface-black]:hover:bg-opacity-25',
    disabled && 'pointer-events-none cursor-not-allowed opacity-50',
    className,
  )}
>
  {#if icon}
    <Tooltip
      text={tooltip}
      right
      hide={$navOpen}
      class="flex h-6 w-6 items-center"
    >
      <Icon name={icon} {animate} {active} />
    </Tooltip>
  {/if}
  <div class="opacity-0 transition-opacity group-data-[nav=open]:opacity-100">
    {label}
  </div>
</div>
