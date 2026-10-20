<script lang="ts">
  import { tick } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import { page } from '$app/state';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { formatList } from '$lib/i18n/format-list';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft, IconTrash } from '$lib/io/icon';
  import {
    loading,
    openConfirmationModal,
    serverError,
  } from '$lib/stores/schedules';
  import {
    customSearchAttributes,
    type SearchAttributesSchema,
  } from '$lib/stores/search-attributes';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import type { SearchAttributes } from '$lib/types/workflows';
  import {
    routeForSchedule,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import DeleteScheduleModal from '../schedule-action-modals/delete-schedule-modal.svelte';
  import {
    resolveScheduledAction,
    scheduledActionTypes,
  } from '../scheduled-action-types/registry';
  import type {
    ScheduledActionForm,
    ScheduledActionSummaryItem,
  } from '../scheduled-action-types/types';
  import { formScheduleSchema } from '../schema/form';
  import type { ScheduleFormData } from '../types';
  import { getFormScheduleDefaults } from '../utilities/get-form-schedule-defaults';

  import ScheduleDetailsCard from './schedule-details-card.svelte';
  import SchedulePoliciesCard from './schedule-policies-card.svelte';
  import ScheduleSpecCard from './schedule-spec-card.svelte';
  import ScheduleSummarySidebar from './schedule-summary-sidebar.svelte';
  import SchedulesSearchAttributesCard from './schedules-search-attributes-card.svelte';

  interface Props {
    schedule?: DescribeFullSchedule | null;
    searchAttributes?: SearchAttributes;
    onSubmit: (formData: ScheduleFormData) => Promise<void>;
  }

  let { schedule = null, searchAttributes = {}, onSubmit }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const scheduleId = $derived(page.params.schedule);

  const title = $derived(
    translate(schedule ? 'schedules.edit' : 'schedules.create'),
  );
  const backTitle = $derived(
    translate(
      schedule ? 'schedules.back-to-schedule' : 'schedules.back-to-schedules',
    ),
  );
  const backHref = $derived(
    schedule
      ? routeForSchedule({ namespace, scheduleId })
      : routeForSchedules({ namespace }),
  );
  const confirmText = $derived(
    schedule ? translate('common.save') : translate('schedules.create'),
  );

  const initialFormValues = $derived(
    getFormScheduleDefaults(schedule, {
      searchAttributes,
      customSearchAttributes: $customSearchAttributes,
    }),
  );

  const actionResolution = $derived.by(() => {
    const resolution = resolveScheduledAction(schedule);
    if (resolution.status === 'unknown') return resolution;

    return {
      ...resolution,
      formAdapter:
        scheduledActionTypes[resolution.action.type].loadFormAdapter(),
    };
  });

  // svelte-ignore state_referenced_locally
  const superform = superForm(initialFormValues, {
    SPA: true,
    dataType: 'json',
    validators: zodClient(formScheduleSchema),
    resetForm: false,
    onSubmit: async ({ cancel }) => {
      // 'cancel'ing because we handle validation coordination and submission in the handleSubmit function
      cancel();
      await handleSubmit();
    },
  });

  const {
    form,
    errors: formErrors,
    allErrors,
    enhance,
    validateForm,
  } = superform;

  // The search attribute inputs edit rows in place (e.g. selecting an
  // attribute or typing a value). Those deep mutations propagate through
  // Svelte's reactive proxies but never reach superForm's `$form` store, so
  // binding the inputs directly to `$form` would drop every edit that isn't a
  // whole-array add/remove. Bridge through local $state proxies and sync the
  // snapshots back to `$form` so the changes are committed before submit.
  let scheduleSearchAttributes = $state($form.searchAttributes);
  let actionSearchAttributes = $state<SearchAttributesSchema>([]);
  let actionForm = $state<ScheduledActionForm>();
  let actionSummary = $state<ScheduledActionSummaryItem[]>([]);
  let submitting = $state(false);
  let formElement: HTMLFormElement;

  $effect(() => {
    $form.searchAttributes = $state.snapshot(scheduleSearchAttributes);
  });
  const handleSubmit = async () => {
    if (
      submitting ||
      actionResolution.status === 'unknown' ||
      !actionForm ||
      !writeActionsAreAllowed()
    ) {
      return;
    }

    submitting = true;

    try {
      const [validatedSchedule, validatedAction] = await Promise.all([
        validateForm({ update: true, focusOnError: false }),
        actionForm.validate(),
      ]);
      if (!validatedSchedule.valid || !validatedAction) {
        await tick();
        const invalidField = formElement.querySelector<HTMLElement>(
          '[aria-invalid="true"]',
        );
        invalidField?.focus();
        invalidField?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      await onSubmit({
        schedule: validatedSchedule.data,
        action: validatedAction,
      });
    } finally {
      submitting = false;
    }
  };

  const onInput = () => {
    if ($serverError) {
      $serverError = '';
    }
  };

  $effect(() => {
    return () => {
      $serverError = '';
    };
  });
</script>

<div class="flex flex-col gap-4 pb-10">
  {#if $loading}
    <Loading />
  {/if}
  <div class="flex flex-col gap-4" class:hidden={$loading}>
    <Link href={backHref} LeadingIcon={IconChevronLeft}>
      {backTitle}
    </Link>
    <h1>{title}</h1>

    <form novalidate bind:this={formElement} use:enhance oninput={onInput}>
      <div
        class="relative grid grid-cols-1 gap-6 xl:grid-cols-[minmax(min-content,54rem),minmax(19rem,23rem)]"
      >
        <div class="flex w-full flex-col gap-6">
          <ScheduleDetailsCard {form} errors={formErrors} {schedule} />
          <ScheduleSpecCard
            {form}
            errors={formErrors}
            {validateForm}
            {schedule}
          />
          <SchedulePoliciesCard {form} />
          {#if actionResolution.status === 'known'}
            {#await actionResolution.formAdapter}
              <Loading />
            {:then FormAdapter}
              {#key actionResolution.action.type}
                <FormAdapter
                  resolvedAction={actionResolution.action}
                  customSearchAttributes={$customSearchAttributes}
                  bind:this={actionForm}
                  bind:searchAttributes={actionSearchAttributes}
                  onSummaryChange={(summary) => (actionSummary = summary)}
                />
              {/key}
            {:catch}
              <Alert
                intent="error"
                title={translate('schedules.action-form-load-error')}
              />
            {/await}
          {:else}
            <Alert
              intent="error"
              title={translate('schedules.unsupported-action-edit')}
            />
          {/if}
          <SchedulesSearchAttributesCard
            bind:scheduleSearchAttributes
            bind:actionSearchAttributes
            actionType={actionResolution.status === 'known' && actionForm
              ? actionResolution.action.type
              : null}
          />
        </div>

        <div class="w-full xl:col-start-2 xl:row-start-1">
          <ScheduleSummarySidebar
            {form}
            actionSummary={actionResolution.status === 'known'
              ? actionSummary
              : []}
          />
        </div>

        <Alert
          class="xl:col-start-1"
          intent="error"
          title={translate('schedules.fix-form-errors')}
          hidden={!$allErrors.length}
        >
          <ul class="list-inside list-disc">
            {#each $allErrors as { path, messages } (path)}
              <li>
                {formatList(messages)}
              </li>
            {/each}
          </ul>
        </Alert>
        <div
          class="flex flex-row items-center gap-4 max-sm:flex-col xl:col-start-1"
        >
          <Button
            disabled={actionResolution.status === 'unknown' ||
              !actionForm ||
              submitting ||
              !writeActionsAreAllowed()}
            type="submit"
            class="max-sm:w-full"
            data-testid="create-schedule-button">{confirmText}</Button
          >
          <Button
            variant="ghost"
            type="button"
            href={backHref}
            class="max-sm:w-full"
            data-testid="cancel-schedule-button"
            >{translate('common.cancel')}</Button
          >
          {#if Boolean(schedule)}
            <Button
              disabled={submitting || !writeActionsAreAllowed()}
              variant="destructive"
              type="button"
              data-testid="delete-schedule-button"
              LeadingIcon={IconTrash}
              class="ml-auto hidden sm:inline-flex"
              onclick={() => openConfirmationModal('delete')}
            >
              {translate('schedules.delete')}
            </Button>
            <DeleteScheduleModal {scheduleId} {namespace} />
          {/if}
        </div>
      </div>
    </form>

    <Alert intent="error" title={$serverError} hidden={!$serverError} />
    <CodecServerErrorBanner />
  </div>
</div>
