<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { notifications } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { dataEncoder } from '$lib/stores/data-encoder-config';
  onMount(() => {
    let { endpoint } = $page.params;
    dataEncoder.set('endpoint', decodeURIComponent(endpoint));
    goto('/', { replaceState: true });
    notifications.add('success', 'Successfully set encoder');
  });
</script>
