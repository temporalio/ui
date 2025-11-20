<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoints from '$lib/pages/nexus-endpoints.svelte';

  let { data }: PageProps = $props();

  let { endpoints } = $derived(data);
</script>

<PageTitle title={translate('nexus.endpoints')} url={page.url.href} />
<NexusEndpoints {endpoints} />
