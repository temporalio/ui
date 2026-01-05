<script lang="ts">
  import { page } from '$app/state';

  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import { translate } from '$lib/i18n/translate';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';
  import { routeForNamespace } from '$lib/utilities/route-for';

  interface Props {
    namespaceList?: NamespaceListItem[];
    namespace?: string;
    noResultsText?: string;
  }

  let {
    namespaceList = [],
    namespace,
    noResultsText = translate('common.no-results'),
  }: Props = $props();

  let value = $derived(
    namespace ?? (page.params.namespace || $lastUsedNamespace),
  );
  let namespaceExists = $derived(
    namespaceList.some(
      (namespaceListItem) => namespaceListItem.namespace === value,
    ),
  );
  let href = $derived(
    value ? routeForNamespace({ namespace: value }) : undefined,
  );

  const handleNamespaceSelect = (namespaceListItem: NamespaceListItem) => {
    $lastUsedNamespace = namespaceListItem.namespace;
    namespaceListItem?.onClick(namespaceListItem.namespace);
  };
</script>

<Combobox
  label={translate('namespaces.namespace-label', { namespace: value })}
  {noResultsText}
  labelHidden
  {value}
  id="namespace-switcher"
  leadingIcon="namespace-switcher"
  options={namespaceList}
  optionValueKey="namespace"
  onchange={handleNamespaceSelect}
  minSize={32}
  actionTooltip={translate('namespaces.go-to-namespace')}
  {href}
  hrefDisabled={!namespaceExists}
/>
