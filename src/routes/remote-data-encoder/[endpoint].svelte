<script context="module">
  export const ssr = false;
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { notifications } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
  onMount(() => {
    let { endpoint } = $page.params;
    dataEncoderEndpoint.set(decodeURIComponent(endpoint));
    goto('/', { replaceState: true });
    notifications.add('success', 'Successfully set decoder');
  });
</script>
