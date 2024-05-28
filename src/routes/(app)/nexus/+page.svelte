<script lang="ts">
  import NexusEndpoints from '$lib/pages/nexus-endpoints.svelte';

  import type { PageData } from '../$types';

  export let data: PageData;

  $: ({ endpoints } = data);
</script>

<NexusEndpoints {endpoints} />
