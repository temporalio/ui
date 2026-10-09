<script lang="ts">
  import { page } from '$app/state';

  import PermissionDenied from '$lib/components/permission-denied.svelte';
  import Error from '$lib/holocene/error.svelte';

  const status = $derived(page.error?.statusCode ?? page.status);
</script>

{#if status === 403}
  <PermissionDenied />
{:else}
  <Error error={page.error} {status} />
{/if}
