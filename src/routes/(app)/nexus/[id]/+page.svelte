<script lang="ts">
  import { page } from '$app/stores';
  // import NexusAdminView from '$lib/pages/nexus-admin-view.svelte';

  import NexusView from '$lib/pages/nexus-view.svelte';

  import services from '$fixtures/nexus-services.json';

  $: ({ id } = $page.params);

  $: service = services.find((service) => service.id === id);
</script>

<!-- <NexusAdminView {service} /> -->
<NexusView {service} />
