<script lang="ts">
  import { page } from '$app/stores';

  import type { IconName } from '$lib/holocene/icon';
  import { navOpen } from '$lib/stores/nav-open';

  import Icon from '../icon/icon.svelte';

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
    class:active
    class="mb-1 flex items-center rounded-xs p-1 pl-2 text-sm font-medium whitespace-nowrap"
    class:text-disabled={disabled}
  >
    {#if icon}
      <div
        class="flex h-6 w-6 items-center after:absolute after:top-0 after:left-[calc(100%_+_1.5rem)] after:hidden after:h-8 after:items-center after:bg-slate-800 after:p-1 after:px-2 after:text-xs after:text-white after:content-[attr(data-tooltip)] hover:group-data-[nav=closed]:after:flex"
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

<style lang="postcss">
  @reference "tailwindcss";

  a:hover,
  a.active {
    @apply bg-white text-black group-[.surface-primary]:bg-black group-[.surface-primary]:text-white dark:group-[.surface-primary]:bg-white group-[.surface-primary]:dark:text-black;
  }

  a.disabled {
    @apply text-subtle pointer-events-none cursor-not-allowed;
  }
</style>
