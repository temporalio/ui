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
  tooltipClass="ml-3 group-data-[nav=open]:hidden"
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
      'navigation-button relative mb-1 flex min-h-8 items-center gap-0 whitespace-nowrap rounded-control px-1 text-[0.8125rem] text-secondary transition-colors hover:bg-interactive-secondary-hover hover:text-primary active:bg-interactive-secondary-active group-data-[nav=open]:gap-2 group-data-[nav=open]:px-2',
      active &&
        'bg-interactive-secondary-active font-medium text-primary before:absolute before:inset-y-1 before:-left-2 before:w-0.5 before:bg-interactive',
      disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      className,
    )}
  >
    {#if icon}
      <div class="flex h-6 w-6 shrink-0 items-center justify-center">
        <Icon name={icon} {animate} {active} />
      </div>
    {/if}
    <div
      class="min-w-0 truncate opacity-0 transition-opacity group-data-[nav=open]:opacity-100"
    >
      {label}
    </div>
  </div>
</Tooltip>

<style lang="postcss">
  @media (pointer: coarse) {
    .navigation-button {
      @apply min-h-target;
    }
  }
</style>
