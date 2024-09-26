<script context="module" lang="ts">
  const emptyEndpoint = {
    spec: {
      name: '',
      descriptionString: '',
      target: {
        worker: {
          namespace: '',
          taskQueue: '',
        },
      },
      allowedCallerNamespaces: [],
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
  import Editor from '$lib/holocene/monaco/editor.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NetworkError } from '$lib/types/global';
  import type { NexusEndpoint } from '$lib/types/nexus';

  export let endpoint: NexusEndpoint | undefined = undefined;
  export let targetNamespaceList: { namespace: string }[] = [];
  export let callerNamespaceList: { namespace: string }[] = [];
  export let error: NetworkError | undefined = undefined;
  export let nameDisabled = false;
  export let isCloud = true;
  export let nameHintText: string;
  export let nameRegexPattern: RegExp;

  let name = endpoint?.spec?.name || '';
  let description = endpoint?.spec?.descriptionString || '';
  let target = endpoint?.spec?.target?.worker?.namespace || '';
  let taskQueue = endpoint?.spec?.target?.worker?.taskQueue || '';
  let allowedCallerNamespaces = endpoint?.spec?.allowedCallerNamespaces || [];

  let showPreview = false;

  const setFormStore = (
    name: string,
    descriptionString: string,
    target: string,
    taskQueue: string,
    allowedCallerNamespaces: string[],
  ) => {
    $endpointForm = {
      spec: {
        name,
        descriptionString,
        target: {
          worker: {
            namespace: target,
            taskQueue,
          },
        },
        allowedCallerNamespaces,
      },
    };
  };

  $: setFormStore(
    name,
    description,
    target,
    taskQueue,
    allowedCallerNamespaces,
  );

  $: callerNamespaces = callerNamespaceList.map((n) => ({
    value: n.namespace,
    label: n.namespace,
  }));

  onDestroy(() => {
    $endpointForm = emptyEndpoint;
  });

  $: validName = (name) => nameRegexPattern.test(name);
</script>

<div class="flex w-full flex-col gap-4 xl:w-1/2">
  <Input
    bind:value={name}
    required
    disabled={nameDisabled}
    error={!name || !validName(name)}
    hintText={nameHintText}
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
    options={targetNamespaceList}
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
    <Combobox
      id="caller-namespace-filter-menu"
      multiselect
      displayChips={false}
      bind:value={allowedCallerNamespaces}
      options={callerNamespaces}
      label={allowedCallerNamespaces.length
        ? translate('nexus.selected-namespaces', {
            count: allowedCallerNamespaces.length,
          })
        : translate('nexus.select-namespaces')}
      toggleLabel={translate('common.namespaces')}
      leadingIcon="search"
      noResultsText={translate('common.no-results')}
      valid={!!allowedCallerNamespaces.length}
      error="Please select at least one Namespace."
      placeholder={translate('nexus.select-namespaces')}
      optionValueKey="value"
      optionLabelKey="label"
    />
  </IsOssGuard>

  <ToggleButtons>
    <ToggleButton
      active={showPreview === false}
      data-testid="description-editor"
      on:click={() => (showPreview = false)}
      >{translate('common.description')}</ToggleButton
    >
    <ToggleButton
      active={showPreview === true}
      data-testid="description-preview"
      on:click={() => (showPreview = true)}
      >{translate('common.preview')}</ToggleButton
    >
  </ToggleButtons>
  <div>
    {#if showPreview}
      <Markdown content={description} />
    {:else}
      <Editor
        content={description}
        on:change={(event) => (description = event.detail.value)}
      />
    {/if}
    <p class="my-2 text-xs text-secondary">Do not include sensitive data.</p>
  </div>
  <slot name="footer" />
</div>
<Alert title={error?.statusText} intent="error" hidden={!error}>
  {error?.message}
</Alert>
