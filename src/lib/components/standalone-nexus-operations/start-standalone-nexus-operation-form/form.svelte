<script lang="ts">
  import { get, writable } from 'svelte/store';

  import { onDestroy, onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { twMerge } from 'tailwind-merge';
  import z from 'zod/v3';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    encodings,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import {
    fetchInitialValuesForStartNexusOperation,
    startStandaloneNexusOperation,
  } from '$lib/services/standalone-nexus-operations';
  import {
    customSearchAttributes,
    type SearchAttributesSchema,
  } from '$lib/stores/search-attributes';
  import { toaster } from '$lib/stores/toaster';
  import {
    type NexusOperationIdConflictPolicy,
    nexusOperationIdConflictPolicyOptions,
    type NexusOperationIdReusePolicy,
    nexusOperationIdReusePolicyOptions,
  } from '$lib/types/nexus-operation-execution';
  import { getIdentity } from '$lib/utilities/core-context';
  import { routeForStandaloneNexusOperationDetails } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import type { StartNexusOperationFormDefaults } from './types';
  import Message from '../../form/message.svelte';
  import PayloadInputWithEncoding from '../../payload-input-with-encoding.svelte';
  import AddSearchAttributes from '../../workflow/add-search-attributes.svelte';

  interface Props {
    namespace: string;
  }

  const { namespace }: Props = $props();

  const formDefaults = $derived<StartNexusOperationFormDefaults>({
    namespace,
    identity: getIdentity(),
    encoding: 'json/plain',
    operationId: page.url.searchParams.get('operationId') ?? '',
    endpoint: page.url.searchParams.get('endpoint') ?? '',
    service: page.url.searchParams.get('service') ?? '',
    operation: page.url.searchParams.get('operation') ?? '',
    scheduleToCloseTimeout:
      page.url.searchParams.get('scheduleToCloseTimeout') ?? '',
    startToCloseTimeout: page.url.searchParams.get('startToCloseTimeout') ?? '',
  });

  const encoding = writable<PayloadInputEncoding>('json/plain');

  let searchAttributes = $state<SearchAttributesSchema>([]);
  let advancedOptionsVisible = $state(false);

  const schema = z.object({
    identity: z.string(),
    namespace: z.string(),
    operationId: z.string().min(1, {
      message: translate(
        'standalone-nexus-operations.form-operation-id-required',
      ),
    }),
    endpoint: z.string().min(1, {
      message: translate('standalone-nexus-operations.form-endpoint-required'),
    }),
    service: z.string().min(1, {
      message: translate('standalone-nexus-operations.form-service-required'),
    }),
    operation: z.string().min(1, {
      message: translate(
        'standalone-nexus-operations.form-operation-name-required',
      ),
    }),
    input: z.string().optional(),
    encoding: z.enum(encodings).default('json/plain'),
    messageType: z.string().optional(),
    startToCloseTimeout: z.string().optional(),
    scheduleToCloseTimeout: z.string().optional(),
    scheduleToStartTimeout: z.string().optional(),
    idReusePolicy: z.string().optional(),
    idConflictPolicy: z.string().optional(),
    summary: z.string().optional(),
    details: z.string().optional(),
    nexusHeader: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .default([]),
  });

  const { form, enhance, errors, message } = superForm(
    {
      ...formDefaults,
      input: '',
      messageType: '',
      scheduleToStartTimeout: '',
      summary: '',
      details: '',
      idReusePolicy: '',
      idConflictPolicy: '',
      nexusHeader: [],
    },
    {
      SPA: true,
      dataType: 'json',
      resetForm: false,
      invalidateAll: false,
      validators: zodClient(schema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;

        try {
          const { operationId, idReusePolicy, idConflictPolicy } = form.data;

          const nexusHeaderRecord = form.data.nexusHeader.reduce<
            Record<string, string>
          >((acc, { key, value }) => {
            if (key) acc[key] = value;
            return acc;
          }, {});

          const { runId } = await startStandaloneNexusOperation({
            ...form.data,
            idReusePolicy: idReusePolicy as
              | NexusOperationIdReusePolicy
              | undefined,
            idConflictPolicy: idConflictPolicy as
              | NexusOperationIdConflictPolicy
              | undefined,
            searchAttributes: searchAttributes.map(({ label, value }) => ({
              [label]: value,
            })),
            nexusHeader:
              Object.keys(nexusHeaderRecord).length > 0
                ? nexusHeaderRecord
                : undefined,
          });

          toaster.push({
            duration: 5000,
            variant: 'success',
            message: translate(
              'standalone-nexus-operations.form-nexus-operation-started',
            ),
            link: routeForStandaloneNexusOperationDetails({
              namespace,
              operationId,
              runId,
            }),
          });
          return { type: 'success' };
        } catch {
          return { type: 'error' };
        }
      },
    },
  );

  const unsubscribe = encoding.subscribe((e) => {
    $form.encoding = e;
  });

  onMount(async () => {
    const operationIdParam = page.url.searchParams.get('operationId') ?? '';
    const runIdParam = page.url.searchParams.get('runId') ?? '';

    if (!operationIdParam || !runIdParam) return;

    const initialValues = await fetchInitialValuesForStartNexusOperation(
      namespace,
      operationIdParam,
    );

    $form.input = initialValues.input;
    encoding.set(initialValues.encoding);
    $form.messageType = initialValues.messageType;
    $form.summary = initialValues.summary;
    $form.details = initialValues.details;

    if (initialValues.searchAttributes) {
      const customAttrs = get(customSearchAttributes);
      const newAttrs = Object.entries(initialValues.searchAttributes)
        .filter(([key]) => key in customAttrs)
        .map(([key, value]) => ({
          label: key,
          value,
          type: customAttrs[key],
        }));
      searchAttributes = [...searchAttributes, ...newAttrs];
    }

    const hasAdvancedData =
      Object.keys(initialValues.searchAttributes ?? {}).length > 0 ||
      !!initialValues.summary ||
      !!initialValues.details;

    advancedOptionsVisible = advancedOptionsVisible || hasAdvancedData;
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  const generateRandomId = () => {
    $form.operationId = crypto.randomUUID();
  };

  const addNexusHeader = () => {
    $form.nexusHeader = [...$form.nexusHeader, { key: '', value: '' }];
  };

  const removeNexusHeader = (index: number) => {
    $form.nexusHeader = $form.nexusHeader.filter((_, i) => i !== index);
  };
</script>

<form class="max-w-[45rem] space-y-4" use:enhance novalidate>
  <Message value={$message} />

  <Input
    class="grow"
    label={translate('standalone-nexus-operations.form-operation-id-label')}
    required
    id="operationId"
    bind:value={$form.operationId}
    error={!!$errors?.operationId}
    hintText={$errors?.operationId?.[0]}
  >
    {#snippet afterInput()}
      <Button
        class="ml-2.5"
        variant="secondary"
        on:click={generateRandomId}
        leadingIcon="retry"
        >{translate('standalone-nexus-operations.form-random-uuid')}</Button
      >
    {/snippet}
  </Input>

  <Input
    id="endpoint"
    required
    label={translate('standalone-nexus-operations.form-endpoint-label')}
    bind:value={$form.endpoint}
    error={!!$errors.endpoint}
    hintText={$errors.endpoint?.[0]}
  />

  <Input
    id="service"
    required
    label={translate('standalone-nexus-operations.form-service-label')}
    bind:value={$form.service}
    error={!!$errors.service}
    hintText={$errors.service?.[0]}
  />

  <Input
    id="operation"
    required
    label={translate('standalone-nexus-operations.form-operation-name-label')}
    bind:value={$form.operation}
    error={!!$errors.operation}
    hintText={$errors.operation?.[0]}
  />

  <PayloadInputWithEncoding
    bind:input={$form.input}
    bind:messageType={$form.messageType}
    {encoding}
  />

  <Card class="space-y-4">
    <h5>{translate('standalone-nexus-operations.form-timeouts-heading')}</h5>

    <DurationInput
      id="startToCloseTimeout"
      label={translate(
        'standalone-nexus-operations.form-start-to-close-timeout-label',
      )}
      bind:value={$form.startToCloseTimeout}
    />

    <DurationInput
      id="scheduleToCloseTimeout"
      label={translate(
        'standalone-nexus-operations.form-schedule-to-close-timeout-label',
      )}
      bind:value={$form.scheduleToCloseTimeout}
    />

    <DurationInput
      id="scheduleToStartTimeout"
      label={translate(
        'standalone-nexus-operations.form-schedule-to-start-timeout-label',
      )}
      bind:value={$form.scheduleToStartTimeout}
    />

    {#if $errors.startToCloseTimeout}
      <p class="text-xs text-danger">
        {$errors.startToCloseTimeout}
      </p>
    {/if}
  </Card>

  {#if advancedOptionsVisible}
    <Card class="space-y-4">
      <h5>
        {translate('standalone-nexus-operations.form-nexus-header-heading')}
      </h5>
      {#each $form.nexusHeader as _, index (index)}
        <div class="flex items-center gap-2">
          <Input
            id="nexus-header-key-{index}"
            label=""
            labelHidden
            placeholder={translate(
              'standalone-nexus-operations.form-nexus-header-key-placeholder',
            )}
            bind:value={$form.nexusHeader[index].key}
          />
          <Input
            id="nexus-header-value-{index}"
            label=""
            labelHidden
            placeholder={translate(
              'standalone-nexus-operations.form-nexus-header-value-placeholder',
            )}
            bind:value={$form.nexusHeader[index].value}
          />
          <Button
            type="button"
            variant="ghost"
            leadingIcon="close"
            on:click={() => removeNexusHeader(index)}
          />
        </div>
      {/each}
      <Button type="button" variant="secondary" on:click={addNexusHeader}>
        {translate('standalone-nexus-operations.form-add-nexus-header')}
      </Button>
    </Card>

    <Card
      class="space-y-4"
      data-testid="start-standalone-nexus-operation-add-search-attributes"
    >
      <div class="space-y-2">
        <h5>
          {translate(
            'standalone-nexus-operations.form-search-attributes-heading',
          )}
        </h5>
        <p class="text-secondary">
          {translate(
            'standalone-nexus-operations.form-search-attributes-description',
          )}
        </p>
      </div>
      <AddSearchAttributes
        variant="secondary"
        bind:attributesToAdd={searchAttributes}
      />
    </Card>

    <Card
      class="space-y-4"
      data-testid="start-standalone-nexus-operation-add-metadata"
    >
      <div class="space-y-2">
        <h5>
          {translate('standalone-nexus-operations.form-user-metadata-heading')}
        </h5>
        <p class="text-secondary">
          {translate(
            'standalone-nexus-operations.form-user-metadata-description',
          )}
        </p>
      </div>
      <div class="space-y-2">
        <Label label={translate('workflows.summary')} for="summary" />
        <MarkdownEditor bind:content={$form.summary} />
      </div>
      <div class="space-y-2">
        <Label label={translate('workflows.details')} for="details" />
        <MarkdownEditor bind:content={$form.details} />
      </div>
    </Card>

    <Card class="space-y-4">
      <h5>
        {translate('standalone-nexus-operations.form-id-policies-heading')}
      </h5>

      <Select
        label={translate(
          'standalone-nexus-operations.form-id-reuse-policy-label',
        )}
        id="start-standalone-nexus-operation-id-reuse-policy-select"
        bind:value={$form.idReusePolicy}
      >
        {#each nexusOperationIdReusePolicyOptions as option (option)}
          <Option value={option}
            >{fromScreamingEnum(option, 'NexusOperationIdReusePolicy')}</Option
          >
        {/each}
      </Select>

      <Select
        label={translate(
          'standalone-nexus-operations.form-id-conflict-policy-label',
        )}
        id="start-standalone-nexus-operation-id-conflict-policy-select"
        bind:value={$form.idConflictPolicy}
      >
        {#each nexusOperationIdConflictPolicyOptions as option (option)}
          <Option value={option}
            >{fromScreamingEnum(
              option,
              'NexusOperationIdConflictPolicy',
            )}</Option
          >
        {/each}
      </Select>
    </Card>
  {/if}

  <div class="flex items-center justify-between">
    <Button
      type="button"
      variant="ghost"
      trailingIcon={advancedOptionsVisible ? 'chevron-up' : 'chevron-down'}
      data-testid="start-standalone-nexus-operation-more-options"
      on:click={() => (advancedOptionsVisible = !advancedOptionsVisible)}
    >
      {translate('common.more-options')}
    </Button>

    <Button
      data-testid="start-standalone-nexus-operation-submit-button"
      type="submit"
    >
      {translate(
        'standalone-nexus-operations.start-standalone-nexus-operation',
      )}
    </Button>
  </div>
</form>
