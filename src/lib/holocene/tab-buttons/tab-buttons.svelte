<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  setContext<boolean>('group', true);

  let { children, class: className }: { children?: Snippet; class?: string } =
    $props();
</script>

<div class="flex {className}" role="tablist">
  {@render children?.()}
</div>
