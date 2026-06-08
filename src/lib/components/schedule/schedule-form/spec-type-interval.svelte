<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { intervalUnits } from '../constants';
  import type { ScheduleFormData } from '../schema/form-schema';
  import { assertSpecType } from '../utilities/spec';

  import ScheduleSpecPreview from './schedule-spec-preview.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    index: number;
  }

  let { form, index, errors }: Props = $props();

  const uuid = $props.id();

  const spec = $derived(assertSpecType($form.specs[index], 'interval'));
</script>

<div class="flex flex-col gap-4">
  <DurationInput
    id="interval-{uuid}"
    inputClass="max-w-96"
    label={translate('schedules.interval-label')}
    bind:value={
      () => spec.interval,
      (v) => ($form.specs[index] = { ...spec, interval: v })
    }
    units={intervalUnits}
    initialUnit="second(s)"
    inputmode="numeric"
    min={1}
    placeholder="00"
    error={!!$errors.specs?.[index]?.interval?.[0]}
    hintText={$errors.specs?.[index]?.interval?.[0]}
    hintTextAbove={translate('schedules.interval-view-description')}
  />

  <DurationInput
    id="phase-{uuid}"
    inputClass="max-w-96"
    label={translate('schedules.offset-heading')}
    bind:value={
      () => spec.phase, (v) => ($form.specs[index] = { ...spec, phase: v })
    }
    initialUnit="minute(s)"
    inputmode="numeric"
    min={0}
    placeholder="00"
    error={!!$errors.specs?.[index]?.phase?.[0]}
    hintText={$errors.specs?.[index]?.phase?.[0]}
    hintTextAbove={translate('schedules.offset-description')}
  />

  <ScheduleSpecPreview {form} {index} />
</div>
