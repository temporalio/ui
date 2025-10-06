<script lang="ts">
  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoints from '$lib/pages/nexus-endpoints.svelte';
  import { page } from '$lib/svelte-mocks/app/stores';

  import type { PageData } from '../$types';

  export let data: PageData;

  $: ({ endpoints } = data);
  $: createDisabled = $page.data.settings?.disableWriteActions ?? false;
</script>

<PageTitle title={translate('nexus.endpoints')} url={$page.url.href} />
<NexusEndpoints {endpoints} {createDisabled} />
