<script lang="ts">
  import { page } from '$app/stores';

  import type { IconName } from '$lib/holocene/icon';
  import { navOpen } from '$lib/stores/nav-open';

  import Icon from '../icon/icon.svelte';

  interface Props {
    link: string;
    label: string;
    icon?: IconName;
    tooltip?: string;
    external?: boolean;
    animate?: boolean;
    disabled?: boolean;
    isActive?: (path: string) => boolean;
  }

  let {
    link,
    label,
    icon,
    tooltip = label,
    external = false,
    animate = false,
    disabled = false,
    isActive,
    ...rest
  }: Props = $props();

  let rel = $derived(external ? 'noopener noreferrer' : '');
  let target = $derived(external ? '_blank' : '');
  let active = $derived(isActive && isActive($page.url.href));
</script>

<div
  role="listitem"
  data-testid={rest['data-testid'] || `${icon}-button`}
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
    class="mb-1 flex items-center whitespace-nowrap rounded-sm p-1 pl-2 text-sm font-medium"
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

<style lang="postcss">
  a:hover,
  a.active {
    @apply bg-white text-black group-[.surface-primary]:bg-black group-[.surface-primary]:text-white group-[.surface-primary]:dark:bg-white group-[.surface-primary]:dark:text-black;
  }

  a.disabled {
    @apply pointer-events-none cursor-not-allowed text-subtle;
  }
</style>
