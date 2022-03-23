<script lang="ts">
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { routeForWorkflows } from '$lib/utilities/route-for';

  const { isCloud } = $page.stuff.settings.runtimeEnvironment;

  import Select from '$lib/components/select/select.svelte';
  import Option from '$lib/components/select/option.svelte';

  let selectedNamespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;

  let namespaces = ($page.stuff.namespaces || [])
    .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
    .filter((namespace: string) => namespace !== 'temporal-system');

  const switchNamespaces = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const namespace = target.value;
    if (namespace) goto(routeForWorkflows({ namespace }));
  };
</script>

<div class="w-full">
  <Select
    dark
    bind:value={selectedNamespace}
    on:change={switchNamespaces}
    id="namespace-select"
  >
    {#if isCloud}
      <Option value={selectedNamespace}>{selectedNamespace}</Option>
    {:else}
      {#each namespaces as namespace}
        <Option value={namespace}>{namespace}</Option>
      {/each}
    {/if}
  </Select>
</div>
