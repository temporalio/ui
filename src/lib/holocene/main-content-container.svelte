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
  class="relative flex h-full w-max flex-auto flex-col overflow-auto bg-background-primary text-primary"
  style="scroll-padding-top: var(--scroll-inset-top); scroll-padding-bottom: var(--scroll-inset-bottom);"
>
  {@render children?.()}
  <main id="content" tabindex="-1" class="pb-16 md:min-h-0 md:flex-1 md:pb-0">
    {@render main?.()}
  </main>
  {@render footer?.()}
</div>
