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
  import { error, loading } from '$lib/stores/schedules';
  import { customSearchAttributes } from '$lib/stores/search-attributes';
  import type { FullSchedule } from '$lib/types/schedule';
  import {
    routeForSchedule,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import {
    getDefaultValues,
    type ScheduleFormData,
    scheduleFormSchema,
  } from './schema';

  import ScheduleDetailsCard from './schedule-details-card.svelte';
  import SchedulePoliciesCard from './schedule-policies-card.svelte';
  import ScheduleSpecCard from './schedule-spec-card.svelte';
  import ScheduleSummarySidebar from './schedule-summary-sidebar.svelte';
  import SchedulesSearchAttributesInputs from './schedules-search-attributes-inputs.svelte';

  import type { SearchAttribute } from '$types';

  interface Props {
    schedule?: FullSchedule | null;
    searchAttributes?: SearchAttribute;
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

  const initialValues = $derived(
    getDefaultValues({
      schedule,
      searchAttributes,
      customSearchAttributes: $customSearchAttributes,
      scheduleId,
    }),
  );

  // svelte-ignore state_referenced_locally
  const superform = superForm(initialValues, {
    SPA: true,
    dataType: 'json',
    validators: zodClient(scheduleFormSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) {
        const errors: string[] = [];
        for (const [field, errs] of Object.entries(form.errors)) {
          if (Array.isArray(errs) && errs.length > 0) {
            errors.push(`${field}: ${(errs as string[]).join(', ')}`);
          }
        }
        validationError =
          errors.join('; ') || 'Please fix the form errors above.';
        return;
      }
      validationError = '';
      await onSubmit(form.data);
    },
  });

  const { form, errors: formErrors, enhance, submitting } = superform;

  let validationError = $state('');

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
    if ($error) {
      $error = '';
    }
  };

  $effect(() => {
    return () => {
      $error = '';
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

    <div
      class="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr,minmax(19rem,23rem)]"
    >
      <form novalidate use:enhance oninput={onInput}>
        <div class="flex w-full flex-col gap-6">
          <ScheduleDetailsCard {form} errors={$formErrors} {schedule} />
          <ScheduleSpecCard {form} />
          <SchedulePoliciesCard {form} />

          <SchedulesSearchAttributesInputs
            bind:scheduleSearchAttributes
            bind:workflowSearchAttributes
          />

          <Alert
            intent="error"
            title={validationError}
            hidden={!validationError}
          />
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
          </div>
        </div>
      </form>

      <div class="w-full">
        <ScheduleSummarySidebar formData={$form} />
      </div>
    </div>
    <Alert intent="error" title={$error} hidden={!$error} />
    <CodecServerErrorBanner />
  {/if}
</div>
