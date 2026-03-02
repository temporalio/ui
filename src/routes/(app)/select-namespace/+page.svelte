<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import NamespacePicker from '$lib/components/namespace-picker.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { namespaces } from '$lib/stores/namespaces';
  import { toaster } from '$lib/stores/toaster';
  import { routeForWorkflows } from '$lib/utilities/route-for';

  import type { DescribeNamespaceResponse as Namespace } from '$types';

  const navigateToNamespace = async (namespace: string) => {
    const { authorized } = await fetchWorkflowForAuthorization(namespace);
    if (authorized) {
      $lastUsedNamespace = namespace;
      goto(routeForWorkflows({ namespace }));
    } else {
      toaster.push({
        variant: 'error',
        message: translate('namespaces.unauthorized-namespace-error'),
      });
    }
  };
  // Lets test if danger works
  let namespaceList = $derived(
    $namespaces.map((namespace: Namespace) => {
      return {
        //
        namespace: namespace?.namespaceInfo.name,
        //
        onClick: navigateToNamespace,
      };
    }),
  );
</script>

<PageTitle
  title={translate('namespaces.namespace-select-header')}
  url={page.url.href}
/>
<div class="w-full p-8 xl:w-1/2">
  <h1 class="my-4">
    {translate('namespaces.select-namespace-welcome')}
  </h1>
  <p class="mb-8">{translate('namespaces.select-namespace')}</p>
  <NamespacePicker
    {namespaceList}
    namespace=""
    noResultsText={$namespaces.length
      ? translate('common.no-results')
      : translate('namespaces.select-namespace-empty-state')}
  />
</div>
