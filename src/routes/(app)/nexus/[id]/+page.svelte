<script lang="ts">
  import type { LayoutData } from './$types';

  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';

  export let data: LayoutData;

  $: ({ endpoint } = data);
</script>

<NexusEndpoint {endpoint} />
