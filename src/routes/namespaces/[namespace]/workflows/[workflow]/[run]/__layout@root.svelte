<script lang="ts">
  import { onDestroy } from 'svelte';
  import { loading } from '$lib/stores/workflow-run';

  onDestroy(() => {
    $loading = true;
  });
</script>

<slot />
