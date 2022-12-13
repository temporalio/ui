<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { toaster } from '$lib/stores/toaster';
  import { onMount } from 'svelte';
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  onMount(() => {
    let { port } = $page.params;
    dataConverterPort.set(port);
    goto('/', { replaceState: true });
    toaster.push({ message: 'Successfully set encoder' });
  });
</script>
