<script lang="ts">
  import { goto } from '$app/navigation';

  import { getContext } from 'svelte';

  import type { DescribeNamespaceResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  $: namespace = getContext('namespace') as string;
  $: namespaces = (getContext('namespaces') as DescribeNamespaceResponse[]).map(
    (namespace) => namespace.namespaceInfo.name,
  );

  const changeNamespace = (event: Event) => {
    const select: HTMLSelectElement = event.currentTarget as HTMLSelectElement;
    goto('/namespaces/' + select.value);
  };
</script>

<h3 class="text-sm font-bold">Namespace</h3>
<!-- svelte-ignore a11y-no-onchange -->
<select bind:value={namespace} on:change={changeNamespace}>
  {#each namespaces as namespace}
    <option value={namespace}>{namespace}</option>
  {/each}
</select>
