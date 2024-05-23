<script lang="ts">
  import type { PageData } from './$types';

  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';

  export let data: PageData;

  $: ({ endpoint } = data);
</script>

<NexusEndpoint {endpoint} />
