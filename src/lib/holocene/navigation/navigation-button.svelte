<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import Icon from '../icon/icon.svelte';

  export let onClick: () => void = () => {};
  export let label: string;
  export let icon: IconName | undefined = undefined;
  export let tooltip = label;
  export let animate = false;
  export let active = false;
  export let disabled = false;
  export let className = '';
  export { className as class };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };
</script>

<Tooltip
  text={tooltip}
  right
  class="block"
  tooltipClass="rounded-none text-white ml-4 group-data-[nav=open]:hidden"
>
  <div
    role="button"
    on:click={onClick}
    on:keydown={handleKeydown}
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
      <div class="flex h-6 w-6 items-center">
        <Icon name={icon} {animate} {active} />
      </div>
    {/if}
    <div class="opacity-0 transition-opacity group-data-[nav=open]:opacity-100">
      {label}
    </div>
  </div>
</Tooltip>
