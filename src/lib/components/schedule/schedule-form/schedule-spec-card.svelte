<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';

  import { tick } from 'svelte';
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { DescribeFullSchedule } from '$lib/types/schedule';

  import type { FormScheduleSchema } from '../schema/form';
  import { getFormSpecInitialData } from '../utilities/get-form-spec-initial-data';

  import ScheduleSpecItem from './schedule-spec-item.svelte';

  interface Props {
    form: SuperForm<FormScheduleSchema>['form'];
    errors: SuperForm<FormScheduleSchema>['errors'];
    validateForm: SuperForm<FormScheduleSchema>['validateForm'];
    schedule?: DescribeFullSchedule | null;
  }

  let { form, errors, validateForm, schedule = null }: Props = $props();

  const specItemElsByIndex = new SvelteMap<number, ScheduleSpecItem>();

  // svelte-ignore state_referenced_locally
  let expandedIndex: number | null = $state(schedule ? null : 0);

  const validateSpec = async (index: number): Promise<boolean> => {
    const { errors: formErrors } = await validateForm();
    const specErrors = formErrors.specs?.[index];

    errors.update((errStore) => ({
      ...errStore,
      specs: { ...(errStore.specs ?? {}), [index]: specErrors ?? {} },
    }));

    return !specErrors || Object.keys(specErrors).length === 0;
  };

  const addSpec = async () => {
    if (
      typeof expandedIndex === 'number' &&
      !(await validateSpec(expandedIndex))
    ) {
      return;
    }

    $form.specs = [...$form.specs, getFormSpecInitialData('cron')];
    expandedIndex = $form.specs.length - 1;

    await tick();
    specItemElsByIndex.get(expandedIndex)?.focus();
  };

  const removeSpec = async (index: number) => {
    $form.specs = $form.specs.filter((_, i) => i !== index);

    if (!$form.specs.length) {
      $form.specs = [getFormSpecInitialData('cron')];
      expandedIndex = 0;
      await tick();
      specItemElsByIndex.get(expandedIndex)?.focus();
      return;
    }

    if (typeof expandedIndex !== 'number') {
      // no spec was expanded
      return;
    }

    if (expandedIndex === index) {
      // expanded spec was removed
      expandedIndex = null;
      return;
    }

    if (expandedIndex > index) {
      // expanded spec came after removed spec
      expandedIndex = expandedIndex - 1;
      return;
    }

    // clamp index to new spec list size
    expandedIndex = Math.min(expandedIndex, $form.specs.length - 1);
    await tick();
    specItemElsByIndex.get(expandedIndex)?.focus();
  };
</script>

<Card class="w-full">
  <h2 class="text-2xl font-medium">{translate('schedules.schedule-spec')}</h2>
  <div class="mt-4 flex flex-col gap-4">
    <p class="text-sm text-secondary">
      {translate('schedules.spec-description')}
      <Link href="https://docs.temporal.io/schedule#spec" newTab>
        {translate('schedules.spec-learn-more')}
      </Link>
    </p>

    <div class="flex flex-col gap-4">
      {#each $form.specs as _, i (i)}
        {@const isExpanded = expandedIndex === i}
        <ScheduleSpecItem
          {form}
          bind:this={
            () => specItemElsByIndex.get(i), (v) => specItemElsByIndex.set(i, v)
          }
          index={i}
          expanded={isExpanded}
          canRemove={!isExpanded || $form.specs.length > 1}
          onRemove={() => removeSpec(i)}
          {errors}
        />
      {/each}
    </div>

    <div>
      <Button variant="secondary" on:click={addSpec}>
        {translate('schedules.add-another-spec')}
      </Button>
    </div>
  </div>
</Card>
