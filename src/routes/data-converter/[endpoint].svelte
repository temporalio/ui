<script context="module">
  export const ssr = false;
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { notifications } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { dataConverterEndpoint } from '$lib/stores/data-converter-config';
  onMount(() => {
    let { endpoint } = $page.params;
    dataConverterEndpoint.set(window.atob(endpoint).trim());
    goto('/', { replaceState: true });
    notifications.add('success', 'Successfully set decoder');
  });
</script>
