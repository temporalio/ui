<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { IconName } from '../icon';
  import Icon from '../icon/icon.svelte';

  interface Props {
    icon?: IconName;
    link: string;
    tooltip?: string;
    external?: boolean;
    class?: string;
    children?: Snippet;
    'data-testid'?: string;
  }

  let {
    icon,
    link,
    tooltip = '',
    external = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let rel = $derived(external ? 'noopener noreferrer' : '');
  let target = $derived(external ? '_blank' : '');
</script>

<div
  class="relative {className}"
  role="listitem"
  data-testid={rest['data-testid']}
>
  <a
    href={link}
    {rel}
    {target}
    class="relative flex cursor-pointer items-center border border-white/10 bg-white/5 text-white hover:bg-white hover:text-black group-data-[nav=closed]:p-1 group-data-[nav=open]:px-2.5 group-data-[nav=open]:py-2"
  >
    <div
      class="flex h-6 w-6 items-center whitespace-nowrap after:absolute after:left-[calc(100%_+_1.5rem)] after:top-0 after:hidden after:h-8 after:items-center after:rounded-md after:bg-slate-800 after:p-1 after:px-2 after:text-xs after:text-white after:content-[attr(data-tooltip)] group-data-[nav=open]:hidden group-data-[nav=open]:justify-start group-data-[nav=closed]:justify-center group-data-[nav=closed]:hover:after:flex"
      data-tooltip={tooltip}
    >
      {#if icon}
        <Icon name={icon} />
      {/if}
    </div>
    <div
      class="text-center group-data-[nav=open]:visible group-data-[nav=closed]:hidden"
    >
      {@render children?.()}
    </div>
  </a>
</div>
