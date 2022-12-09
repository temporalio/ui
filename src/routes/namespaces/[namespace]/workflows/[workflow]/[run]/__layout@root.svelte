<script lang="ts">
  import { onDestroy } from 'svelte';
  import { loading } from '$lib/stores/workflow-run';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  onDestroy(() => {
    clearPreviousEventParameters();
    $loading = true;
  });
</script>

<slot />
