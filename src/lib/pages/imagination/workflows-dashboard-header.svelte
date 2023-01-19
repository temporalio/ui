<script lang="ts">
  import { page } from '$app/stores';
  import { refresh } from '$lib/stores/workflows';

  import PageTitle from '$lib/components/page-title.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let onClick: () => void;

  $: namespace = $page.params.namespace;

  const refreshWorkflows = () => {
    $refresh = Date.now();
  };
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>
<div class="mb-2 flex justify-between">
  <div class="justify-between">
    <h1 class="text-2xl" data-cy="namespace-title">
      Recent Workflows
      <NamespaceSelector />
    </h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-cy="namespace-name">
        {namespace}
      </p>
    </div>
  </div>
  <div class="flex items-center gap-4">
    <Button variant="secondary" class="h-10 w-10" on:click={refreshWorkflows}
      ><Icon name="retry" /></Button
    >
    <Button variant="secondary" class="h-10 w-10" on:click={onClick}
      ><Icon name="arrow-right" />Live View</Button
    >
    <!-- <WorkflowDateTimeFilter /> -->
  </div>
</div>
