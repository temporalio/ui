<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
    main?: Snippet;
    footer?: Snippet;
  };

  let { children, main, footer }: Props = $props();
</script>

<div id="content-wrapper" class="relative h-full w-max flex-auto overflow-auto">
  {@render children?.()}
  <main id="content" tabindex="-1" class="pb-16 md:pb-0">
    {@render main?.()}
  </main>
  {@render footer?.()}
</div>
