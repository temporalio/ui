<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusCreateEndpoint from '$lib/pages/nexus-create-endpoint.svelte';
  import { endpointForm } from '$lib/pages/nexus-form.svelte';
  import { createNexusEndpoint } from '$lib/services/nexus-service';
  import { namespaces } from '$lib/stores/namespaces';
  import type { NetworkError } from '$lib/types/global';
  import { encodePayloads } from '$lib/utilities/encode-payload';
  import { routeForNexus } from '$lib/utilities/route-for';

  let error: NetworkError | undefined = undefined;
  let loading = false;

  const onCreate = async () => {
    loading = true;
    try {
      const body = { ...$endpointForm };
      const payloads = await encodePayloads({
        input: JSON.stringify(body.spec.descriptionString),
        encoding: 'json/plain',
      });
      body.spec.description = payloads[0];

      delete body.spec.allowedCallerNamespaces;
      delete body.spec.descriptionString;

      await createNexusEndpoint(body);
      goto(routeForNexus(), { invalidateAll: true });
    } catch (e) {
      error = e as NetworkError;
      console.error('Error creating endpoint', e);
    } finally {
      loading = false;
    }
  };

  $: targetNamespaceList = $namespaces.map((namespace) => ({
    namespace: namespace.namespaceInfo.name,
  }));
</script>

<PageTitle title={translate('nexus.create-endpoint')} url={$page.url.href} />
<NexusCreateEndpoint {onCreate} {targetNamespaceList} {error} {loading} />
