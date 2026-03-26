<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { navOpen } from '$lib/stores/nav-open';

  interface Props {
    link: string;
    label: string;
    icon?: IconName;
    tooltip?: string;
    external?: boolean;
    animate?: boolean;
    disabled?: boolean;
    isActive?: (path: string) => boolean | undefined;
    testId?: string;
  }

  let {
    link,
    label,
    icon = undefined,
    tooltip = label,
    external = false,
    animate = false,
    disabled = false,
    isActive = undefined,
    testId = `${icon}-button`,
  }: Props = $props();

  const rel = $derived(external ? 'noopener noreferrer' : '');
  const target = $derived(external ? '_blank' : '');
  const active = $derived(isActive && isActive(page.url.href));
</script>

<div role="listitem" data-testid={testId} class="relative">
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
      'mb-1 flex items-center whitespace-nowrap px-2 py-1 text-sm',
      'hover:bg-black hover:bg-opacity-25 group-[.surface-black]:hover:bg-white group-[.surface-black]:hover:bg-opacity-25',
      active &&
        'bg-black bg-opacity-25 group-[.surface-black]:bg-white group-[.surface-black]:bg-opacity-25',
      disabled && 'pointer-events-none cursor-not-allowed opacity-50',
    )}
    class:text-disabled={disabled}
  >
    {#if icon}
      <div
        class="flex h-6 w-6 items-center after:absolute after:left-[calc(100%_+_1.5rem)] after:top-0 after:hidden after:h-8 after:items-center after:bg-slate-800 after:p-1 after:px-2 after:text-xs after:text-white after:content-[attr(data-tooltip)] group-data-[nav=closed]:hover:after:flex"
        data-tooltip={tooltip}
      >
        <Icon name={icon} {animate} />
      </div>
    {/if}
    <div
      class="opacity-0 transition-opacity group-data-[nav=open]:opacity-100"
      class:pointer-events-none={!$navOpen}
    >
      {label}
    </div>
  </a>
</div>
