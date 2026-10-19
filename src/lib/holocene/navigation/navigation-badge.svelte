<script lang="ts">
  import type { Snippet } from 'svelte';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { IconComponent } from '$lib/io/icon';

  interface Props {
    Icon: IconComponent;
    link: string;
    tooltip?: string;
    external?: boolean;
    class?: string;
    'data-testid'?: string;
    children?: Snippet;
  }

  let {
    Icon,
    link,
    tooltip = '',
    external = false,
    class: className = '',
    'data-testid': testId,
    children,
  }: Props = $props();

  const rel = $derived(external ? 'noopener noreferrer' : '');
  const target = $derived(external ? '_blank' : '');
</script>

<div class="relative {className}" role="listitem" data-testid={testId}>
  <Tooltip
    text={tooltip}
    right
    class="block"
    tooltipClass="text-white ml-4 group-data-[nav=open]:hidden"
  >
    <a
      href={link}
      {rel}
      {target}
      class="relative flex cursor-pointer items-center border border-primary bg-surface-overlay-primary text-primary group-data-[nav=closed]:p-1 group-data-[nav=open]:px-2.5 group-data-[nav=open]:py-2 hover:bg-interactive-tertiary-hover"
    >
      <div
        class="flex h-6 w-6 items-center whitespace-nowrap group-data-[nav=closed]:justify-center group-data-[nav=open]:hidden"
      >
        {#if Icon}
          <Icon />
        {/if}
      </div>
      <div
        class="text-center group-data-[nav=closed]:hidden group-data-[nav=open]:visible"
      >
        {@render children?.()}
      </div>
    </a>
  </Tooltip>
</div>
