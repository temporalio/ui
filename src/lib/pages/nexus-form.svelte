<script context="module" lang="ts">
  const emptyEndpoint = {
    spec: {
      name: '',
      description: '',
      target: {
        worker: {
          namespace: '',
          taskQueue: '',
        },
      },
    },
  };
  export const endpointForm = writable<Partial<NexusEndpoint>>(emptyEndpoint);
</script>

<script lang="ts">
  import { writable } from 'svelte/store';

  import { onDestroy } from 'svelte';

  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Markdown from '$lib/holocene/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { namespaces } from '$lib/stores/namespaces';
  import type { NexusEndpoint } from '$lib/types/nexus';

  export let endpoint: NexusEndpoint | undefined = undefined;

  let name = endpoint?.spec?.name || '';
  let description = endpoint?.spec?.description || '';
  let target = endpoint?.spec?.target?.worker?.namespace || '';
  let taskQueue = endpoint?.spec?.target?.worker?.taskQueue || '';

  const setFormStore = (
    name: string,
    description: string,
    target: string,
    taskQueue: string,
  ) => {
    $endpointForm = {
      spec: {
        name,
        description,
        target: {
          worker: {
            namespace: target,
            taskQueue,
          },
        },
      },
    };
  };

  $: setFormStore(name, description, target, taskQueue);

  onDestroy(() => {
    $endpointForm = emptyEndpoint;
  });

  $: namespaceList = $namespaces.map((namespace) => ({
    namespace: namespace.namespaceInfo.name,
  }));
</script>

<div class="flex w-full flex-col gap-4 xl:w-1/2">
  <Input
    bind:value={name}
    label={translate('nexus.endpoint-name')}
    id="name"
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
    id="target-namespace"
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
  <slot name="footer" />
</div>
