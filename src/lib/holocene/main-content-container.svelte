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
  class="relative h-full w-full min-w-0 max-w-full flex-1 overflow-auto"
  style="scroll-padding-top: var(--scroll-inset-top); scroll-padding-bottom: var(--scroll-inset-bottom);"
>
  {@render children?.()}
  <main
    id="content"
    tabindex="-1"
    class="w-full min-w-0 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0"
  >
    {@render main?.()}
  </main>
  {@render footer?.()}
</div>
