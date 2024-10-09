<script lang="ts">
  import { page } from '$app/stores';

  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';
  import { routeForNamespace } from '$lib/utilities/route-for';

  export let namespaceList: NamespaceListItem[] = [];

  let screenWidth: number;

  $: namespace = $page.params.namespace || $lastUsedNamespace;
  $: pathNameSplit = $page.url.pathname.split('/');
  $: showNamespaceSpecificNav =
    namespace &&
    (pathNameSplit.includes('workflows') ||
      pathNameSplit.includes('schedules') ||
      pathNameSplit.includes('batch-operations') ||
      pathNameSplit.includes('task-queues') ||
      pathNameSplit.includes('import'));
  $: namespaceExists = namespaceList.some(
    (namespaceListItem) => namespaceListItem.namespace === namespace,
  );

  const handleNamespaceSelect = (
    event: CustomEvent<{ value: NamespaceListItem }>,
  ) => {
    const namespaceListItem = event.detail.value;
    $lastUsedNamespace = namespaceListItem.namespace;
    namespaceListItem?.onClick(namespaceListItem.namespace);
  };
</script>

<svelte:window bind:innerWidth={screenWidth} />
<nav
  class="surface-primary sticky top-0 z-40 flex hidden w-full flex-col items-center justify-end border-b border-subtle p-1 px-4 md:flex md:flex-row md:px-8"
  data-testid="top-nav"
  class:bg-red-400={$dataEncoder.hasError && showNamespaceSpecificNav}
  aria-label={translate('common.main')}
>
  <div class="flex grow items-center">
    <Combobox
      label={translate('namespaces.namespace-label', { namespace })}
      toggleLabel={translate('common.namespaces')}
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
    >
      <Button
        slot="action"
        variant="ghost"
        size="xs"
        href={routeForNamespace({ namespace })}
        disabled={!namespaceExists}
        leadingIcon="external-link"
      />
    </Combobox>
  </div>
  <div class="flex items-center gap-2">
    <TimezoneSelect position={screenWidth < 768 ? 'left' : 'right'} />
    <DataEncoderStatus />
    <slot />
  </div>
</nav>
