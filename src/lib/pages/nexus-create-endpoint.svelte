<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm, { endpointForm } from '$lib/pages/nexus-form.svelte';
  import type { NetworkError } from '$lib/types/global';
  import { routeForNexus } from '$lib/utilities/route-for';

  export let onCreate: () => void;
  export let targetNamespaceList: { namespace: string }[] = [];
  export let callerNamespaceList: { namespace: string }[] = [];
  export let error: NetworkError | undefined = undefined;
  export let loading = false;
  export let isCloud = false;
  export let nameRegexPattern: RegExp = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/;
  export let nameHintText = translate('nexus.endpoint-name-hint-with-dash');

  $: createDisabled =
    $endpointForm.spec.name === '' ||
    $endpointForm.spec.target.worker.namespace === '' ||
    $endpointForm.spec.target.worker.taskQueue === '';
</script>

<div class="flex w-full flex-col gap-8">
  <div class="text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
  </div>
  <h1 data-testid="namespace-selector-title">
    {translate('nexus.create-endpoint')}
  </h1>
  <NexusForm
    {nameRegexPattern}
    {nameHintText}
    {error}
    {targetNamespaceList}
    {callerNamespaceList}
    {isCloud}
  />
  <div class="flex flex-row items-center gap-4 max-sm:flex-col">
    <Button
      variant="primary"
      on:click={onCreate}
      disabled={createDisabled}
      class="max-sm:w-full"
      {loading}>{translate('nexus.create-endpoint')}</Button
    >
    <Button
      variant="ghost"
      class="max-sm:w-full"
      on:click={() => goto(routeForNexus())}
      >{translate('common.cancel')}</Button
    >
  </div>
</div>
