<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import { page } from '$app/state';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    loading,
    openConfirmationModal,
    serverError,
  } from '$lib/stores/schedules';
  import { customSearchAttributes } from '$lib/stores/search-attributes';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import type { SearchAttributes } from '$lib/types/workflows';
  import {
    routeForSchedule,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import DeleteScheduleModal from '../schedule-action-modals/delete-schedule-modal.svelte';
  import { type FormScheduleSchema, formScheduleSchema } from '../schema/form';
  import { getFormScheduleDefaults } from '../utilities/get-form-schedule-defaults';

  import ScheduleDetailsCard from './schedule-details-card.svelte';
  import SchedulePoliciesCard from './schedule-policies-card.svelte';
  import ScheduleSpecCard from './schedule-spec-card.svelte';
  import ScheduleSummarySidebar from './schedule-summary-sidebar.svelte';
  import SchedulesSearchAttributesCard from './schedules-search-attributes-card.svelte';

  interface Props {
    schedule?: DescribeFullSchedule | null;
    searchAttributes?: SearchAttributes;
    onSubmit: (formData: FormScheduleSchema) => Promise<void>;
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

  // svelte-ignore state_referenced_locally
  const superform = superForm(initialFormValues, {
    SPA: true,
    dataType: 'json',
    validators: zodClient(formScheduleSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      await onSubmit(form.data);
    },
  });

  const {
    form,
    errors: formErrors,
    allErrors,
    enhance,
    submitting,
    validateForm,
  } = superform;

  // The search attribute inputs edit rows in place (e.g. selecting an
  // attribute or typing a value). Those deep mutations propagate through
  // Svelte's reactive proxies but never reach superForm's `$form` store, so
  // binding the inputs directly to `$form` would drop every edit that isn't a
  // whole-array add/remove. Bridge through local $state proxies and sync the
  // snapshots back to `$form` so the changes are committed before submit.
  let scheduleSearchAttributes = $state($form.searchAttributes);
  let workflowSearchAttributes = $state($form.workflowSearchAttributes);

  $effect(() => {
    $form.searchAttributes = $state.snapshot(scheduleSearchAttributes);
  });
  $effect(() => {
    $form.workflowSearchAttributes = $state.snapshot(workflowSearchAttributes);
  });

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
  {:else}
    <Link href={backHref} icon="chevron-left">
      {backTitle}
    </Link>
    <h1>{title}</h1>

    <form novalidate use:enhance oninput={onInput}>
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
          <SchedulesSearchAttributesCard
            bind:scheduleSearchAttributes
            bind:workflowSearchAttributes
          />
          <SchedulePoliciesCard {form} />

          <div class="w-full xl:hidden">
            <ScheduleSummarySidebar {form} />
          </div>

          <Alert
            intent="error"
            title={translate('schedules.fix-form-errors')}
            hidden={!$allErrors.length}
          >
            <ul class="list-inside list-disc">
              {#each $allErrors as { path, messages } (path)}
                <li>
                  {new Intl.ListFormat('en', {
                    type: 'conjunction',
                    style: 'long',
                  }).format(messages)}
                </li>
              {/each}
            </ul>
          </Alert>
          <div class="flex flex-row items-center gap-4 max-sm:flex-col">
            <Button
              disabled={$submitting || !writeActionsAreAllowed()}
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
                disabled={$submitting || !writeActionsAreAllowed()}
                variant="destructive"
                type="button"
                data-testid="delete-schedule-button"
                leadingIcon="trash"
                class="ml-auto hidden sm:inline-flex"
                on:click={() => openConfirmationModal('delete')}
              >
                {translate('schedules.delete')}
              </Button>
              <DeleteScheduleModal {scheduleId} {namespace} />
            {/if}
          </div>
        </div>

        <div class="hidden w-full xl:block">
          <ScheduleSummarySidebar {form} />
        </div>
      </div>
    </form>

    <Alert intent="error" title={$serverError} hidden={!$serverError} />
    <CodecServerErrorBanner />
  {/if}
</div>
