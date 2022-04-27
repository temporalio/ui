<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { notifications } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  onMount(() => {
    let { port } = $page.params;
    dataConverterPort.set(port);
    goto('/', { replaceState: true });
    notifications.add('success', 'Successfully set decoder');
  });
</script>
