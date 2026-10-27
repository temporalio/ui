<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { ScrollAreaOrientation, ScrollAreaScrollbars } from './recipe';

  export interface ScrollAreaProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id'
  > {
    label: string;
    orientation?: ScrollAreaOrientation;
    scrollbars?: ScrollAreaScrollbars;
    height?: string;
    maxHeight?: string;
    id?: string;
    class?: string;
    viewportClass?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { ScrollArea as ArkScrollArea } from '@ark-ui/svelte/scroll-area';

  import {
    scrollAreaCornerRecipe,
    scrollAreaRecipe,
    scrollAreaScrollbarRecipe,
    scrollAreaThumbRecipe,
    scrollAreaViewportRecipe,
  } from './recipe';

  let {
    label,
    orientation = 'vertical',
    scrollbars = 'hover',
    height,
    maxHeight,
    id,
    class: className,
    viewportClass,
    children,
    ...rest
  }: ScrollAreaProps = $props();

  const showVertical = $derived(orientation !== 'horizontal');
  const showHorizontal = $derived(orientation !== 'vertical');
</script>

<ArkScrollArea.Root
  {id}
  class={scrollAreaRecipe(className)}
  style={height ? `height: ${height}` : undefined}
  {...rest}
>
  <ArkScrollArea.Viewport
    tabindex={0}
    role="region"
    aria-label={label}
    style={maxHeight ? `max-height: ${maxHeight}` : undefined}
    class={scrollAreaViewportRecipe({ orientation, className: viewportClass })}
  >
    <ArkScrollArea.Content>
      {@render children?.()}
    </ArkScrollArea.Content>
  </ArkScrollArea.Viewport>
  {#if showVertical}
    <ArkScrollArea.Scrollbar
      orientation="vertical"
      class={scrollAreaScrollbarRecipe(scrollbars)}
    >
      <ArkScrollArea.Thumb class={scrollAreaThumbRecipe()} />
    </ArkScrollArea.Scrollbar>
  {/if}
  {#if showHorizontal}
    <ArkScrollArea.Scrollbar
      orientation="horizontal"
      class={scrollAreaScrollbarRecipe(scrollbars)}
    >
      <ArkScrollArea.Thumb class={scrollAreaThumbRecipe()} />
    </ArkScrollArea.Scrollbar>
  {/if}
  {#if orientation === 'both'}
    <ArkScrollArea.Corner class={scrollAreaCornerRecipe()} />
  {/if}
</ArkScrollArea.Root>
