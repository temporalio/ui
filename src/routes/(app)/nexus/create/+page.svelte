<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm, { endpointForm } from '$lib/pages/nexus-form.svelte';
  import { createNexusEndpoint } from '$lib/services/nexus-service';
  import { namespaces } from '$lib/stores/namespaces';
  import type { NetworkError } from '$lib/types/global';
  import { routeForNexus } from '$lib/utilities/route-for';

  let error: NetworkError | undefined = undefined;

  const onCreate = async () => {
    try {
      const body = { ...$endpointForm };
      delete body.spec.description;
      console.log('Endpoint body: ', body);
      await createNexusEndpoint(body);
      goto(routeForNexus());
    } catch (e) {
      error = e as NetworkError;
      console.error('Error creating endpoint', e);
    }
  };

  $: namespaceList = $namespaces.map((namespace) => ({
    namespace: namespace.namespaceInfo.name,
  }));
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<NexusCreateEndpoint {onCreate} {namespaceList} {error} />
