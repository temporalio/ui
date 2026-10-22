<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  import {
    segmentCountRecipe,
    type SegmentProps,
    segmentRecipe,
  } from './segment.svelte';

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
    <span data-segment-count class={segmentCountRecipe({ selected })}
      >{count}</span
    >
  {/if}
</a>
