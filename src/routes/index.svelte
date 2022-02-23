<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { goto } from '$app/navigation';

  $: {
    if ($settings?.defaultNamespace) {
      goto(`/namespaces/${$settings.defaultNamespace}`, { replaceState: true });
    }
  }
</script>
