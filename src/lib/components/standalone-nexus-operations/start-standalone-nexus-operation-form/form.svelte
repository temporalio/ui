<script lang="ts">
  import { get, writable } from 'svelte/store';

  import { onDestroy, onMount, tick } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import z from 'zod/v3';

  import { page } from '$app/state';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Link from '$lib/holocene/link.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    encodings,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import {
    fetchInitialValuesForStartNexusOperation,
    type StartNexusOperationFormData,
    startStandaloneNexusOperation,
  } from '$lib/services/standalone-nexus-operations';
  import {
    customSearchAttributes,
    type SearchAttributesSchema,
  } from '$lib/stores/search-attributes';
  import { toaster } from '$lib/stores/toaster';
  import {
    type NexusOperationIdConflictPolicy,
    type NexusOperationIdReusePolicy,
  } from '$lib/types';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { routeForStandaloneNexusOperationDetails } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import type { StartNexusOperationFormDefaults } from './types';
  import Message from '../../form/message.svelte';
  import PayloadInputWithEncoding from '../../payload-input-with-encoding.svelte';
  import AddSearchAttributes from '../../workflow/add-search-attributes.svelte';

  import OperationPoliciesModal from './operation-policies-modal.svelte';

  interface Props {
    namespace: string;
  }

  const { namespace }: Props = $props();

  const formDefaults = $derived<StartNexusOperationFormDefaults>({
    namespace,
    identity: getIdentity() ?? '',
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
  let operationPoliciesModalOpen = $state(false);

  const isPositiveDuration = (value: string | undefined): boolean => {
    const seconds = Number(parseDuration(value ?? ''));
    return !isNaN(seconds) && seconds > 0;
  };

  const startDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const schema = z.object({
    identity: z.string(),
    namespace: z.string(),
    operationId: z.string().default(''),
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
    input: z.string().default(''),
    encoding: z.enum(encodings).default('json/plain'),
    messageType: z.string().default(''),
    startToCloseTimeout: z.string().default(''),
    scheduleToCloseTimeout: z.string().default(''),
    scheduleToStartTimeout: z.string().default(''),
    idReusePolicy: z.string().default(''),
    idConflictPolicy: z.string().default(''),
    summary: z.string().default(''),
    details: z.string().default(''),
    nexusHeader: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .default([]),
  });

  let operationIdServerError = $state('');
  let operationIdConflictInfo = $state<{
    operationId: string;
    runId: string;
  } | null>(null);
  let operationIdErrorSnapshot = '';

  function setOperationIdError(operationId: string, errorText: string) {
    operationIdErrorSnapshot = operationId;
    operationIdServerError = errorText;
  }

  function handleRejectDuplicate(operationId: string) {
    toaster.push({
      variant: 'error',
      duration: 10000,
      message: translate(
        'standalone-nexus-operations.form-operation-id-duplicate-toast',
      ),
    });
    setOperationIdError(
      operationId,
      translate(
        'standalone-nexus-operations.form-operation-id-duplicate-error',
      ),
    );
  }

  function handleAllowDuplicateFailedOnly(operationId: string) {
    toaster.push({
      variant: 'error',
      duration: 10000,
      message: translate(
        'standalone-nexus-operations.form-operation-id-duplicate-completed-toast',
      ),
    });
    setOperationIdError(
      operationId,
      translate(
        'standalone-nexus-operations.form-operation-id-duplicate-completed-error',
      ),
    );
  }

  function handleUseExistingConflict(operationId: string, error: unknown) {
    const runId =
      (isNetworkError(error) ? error.message : null)?.match(
        /run_id=([^,\s]+)/,
      )?.[1] ?? '';
    toaster.push({
      variant: 'error',
      duration: 10000,
      message: translate(
        'standalone-nexus-operations.form-operation-id-conflict-toast',
      ),
    });
    operationIdConflictInfo = { operationId, runId };
    setOperationIdError(
      operationId,
      translate('standalone-nexus-operations.form-operation-id-conflict-hint'),
    );
  }

  const initialData: z.infer<typeof schema> = {
    ...formDefaults,
    input: '',
    messageType: '',
    scheduleToStartTimeout: '',
    summary: '',
    details: '',
    idReusePolicy: '',
    idConflictPolicy: '',
    nexusHeader: [],
  };

  const { form, enhance, errors, message } = superForm(initialData, {
    SPA: true,
    dataType: 'json',
    resetForm: false,
    invalidateAll: false,
    validators: zodClient(schema),
    onUpdate: async ({ form }) => {
      if (!form.valid) return;

      const { idReusePolicy, idConflictPolicy } = form.data;

      try {
        const operationId = form.data.operationId || crypto.randomUUID();
        const nexusHeaderRecord = form.data.nexusHeader.reduce<
          Record<string, string>
        >((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {});

        const { runId } = await startStandaloneNexusOperation({
          ...form.data,
          operationId,
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
        } as StartNexusOperationFormData);

        toaster.push({
          duration: 5000,
          variant: 'success',
          message: translate(
            'standalone-nexus-operations.form-nexus-operation-started',
          ),
          link: routeForStandaloneNexusOperationDetails({
            namespace,
            operationId,
            runId: runId ?? '',
          }),
        });
        return { type: 'success' };
      } catch (error) {
        if (!isNetworkError(error) || error.statusCode !== 409) {
          return { type: 'error' };
        }

        const { operationId } = form.data;

        if (
          idReusePolicy === 'NEXUS_OPERATION_ID_REUSE_POLICY_REJECT_DUPLICATE'
        ) {
          handleRejectDuplicate(operationId);
        } else if (
          idReusePolicy ===
          'NEXUS_OPERATION_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY'
        ) {
          handleAllowDuplicateFailedOnly(operationId);
        } else if (
          idConflictPolicy === 'NEXUS_OPERATION_ID_CONFLICT_POLICY_USE_EXISTING'
        ) {
          handleUseExistingConflict(operationId, error);
        }

        await tick();
        document.getElementById('operationId')?.focus();
      }
    },
  });

  $effect(() => {
    const current = $form.operationId;
    if (operationIdServerError && current !== operationIdErrorSnapshot) {
      operationIdServerError = '';
    }
    if (operationIdConflictInfo && current !== operationIdErrorSnapshot) {
      operationIdConflictInfo = null;
    }
  });

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
      runIdParam,
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

<form class="space-y-4" use:enhance novalidate>
  <Message value={$message} />

  <div class="flex items-start gap-6">
    <div class="min-w-0 flex-1 space-y-4">
      <Card class="space-y-4">
        <h5>
          {translate(
            'standalone-nexus-operations.form-nexus-operation-details-heading',
          )}
        </h5>

        <div class="space-y-1">
          <Label
            label={translate(
              'standalone-nexus-operations.form-operation-id-label',
            )}
            for="operationId"
          />
          <p class="text-sm text-secondary">
            {translate('standalone-nexus-operations.form-operation-id-body')}
          </p>
          <Input
            class="grow"
            label={translate(
              'standalone-nexus-operations.form-operation-id-label',
            )}
            labelHidden
            id="operationId"
            bind:value={$form.operationId}
            error={!!operationIdServerError}
            hintText={operationIdServerError || undefined}
          >
            {#snippet afterInput()}
              <Button
                class="ml-2.5"
                variant="secondary"
                on:click={generateRandomId}
                leadingIcon="retry"
                >{translate(
                  'standalone-nexus-operations.form-random-uuid',
                )}</Button
              >
            {/snippet}
          </Input>
          {#if operationIdConflictInfo}
            <Alert intent="info">
              <span>
                {translate(
                  'standalone-nexus-operations.form-operation-id-conflict-banner-prefix',
                )}
                {#if operationIdConflictInfo.runId}
                  <Link
                    href={routeForStandaloneNexusOperationDetails({
                      namespace,
                      operationId: operationIdConflictInfo.operationId,
                      runId: operationIdConflictInfo.runId,
                    })}>{operationIdConflictInfo.operationId}</Link
                  >
                {:else}
                  {operationIdConflictInfo.operationId}
                {/if}
                {translate(
                  'standalone-nexus-operations.form-operation-id-conflict-banner-suffix',
                )}
              </span>
            </Alert>
          {/if}
        </div>

        <div class="space-y-1">
          <Label
            label={translate('standalone-nexus-operations.form-endpoint-label')}
            for="endpoint"
            required
          />
          <p class="text-sm text-secondary">
            {translate('standalone-nexus-operations.form-endpoint-body')}
          </p>
          <Input
            id="endpoint"
            required
            label={translate('standalone-nexus-operations.form-endpoint-label')}
            labelHidden
            bind:value={$form.endpoint}
            error={!!$errors.endpoint}
            hintText={$errors.endpoint?.[0]}
          />
        </div>

        <div class="space-y-1">
          <Label
            label={translate('standalone-nexus-operations.form-service-label')}
            for="service"
            required
          />
          <p class="text-sm text-secondary">
            {translate('standalone-nexus-operations.form-service-body')}
          </p>
          <Input
            id="service"
            required
            label={translate('standalone-nexus-operations.form-service-label')}
            labelHidden
            bind:value={$form.service}
            error={!!$errors.service}
            hintText={$errors.service?.[0]}
          />
        </div>

        <div class="space-y-1">
          <Label
            label={translate(
              'standalone-nexus-operations.form-operation-name-label',
            )}
            for="operation"
            required
          />
          <p class="text-sm text-secondary">
            {translate('standalone-nexus-operations.form-operation-name-body')}
          </p>
          <Input
            id="operation"
            required
            label={translate(
              'standalone-nexus-operations.form-operation-name-label',
            )}
            labelHidden
            bind:value={$form.operation}
            error={!!$errors.operation}
            hintText={$errors.operation?.[0]}
          />
        </div>

        <PayloadInputWithEncoding
          bind:input={$form.input}
          bind:messageType={$form.messageType}
          {encoding}
        />
      </Card>

      <Card class="space-y-4">
        <div class="flex items-center justify-between">
          <h5>
            {translate(
              'standalone-nexus-operations.form-operation-policies-heading',
            )}
          </h5>
          <Button
            type="button"
            variant="secondary"
            on:click={() => (operationPoliciesModalOpen = true)}
          >
            {translate(
              'standalone-nexus-operations.form-edit-operation-policies',
            )}
          </Button>
        </div>
        <p class="text-sm text-secondary">
          {translate(
            'standalone-nexus-operations.form-operation-policies-description',
          )}
          <Link
            href="https://docs.temporal.io/nexus/operations"
            newTab
            class="inline"
          >
            {translate(
              'standalone-nexus-operations.form-operation-policies-link',
            )}
          </Link>
        </p>
        <dl class="flex flex-col gap-2 text-sm">
          <div class="flex items-center gap-6">
            <dt class="w-[260px] shrink-0 font-medium text-secondary">
              {translate(
                'standalone-nexus-operations.form-closed-operation-id-reuse-label',
              )}
            </dt>
            <dd>
              {$form.idReusePolicy
                ? fromScreamingEnum(
                    $form.idReusePolicy,
                    'NexusOperationIdReusePolicy',
                  )
                : translate(
                    'standalone-nexus-operations.form-id-reuse-policy-default',
                  )}
            </dd>
          </div>
          <div class="flex items-center gap-6">
            <dt class="w-[260px] shrink-0 font-medium text-secondary">
              {translate(
                'standalone-nexus-operations.form-running-operation-id-conflict-label',
              )}
            </dt>
            <dd>
              {$form.idConflictPolicy
                ? fromScreamingEnum(
                    $form.idConflictPolicy,
                    'NexusOperationIdConflictPolicy',
                  )
                : translate(
                    'standalone-nexus-operations.form-id-conflict-policy-default',
                  )}
            </dd>
          </div>
          <div class="flex items-center gap-6">
            <dt class="w-[260px] shrink-0 font-medium text-secondary">
              {translate(
                'standalone-nexus-operations.form-timeouts-summary-label',
              )}
            </dt>
            <dd>
              {isPositiveDuration($form.startToCloseTimeout) ||
              isPositiveDuration($form.scheduleToCloseTimeout) ||
              isPositiveDuration($form.scheduleToStartTimeout)
                ? [
                    $form.startToCloseTimeout,
                    $form.scheduleToCloseTimeout,
                    $form.scheduleToStartTimeout,
                  ]
                    .filter(isPositiveDuration)
                    .join(', ')
                : translate(
                    'standalone-nexus-operations.form-timeouts-default',
                  )}
            </dd>
          </div>
        </dl>
      </Card>

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
            {translate(
              'standalone-nexus-operations.form-user-metadata-heading',
            )}
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

      <div class="flex justify-end">
        <Button
          data-testid="start-standalone-nexus-operation-submit-button"
          type="submit"
        >
          {translate(
            'standalone-nexus-operations.start-standalone-nexus-operation',
          )}
        </Button>
      </div>
    </div>

    <Card class="sticky top-16 w-[440px] shrink-0 space-y-4">
      <h5>
        {translate('standalone-nexus-operations.operation-summary-heading')}
      </h5>
      <dl class="space-y-3 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-secondary">
            {translate(
              'standalone-nexus-operations.operation-summary-start-date',
            )}
          </dt>
          <dd>{startDate}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-secondary">
            {translate(
              'standalone-nexus-operations.operation-summary-target-endpoint',
            )}
          </dt>
          <dd class="text-right">{$form.endpoint || '—'}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-secondary">
            {translate(
              'standalone-nexus-operations.operation-summary-service-name',
            )}
          </dt>
          <dd class="text-right">{$form.service || '—'}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-secondary">
            {translate(
              'standalone-nexus-operations.operation-summary-operation-name',
            )}
          </dt>
          <dd class="text-right">{$form.operation || '—'}</dd>
        </div>
      </dl>
    </Card>
  </div>

  <OperationPoliciesModal
    bind:open={operationPoliciesModalOpen}
    bind:startToCloseTimeout={$form.startToCloseTimeout}
    bind:scheduleToCloseTimeout={$form.scheduleToCloseTimeout}
    bind:scheduleToStartTimeout={$form.scheduleToStartTimeout}
    bind:idReusePolicy={$form.idReusePolicy}
    bind:idConflictPolicy={$form.idConflictPolicy}
  />
</form>
