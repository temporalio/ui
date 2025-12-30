<script lang="ts">
  import type { Snippet } from 'svelte';

  import ImportEventsView from '$lib/pages/import-events-view.svelte';

  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();
</script>

<ImportEventsView>
  {@render children()}
</ImportEventsView>
