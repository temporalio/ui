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
    tooltipClass="rounded-none text-io-content-white ml-4 group-data-[nav=open]:hidden"
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
        'mb-2 flex items-center whitespace-nowrap px-2 py-1 text-sm',
        'hover:bg-black hover:bg-opacity-25 group-[.navigation-inverse]:hover:bg-white group-[.navigation-inverse]:hover:bg-opacity-25',
        active &&
          'bg-black bg-opacity-25 group-[.navigation-inverse]:bg-white group-[.navigation-inverse]:bg-opacity-25',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      )}
      class:text-io-content-tertiary={disabled}
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
