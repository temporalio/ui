<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { IconComponent } from '$lib/io/icon';

  interface Props {
    onClick?: () => void;
    label: string;
    Icon?: IconComponent;
    tooltip?: string;
    disabled?: boolean;
    class?: string;
    'data-testid'?: string;
  }

  let {
    onClick = () => {},
    label,
    Icon,
    tooltip = label,
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
      'relative flex items-center gap-3 whitespace-nowrap rounded p-2 text-xs font-medium text-secondary hover:bg-surface-primary hover:text-primary',
      disabled && 'pointer-events-none cursor-not-allowed opacity-disabled',
      className,
    )}
  >
    {#if Icon}
      <div class="flex size-4 shrink-0 items-center">
        <Icon />
      </div>
    {/if}
    <div class="opacity-0 transition-opacity group-data-[nav=open]:opacity-100">
      {label}
    </div>
  </div>
</Tooltip>
