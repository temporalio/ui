<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { navOpen } from '$lib/stores/nav-open';

  export let link: string;
  export let label: string;
  export let icon: IconName | undefined = undefined;
  export let tooltip = label;
  export let external = false;
  export let animate = false;
  export let disabled = false;
  export let isActive: (path: string) => boolean | undefined = undefined;

  $: rel = external ? 'noopener noreferrer' : '';
  $: target = external ? '_blank' : '';
  $: active = isActive && isActive($page.url.href);
</script>

<div
  role="listitem"
  data-testid={$$props?.['data-testid'] || `${icon}-button`}
  class="relative"
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
      'mb-1 flex items-center whitespace-nowrap p-1 pl-2 text-sm ',
      'hover:bg-black hover:bg-opacity-25 group-[.surface-black]:hover:bg-white group-[.surface-black]:hover:bg-opacity-25',
      active &&
        'bg-black bg-opacity-25 group-[.surface-black]:bg-white group-[.surface-black]:bg-opacity-25',
      disabled && 'pointer-events-none cursor-not-allowed text-subtle',
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
