<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import IsOssGuard from '$lib/components/is-oss-guard.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NetworkError } from '$lib/types/global';
  import type { NexusEndpoint } from '$lib/types/nexus';

  type Props = {
    endpoint?: NexusEndpoint;
    targetNamespaceList?: { namespace: string }[];
    callerNamespaceList?: { namespace: string }[];
    error?: NetworkError;
    nameDisabled?: boolean;
    isCloud?: boolean;
    nameHintText?: string;
    nameRegexPattern?: RegExp;
    submitButtonText?: string;
    cancelHref?: string;
    onSubmit?: (formData: NexusFormData) => void;
  };

  let {
    endpoint = undefined,
    targetNamespaceList = [],
    callerNamespaceList = [],
    error = undefined,
    nameDisabled = false,
    isCloud = true,
    nameHintText = translate('nexus.endpoint-name-hint'),
    nameRegexPattern = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
    submitButtonText = translate('common.save'),
    cancelHref = undefined,
    onSubmit,
  }: Props = $props();

  export type NexusFormData = {
    name: string;
    descriptionString: string;
    targetNamespace: string;
    taskQueue: string;
    allowedCallerNamespaces: string[];
  };

  const createNexusSchema = (pattern: RegExp) =>
    z.object({
      name: z
        .string()
        .min(1, translate('nexus.endpoint-name-hint'))
        .refine((val) => pattern.test(val), {
          message: translate('nexus.endpoint-name-hint'),
        }),
      descriptionString: z.string().optional().default(''),
      targetNamespace: z
        .string()
        .min(1, translate('nexus.target-namespace-required')),
      taskQueue: z.string().min(1, translate('nexus.task-queue-required')),
      allowedCallerNamespaces: z.array(z.string()).default([]),
    });

  const initialData: NexusFormData = {
    name: endpoint?.spec?.name || '',
    descriptionString: endpoint?.spec?.descriptionString || '',
    targetNamespace: endpoint?.spec?.target?.worker?.namespace || '',
    taskQueue: endpoint?.spec?.target?.worker?.taskQueue || '',
    allowedCallerNamespaces: endpoint?.spec?.allowedCallerNamespaces || [],
  };

  // initialData is reactive but we only need its initial value
  // svelte-ignore state_referenced_locally
  const superform = superForm(initialData, {
    SPA: true,
    validators: zodClient(createNexusSchema(nameRegexPattern)),
    resetForm: false,
    dataType: 'json',
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      onSubmit?.(form.data);
    },
  });

  const { form, errors, constraints, enhance, submitting } = superform;

  const callerNamespaces = $derived(
    callerNamespaceList.map((n) => ({
      value: n.namespace,
      label: n.namespace,
    })),
  );
</script>

<form class="flex w-full flex-col gap-4 xl:w-1/2" use:enhance novalidate>
  <Input
    bind:value={$form.name}
    required
    disabled={nameDisabled}
    error={!!$errors.name?.[0]}
    hintText={$errors.name?.[0] || nameHintText}
    label={translate('nexus.endpoint-name')}
    id="name"
    name="name"
    maxLength={255}
    placeholder={translate('nexus.endpoint-name-placeholder')}
    {...$constraints.name}
  />
  <div class="flex flex-col gap-0">
    <p class="text-base text-primary">{translate('nexus.target')}</p>
    <p class="text-xs text-secondary">
      {translate('nexus.target-description')}
    </p>
  </div>
  <Combobox
    label={translate('nexus.target-namespace')}
    noResultsText={translate('common.no-results')}
    valid={!$errors.targetNamespace}
    error={$errors.targetNamespace?.[0] ||
      translate('nexus.target-namespace-required')}
    bind:value={$form.targetNamespace}
    required
    id="target-namespace"
    name="targetNamespace"
    placeholder={translate('nexus.select-namespace')}
    leadingIcon="namespace-switcher"
    options={targetNamespaceList}
    optionValueKey="namespace"
    minSize={32}
  />
  <Input
    bind:value={$form.taskQueue}
    required
    error={!!$errors.taskQueue?.[0]}
    hintText={$errors.taskQueue?.[0]}
    label={translate('common.task-queue')}
    id="task-queue"
    name="taskQueue"
    placeholder={translate('nexus.task-queue-placeholder')}
    {...$constraints.taskQueue}
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
      name="allowedCallerNamespaces"
      multiselect
      displayChips={false}
      bind:value={$form.allowedCallerNamespaces}
      options={callerNamespaces}
      label={translate('nexus.allowed-caller-namespaces')}
      leadingIcon="search"
      noResultsText={translate('common.no-results')}
      valid={!$errors.allowedCallerNamespaces}
      error={typeof $errors.allowedCallerNamespaces?.[0] === 'string'
        ? $errors.allowedCallerNamespaces[0]
        : translate('nexus.caller-namespace-required')}
      placeholder={translate('nexus.select-namespaces')}
      optionValueKey="value"
      optionLabelKey="label"
    />
  </IsOssGuard>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-medium">
      {translate('nexus.description-label')}
    </p>
    <MarkdownEditor bind:content={$form.descriptionString} />
    <p class="text-xs text-secondary">
      {translate('nexus.description-hint')}
    </p>
  </div>
  <div class="flex flex-row items-center gap-4 max-sm:flex-col">
    <Button
      type="submit"
      disabled={$submitting}
      class="max-sm:w-full"
      data-testid="nexus-form-submit-button"
    >
      {submitButtonText}
    </Button>
    {#if cancelHref}
      <Button
        variant="ghost"
        href={cancelHref}
        class="max-sm:w-full"
        data-testid="nexus-form-cancel-button"
      >
        {translate('common.cancel')}
      </Button>
    {/if}
  </div>
</form>
<Alert title={error?.statusText} intent="error" hidden={!error}>
  {error?.message}
</Alert>
