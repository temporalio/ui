<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
    main?: Snippet;
    footer?: Snippet;
  };

  let { children, main, footer }: Props = $props();
</script>

<div
  id="content-wrapper"
  class="relative h-full w-max flex-auto overflow-auto"
  style="scroll-padding-top: calc(var(--top-nav-height, 3rem) + var(--banner-height, 0px)); scroll-padding-bottom: var(--bottom-nav-height, 0px);"
>
  {@render children?.()}
  <main id="content" tabindex="-1" class="pb-16 md:pb-0">
    {@render main?.()}
  </main>
  {@render footer?.()}
</div>
