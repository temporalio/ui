<script lang="ts">
  import { onDestroy } from 'svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<slot />
