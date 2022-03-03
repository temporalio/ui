<script lang="ts">
  import { loadSettings, settings } from '$lib/stores/settings';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(async () => {
    await loadSettings();
    if ($settings?.defaultNamespace) {
      goto(`/namespaces/${$settings.defaultNamespace}`, { replaceState: true });
    }
  });
</script>
