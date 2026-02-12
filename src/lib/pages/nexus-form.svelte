<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import IsOssGuard from '$lib/components/is-oss-guard.svelte';
  import Alert from '$lib/holocene/alert.svelte';
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
  };

  let {
    endpoint = undefined,
    targetNamespaceList = [],
    callerNamespaceList = [],
    error = undefined,
    nameDisabled = false,
    isCloud = true,
    nameHintText = translate('nexus.endpoint-name-hint-with-dash'),
    nameRegexPattern = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
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
        .min(1, 'Name is required')
        .refine((val) => pattern.test(val), {
          message: 'Name must match the required pattern',
        }),
      descriptionString: z.string().optional().default(''),
      targetNamespace: z.string().min(1, 'Target namespace is required'),
      taskQueue: z.string().min(1, 'Task queue is required'),
      allowedCallerNamespaces: z.array(z.string()).default([]),
    });

  const initialData: NexusFormData = {
    name: endpoint?.spec?.name || '',
    descriptionString: endpoint?.spec?.descriptionString || '',
    targetNamespace: endpoint?.spec?.target?.worker?.namespace || '',
    taskQueue: endpoint?.spec?.target?.worker?.taskQueue || '',
    allowedCallerNamespaces: endpoint?.spec?.allowedCallerNamespaces || [],
  };

  const { form, errors, constraints } = $derived(
    superForm(initialData, {
      SPA: true,
      validators: zodClient(createNexusSchema(nameRegexPattern)),
      resetForm: false,
      dataType: 'json',
    }),
  );

  const callerNamespaces = $derived(
    callerNamespaceList.map((n) => ({
      value: n.namespace,
      label: n.namespace,
    })),
  );

  export function getFormData(): Partial<NexusEndpoint> {
    return {
      spec: {
        name: $form.name,
        descriptionString: $form.descriptionString,
        target: {
          worker: {
            namespace: $form.targetNamespace,
            taskQueue: $form.taskQueue,
          },
        },
        allowedCallerNamespaces: $form.allowedCallerNamespaces,
      },
    };
  }

  export function isFormValid(): boolean {
    return (
      !!$form.name &&
      !!$form.targetNamespace &&
      !!$form.taskQueue &&
      nameRegexPattern.test($form.name)
    );
  }
</script>

<div class="flex w-full flex-col gap-4 xl:w-1/2">
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
    error={$errors.targetNamespace?.[0] || 'Please select a target Namespace.'}
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
        : 'Please select at least one Namespace.'}
      placeholder={translate('nexus.select-namespaces')}
      optionValueKey="value"
      optionLabelKey="label"
    />
  </IsOssGuard>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-medium">Description</p>
    <MarkdownEditor bind:content={$form.descriptionString} />
    <p class="text-xs text-secondary">Do not include sensitive data.</p>
  </div>
  <slot name="footer" />
</div>
<Alert title={error?.statusText} intent="error" hidden={!error}>
  {error?.message}
</Alert>
