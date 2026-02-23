<script lang="ts">
  import type { Snippet } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import Message from '$lib/components/form/message.svelte';
  import IsOssGuard from '$lib/components/is-oss-guard.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NexusEndpoint } from '$lib/types/nexus';

  type Props = {
    targetNamespaceList: { namespace: string }[];
    callerNamespaceList: { namespace: string }[];
    nameRegexPattern: RegExp;
    nameHintText?: string;
    isCloud: boolean;
    cancelHref: string;
    submitButtonText: string;
    onSubmit: (formData: NexusFormData) => Promise<void>;
    endpoint?: NexusEndpoint;
    nameDisabled?: boolean;
    footer?: Snippet<[{ submitting: boolean }]>;
  };

  let {
    targetNamespaceList,
    callerNamespaceList,
    nameRegexPattern,
    nameHintText = translate('nexus.endpoint-name-hint'),
    isCloud,
    cancelHref,
    submitButtonText,
    onSubmit,
    endpoint = undefined,
    nameDisabled = false,
    footer,
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
        .min(3, translate('nexus.endpoint-name-hint'))
        .max(200, translate('nexus.endpoint-name-hint'))
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

  const superform = superForm(initialData, {
    SPA: true,
    validators: zodClient(createNexusSchema(nameRegexPattern)),
    resetForm: false,
    dataType: 'json',
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      await onSubmit?.(form.data);
    },
    onError: ({ result }) => {
      const error = result.error;
      let errorMessage = 'An error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Use type narrowing to access unknown properties safely
        const errorObj = error as Record<string, unknown>;
        const message =
          typeof errorObj.message === 'string' ? errorObj.message : undefined;
        const errorProp =
          typeof errorObj.error === 'string' ? errorObj.error : undefined;
        const statusText =
          typeof errorObj.statusText === 'string'
            ? errorObj.statusText
            : undefined;
        const body = errorObj.body;

        errorMessage =
          message ||
          errorProp ||
          statusText ||
          (body && JSON.stringify(body)) ||
          JSON.stringify(error);
      }

      message.set({ type: 'error', text: errorMessage });
    },
  });

  const {
    form,
    errors,
    constraints,
    enhance,
    submitting,
    tainted,
    isTainted,
    message,
  } = superform;

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
    maxLength={200}
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
  <div class="flex w-full flex-col items-center gap-4 sm:flex-row">
    <Button
      type="submit"
      disabled={$submitting || (endpoint && !isTainted($tainted))}
      loading={$submitting}
      class="max-sm:w-full"
      data-testid="nexus-form-submit-button"
    >
      {submitButtonText}
    </Button>
    {#if cancelHref}
      <Button
        variant="ghost"
        disabled={$submitting}
        href={cancelHref}
        class="max-sm:w-full"
        data-testid="nexus-form-cancel-button"
      >
        {translate('common.cancel')}
      </Button>
    {/if}
    {@render footer?.({ submitting: $submitting })}
  </div>
  <Message value={$message} />
</form>
