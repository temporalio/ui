<script lang="ts">
  import type { Snippet } from 'svelte';

  import Tooltip from '$lib/holocene/tooltip.svelte';

  import type { IconName } from '../icon';
  import Icon from '../icon/icon.svelte';

  interface Props {
    icon: IconName;
    link: string;
    tooltip?: string;
    external?: boolean;
    class?: string;
    'data-testid'?: string;
    children?: Snippet;
  }

  let {
    icon,
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
      class="navigation-badge relative flex min-h-8 cursor-pointer items-center rounded-control border border-subtle bg-subtle text-primary transition-colors hover:bg-interactive-secondary-hover active:bg-interactive-secondary-active group-data-[nav=closed]:p-1 group-data-[nav=open]:px-2.5 group-data-[nav=open]:py-1"
    >
      <div
        class="flex h-6 w-6 items-center whitespace-nowrap group-data-[nav=open]:hidden group-data-[nav=closed]:justify-center"
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
  </Tooltip>
</div>

<style lang="postcss">
  @media (pointer: coarse) {
    .navigation-badge {
      @apply min-h-target;
    }
  }
</style>
