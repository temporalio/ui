<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export let link: string;
  export let label: string;
  export let icon: IconName | undefined = undefined;
  export let tooltip = label;
  export let external = false;
  export let animate = false;
  export let disabled = false;
  export let isActive: ((path: string) => boolean | undefined) | undefined =
    undefined;

  $: rel = external ? 'noopener noreferrer' : '';
  $: target = external ? '_blank' : '';
  $: active = isActive && isActive($page.url.href);
</script>

<div
  role="listitem"
  data-testid={$$props?.['data-testid'] || `${icon}-button`}
  class="relative"
>
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
        'mb-2 flex items-center whitespace-nowrap px-2 py-1 text-sm',
        'hover:bg-black hover:bg-opacity-25 group-[.surface-black]:hover:bg-white group-[.surface-black]:hover:bg-opacity-25',
        active &&
          'bg-black bg-opacity-25 group-[.surface-black]:bg-white group-[.surface-black]:bg-opacity-25',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      )}
      class:text-disabled={disabled}
    >
      {#if icon}
        <div class="flex h-6 w-6 items-center">
          <Icon name={icon} {animate} />
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
