<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  const { namespace } = $derived(page.params);

  onMount(() => {
    const queryString = page.url.searchParams.toString();
    const redirectUrl = `/namespaces/${namespace}/workers?view=deployments${queryString ? `&${queryString}` : ''}`;
    goto(redirectUrl, { replaceState: true });
  });
</script>

<p>Redirecting...</p>
