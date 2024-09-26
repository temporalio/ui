<script lang="ts">
  import { page } from '$app/stores';

  import type { LayoutData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';

  export let data: LayoutData;

  $: ({ endpoint } = data);
</script>

<PageTitle
  title={translate('nexus.nexus-endpoint', { id: $page.params.id })}
  url={$page.url.href}
/>
<NexusEndpoint {endpoint} />
