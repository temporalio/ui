<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div
  in:fly={{ y: -50, duration: 150, delay: 50 }}
  out:fly={{ y: -50, duration: 150 }}
>
  {@render children?.()}
</div>
