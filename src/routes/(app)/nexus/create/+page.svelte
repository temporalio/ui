<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Markdown from '$lib/holocene/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { namespaces } from '$lib/stores/namespaces';
  import { routeForNexus } from '$lib/utilities/route-for';

  let name = '';
  let description = '';
  let target = '';
  let taskQueue = '';

  $: namespaceList = $namespaces.map((namespace) => ({
    namespace: namespace.namespaceInfo.name,
  }));
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />

<div class="flex w-full flex-col gap-8">
  <div class="text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
  </div>
  <h1 data-testid="namespace-selector-title" class="text-2xl">
    {translate('nexus.create-endpoint')}
  </h1>
  <div class="flex w-full flex-col gap-4 xl:w-1/2">
    <Input
      bind:value={name}
      label={translate('nexus.endpoint-name')}
      id="endpoint-name"
      required
      maxLength={255}
      placeholder={translate('nexus.endpoint-name-placeholder')}
    />
    <div class="flex flex-col gap-0">
      <p class="text-base text-primary">{translate('nexus.target')}</p>
      <p class="text-xs text-secondary">
        {translate('nexus.target-description')}
      </p>
    </div>
    <Combobox
      label={translate('nexus.target-namespace')}
      toggleLabel={translate('common.namespaces')}
      noResultsText={translate('common.no-results')}
      value={target}
      required
      id="namespace-select"
      placeholder={translate('nexus.select-namespace')}
      leadingIcon="namespace-switcher"
      options={namespaceList}
      optionValueKey="namespace"
      minSize={32}
    />
    <Input
      required
      bind:value={taskQueue}
      label={translate('common.task-queue')}
      id="task-queue"
      placeholder={translate('nexus.task-queue-placeholder')}
    />
    <Markdown
      label={translate('common.description')}
      description={translate('nexus.nexus-description')}
      bind:value={description}
      id="description"
      isValid={false}
      placeholder={translate('nexus.description-placeholder')}
    >
      <p class="text-xs text-secondary" slot="info">
        Do not include sensitive data.
      </p>
    </Markdown>
    <div class="flex items-center gap-4">
      <Button disabled={!name} variant="primary"
        >{translate('nexus.create-endpoint')}</Button
      >
      <Button variant="ghost">{translate('common.cancel')}</Button>
    </div>
  </div>
</div>
