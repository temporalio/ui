<script lang="ts">
  import { onMount } from 'svelte';
  
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  import { dataConverterPort } from '$lib/stores/data-converter-config';
  import { toaster } from '$lib/stores/toaster';
  
  onMount(() => {
    let { port } = $page.params;
    dataConverterPort.set(port);
    goto('/', { replaceState: true });
    toaster.push({ message: 'Successfully set encoder' });
  });
</script>
