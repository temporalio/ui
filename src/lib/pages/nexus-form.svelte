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

  import IsOssGuard from '$lib/components/is-oss-guard.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Markdown from '$lib/holocene/markdown.svelte';
  import MultiSelect from '$lib/holocene/select/multi-select.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NetworkError } from '$lib/types/global';
  import type { NexusEndpoint } from '$lib/types/nexus';

  export let endpoint: NexusEndpoint | undefined = undefined;
  export let namespaceList: { namespace: string }[] = [];
  export let error: NetworkError | undefined = undefined;
  export let nameDisabled = false;
  export let isCloud = true;

  let name = endpoint?.spec?.name || '';
  let description = endpoint?.spec?.descriptionString || '';
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

  $: callerNamespaces = namespaceList.map((n) => ({
    value: n.namespace,
    label: n.namespace,
  }));
  $: initialCallerNamespaces =
    endpoint?.spec?.allowedCallerNamespaces?.map((n) => {
      return { value: n, label: n };
    }) || [];

  const onCallerNamespaceChange = (
    selected: { value: string; label: string }[],
  ) => {
    const namespaces = selected.map((n) => n.value);
    $endpointForm.spec.allowedCallerNamespaces = namespaces;
  };

  onDestroy(() => {
    $endpointForm = emptyEndpoint;
  });

  const pattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
  $: validName = (name) => pattern.test(name);
</script>

<div class="flex w-full flex-col gap-4 xl:w-1/2">
  <Input
    bind:value={name}
    required
    disabled={nameDisabled}
    error={!name || !validName(name)}
    hintText={translate('nexus.endpoint-name-hint')}
    label={translate('nexus.endpoint-name')}
    id="name"
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
    valid={!!target}
    error="Please select a target Namespace."
    bind:value={target}
    required
    id="target-namespace"
    placeholder={translate('nexus.select-namespace')}
    leadingIcon="namespace-switcher"
    options={namespaceList}
    optionValueKey="namespace"
    minSize={32}
  />
  <Input
    bind:value={taskQueue}
    required
    error={!taskQueue}
    label={translate('common.task-queue')}
    id="task-queue"
    placeholder={translate('nexus.task-queue-placeholder')}
  />
  <IsOssGuard {isCloud}>
    <div class="flex flex-col gap-0">
      <p class="text-base text-primary">{translate('nexus.access-policy')}</p>
      <p class="text-xs text-secondary">
        {translate('nexus.allowed-caller-namespaces-description')}
      </p>
    </div>
    <MultiSelect
      id="caller-namespace-filter-menu"
      options={callerNamespaces}
      initialSelected={initialCallerNamespaces}
      label={$endpointForm.spec.allowedCallerNamespaces.length
        ? translate('nexus.selected-namespaces', {
            count: $endpointForm.spec.allowedCallerNamespaces.length,
          })
        : translate('nexus.select-namespaces')}
      selectAllLabel={translate('common.select-all')}
      clearAllLabel={translate('common.clear-all-capitalized')}
      initialSelectedAll={false}
      onChange={onCallerNamespaceChange}
    />
  </IsOssGuard>
  <Markdown
    label={translate('common.description')}
    description={translate('nexus.nexus-description')}
    bind:value={description}
    id="description"
    placeholder={translate('nexus.description-placeholder')}
  >
    <p class="text-xs text-secondary" slot="info">
      Do not include sensitive data.
    </p>
  </Markdown>
  <slot name="footer" />
</div>
<Alert title={error?.statusText} intent="error" hidden={!error}>
  {error?.message}
</Alert>
