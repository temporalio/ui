<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { type IconComponent } from '$lib/io/icon';

  interface Props {
    link: string;
    label: string;
    Icon?: IconComponent;
    tooltip?: string;
    external?: boolean;
    animate?: boolean;
    disabled?: boolean;
    isActive?: (path: string) => boolean | undefined;
    'data-testid'?: string;
  }

  let {
    link,
    label,
    Icon,
    tooltip = label,
    external = false,
    animate = false,
    disabled = false,
    isActive,
    'data-testid': testId,
  }: Props = $props();

  const rel = $derived(external ? 'noopener noreferrer' : '');
  const target = $derived(external ? '_blank' : '');
  const active = $derived(isActive && isActive(page.url.href));
</script>

<div role="listitem" data-testid={testId} class="relative">
  <Tooltip
    text={tooltip}
    right
    class="block"
    tooltipClass="rounded-none text-white ml-4 group-data-[nav=open]:hidden"
  >
    <a
      href={link}
      {rel}
      {target}
      aria-hidden={disabled ? 'true' : 'false'}
      aria-disabled={disabled}
      class:disabled
      tabindex={disabled ? -1 : 0}
      data-track-name="navigation-item"
      data-track-intent="navigate"
      data-track-text={label}
      class={merge(
        'mb-2 flex items-center whitespace-nowrap rounded px-2 py-1 text-sm font-medium text-secondary hover:bg-surface-overlay-primary hover:text-primary',
        active &&
          'bg-interactive-secondary-hover text-brand hover:bg-interactive-secondary-press hover:text-brand',
        disabled && 'pointer-events-none cursor-not-allowed opacity-disabled',
      )}
      class:text-tertiary={disabled}
    >
      {#if Icon}
        <div class="flex h-6 w-6 items-center" class:animate-pulse={animate}>
          <Icon />
        </div>
      {/if}
      <div
        class="opacity-0 transition-opacity group-data-[nav=closed]:pointer-events-none group-data-[nav=open]:opacity-100 group-data-[nav=open]:delay-75 group-data-[nav=closed]:duration-75 group-data-[nav=open]:duration-150 group-data-[nav=closed]:ease-out group-data-[nav=open]:ease-linear motion-reduce:transition-none"
      >
        {label}
      </div>
    </a>
  </Tooltip>
</div>
