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
  class="relative flex min-h-full w-max flex-auto flex-col overflow-auto"
>
  {@render children?.()}
  <main id="content" tabindex="-1" class="grow pb-16 md:pb-0">
    {@render main?.()}
  </main>
  {@render footer?.()}
</div>
