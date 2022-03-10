<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(async () => {
    goto(`/namespaces/${$page.stuff.settings.defaultNamespace}`, {
      replaceState: true,
    });
  });
</script>
