<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import BadgeCount from '$lib/io/badge-count/badge-count.svelte';

  import { type SegmentProps, segmentRecipe } from './segment.svelte';

  export interface SegmentLinkProps
    extends
      Omit<HTMLAnchorAttributes, 'class'>,
      Pick<SegmentProps, 'selected' | 'count' | 'Icon' | 'class'> {
    href: string;
  }

  let {
    href,
    selected = false,
    count,
    Icon,
    class: className,
    children,
    ...rest
  }: SegmentLinkProps = $props();
</script>

<a
  aria-current={selected ? 'page' : undefined}
  {...rest}
  {href}
  data-selected={selected}
  class={segmentRecipe({ selected, className })}
>
  {#if Icon}
    <Icon width={12} height={12} />
  {/if}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {#if count != null}
    <BadgeCount size="sm" value={count} />
  {/if}
</a>
