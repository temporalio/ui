<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { goto } from '$app/navigation';

  const navigateTo = $settings.defaultNamespace;
  goto(`/namespaces/${navigateTo}`);
</script>
