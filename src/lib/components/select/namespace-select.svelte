<script lang="ts">
  import { namespace as currentNamespace } from '$lib/stores/namespace';
  import Select from './select.svelte';
  import Option from './option.svelte';
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';

  import type { DescribeNamespaceResponse } from '$types';

  $: namespaces = getContext<DescribeNamespaceResponse[]>('namespaces').map(
    (namespace) => namespace.namespaceInfo.name,
  );

  let selectedNamespace = $currentNamespace;

  function switchNamespace() {
    goto('/namespaces/' + selectedNamespace);
  }
</script>

<Select
  color="black"
  bind:value={selectedNamespace}
  on:change={() => switchNamespace()}
>
  {#each namespaces as namespace}
    <Option value={namespace}>{namespace}</Option>
  {/each}
</Select>
