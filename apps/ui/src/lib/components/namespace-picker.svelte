<script lang="ts">
  import { page } from '$app/stores';

  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import { translate } from '$lib/i18n/translate';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';
  import { routeForNamespace } from '$lib/utilities/route-for';

  export let namespaceList: NamespaceListItem[] = [];

  $: namespace = $page.params.namespace || $lastUsedNamespace;
  $: namespaceExists = namespaceList.some(
    (namespaceListItem) => namespaceListItem.namespace === namespace,
  );
  $: href = routeForNamespace({ namespace });

  const handleNamespaceSelect = (
    event: CustomEvent<{ value: NamespaceListItem }>,
  ) => {
    const namespaceListItem = event.detail.value;
    $lastUsedNamespace = namespaceListItem.namespace;
    namespaceListItem?.onClick(namespaceListItem.namespace);
  };
</script>

<Combobox
  label={translate('namespaces.namespace-label', { namespace })}
  noResultsText={translate('common.no-results')}
  labelHidden
  value={namespace}
  id="namespace-switcher"
  leadingIcon="namespace-switcher"
  options={namespaceList}
  optionValueKey="namespace"
  on:change={handleNamespaceSelect}
  minSize={32}
  actionTooltip={translate('namespaces.go-to-namespace')}
  {href}
  hrefDisabled={!namespaceExists}
/>
