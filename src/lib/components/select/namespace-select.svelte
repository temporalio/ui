<script lang="ts">
  import { namespace as currentNamespace } from '$lib/stores/namespace';
  import Select from './select.svelte';
  import Option from './option.svelte';
  import { goto } from '$app/navigation';

  import { getAppContext } from '$lib/utilities/get-context';

  $: namespaces = getAppContext('namespaces').map(
    (namespace) => namespace.namespaceInfo.name,
  );

  let selectedNamespace = $currentNamespace;

  function switchNamespace() {
    goto('/namespaces/' + selectedNamespace);
  }
</script>

<div class="w-full">
  <Select dark bind:value={selectedNamespace} on:change={switchNamespace}>
    {#each namespaces as namespace}
      <Option value={namespace}>{namespace}</Option>
    {/each}
  </Select>
</div>
