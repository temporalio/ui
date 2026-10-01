<script lang="ts">
  import type { Snippet } from 'svelte';

  import DarkMode from '$lib/utilities/dark-mode';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<DarkMode />
<div class="min-h-screen bg-background-primary text-primary">
  {@render children()}
</div>
