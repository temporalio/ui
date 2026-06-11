<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { navOpen } from '$lib/stores/nav-open';

  import type { IconName } from '../icon';
  import Icon from '../icon/icon.svelte';

  export let icon: IconName;
  export let link: string;
  export let tooltip: string = '';
  export let external = false;

  let className: string = '';
  export { className as class };

  $: rel = external ? 'noopener noreferrer' : '';
  $: target = external ? '_blank' : '';
</script>

<div
  class="relative {className}"
  role="listitem"
  data-testid={$$props['data-testid']}
>
  <a
    href={link}
    {rel}
    {target}
    class="relative flex cursor-pointer items-center border border-white/10 bg-white/5 text-white hover:bg-white hover:text-black group-data-[nav=closed]:p-1 group-data-[nav=open]:px-2.5 group-data-[nav=open]:py-2"
  >
    <Tooltip
      text={tooltip}
      right
      hide={$navOpen}
      class="flex h-6 w-6 items-center whitespace-nowrap group-data-[nav=open]:hidden group-data-[nav=closed]:justify-center"
    >
      {#if icon}
        <Icon name={icon} />
      {/if}
    </Tooltip>
    <div
      class="text-center group-data-[nav=open]:visible group-data-[nav=closed]:hidden"
    >
      <slot />
    </div>
  </a>
</div>
