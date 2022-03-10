<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  onMount(async () => {
    goto(`/namespaces/${$page.stuff.settings.defaultNamespace}`, {
      replaceState: true,
    });
  });
</script>
