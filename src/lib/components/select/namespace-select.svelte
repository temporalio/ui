<script lang="ts">
  import { namespace as currentNamespace } from '$lib/stores/namespace';
  import Select from './select.svelte';
  import Option from './option.svelte';
  import { goto } from '$app/navigation';

  import { getAppContext } from '$lib/utilities/get-context';
  import { isCloud } from '$lib/utilities/env';

  $: namespaces = (getAppContext('namespaces') ?? [])
    .map((namespace) => namespace?.namespaceInfo?.name ?? undefined)
    .filter((namespace) => namespace);

  $: selectedNamespace = $currentNamespace;

  function switchNamespace() {
    goto('/namespaces/' + selectedNamespace);
  }
</script>

<div class="w-full">
  <Select dark bind:value={selectedNamespace} on:change={switchNamespace}>
    {#if isCloud}
      <Option value={selectedNamespace}>{selectedNamespace}</Option>
    {:else}
      {#each namespaces as namespace}
        <Option value={namespace}>{namespace}</Option>
      {/each}
    {/if}
  </Select>
</div>
