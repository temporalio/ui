<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className = undefined, children }: Props = $props();
</script>

<tr class={className}>
  {@render children?.()}
</tr>
