<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import Icon from '../icon/icon.svelte';

  interface Props {
    onClick?: () => void;
    label: string;
    icon?: IconName;
    tooltip?: string;
    animate?: boolean;
    active?: boolean;
    disabled?: boolean;
    class?: string;
    'data-testid'?: string;
  }

  let {
    onClick = () => {},
    label,
    icon,
    tooltip = label,
    animate = false,
    active = false,
    disabled = false,
    class: className = '',
    'data-testid': testId,
  }: Props = $props();

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
    onclick={onClick}
    onkeydown={handleKeydown}
    tabindex="0"
    data-testid={testId}
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
