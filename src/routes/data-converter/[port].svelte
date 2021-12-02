<script context="module">
  export const ssr = false;
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { notifications } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { decryptPort } from '$lib/stores/decrypt';

  onMount(() => {
    let { port } = $page.params;
    decryptPort.set(port);
    goto('/');
    notifications.add('success', 'Successfully set decoder');
  });
</script>
