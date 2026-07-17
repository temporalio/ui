<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { FormScheduleSchema } from '../schema/form';

  interface Props {
    form: SuperForm<FormScheduleSchema>['form'];
    errors: SuperForm<FormScheduleSchema>['errors'];
    index: number;
  }

  let { form, errors, index }: Props = $props();

  const uuid = $props.id();

  const spec = $derived($form.specs[index]);

  const hourError = $derived(
    $errors.specs?.[index]?.calendar?.hour?.[0]?.start?.[0] ??
      $errors.specs?.[index]?.calendar?.hour?._errors?.[0],
  );
  const minuteError = $derived(
    $errors.specs?.[index]?.calendar?.minute?.[0]?.start?.[0] ??
      $errors.specs?.[index]?.calendar?.minute?._errors?.[0],
  );

  function setHour(value: string): void {
    const n = value === '' ? undefined : Number(value);
    $form.specs[index] = {
      ...spec,
      calendar: {
        ...spec.calendar,
        hour: n !== undefined && Number.isFinite(n) ? [{ start: n }] : [],
      },
    };
  }

  function setMinute(value: string): void {
    const n = value === '' ? undefined : Number(value);
    $form.specs[index] = {
      ...spec,
      calendar: {
        ...spec.calendar,
        minute: n !== undefined && Number.isFinite(n) ? [{ start: n }] : [],
      },
    };
  }
</script>

<fieldset class="flex flex-col gap-2.5">
  <legend class="contents font-medium"
    >{translate('schedules.run-time-heading')}</legend
  >
  <p class="text-sm text-secondary">
    {translate('schedules.run-time-description', {
      timezoneName: $form.timezoneName ?? 'UTC',
    })}
  </p>
  <div class="grid max-w-[27rem] gap-2 md:grid-cols-2">
    <Input
      id="hours-{uuid}"
      label={translate('common.hours')}
      labelHidden
      type="number"
      inputmode="numeric"
      step={1}
      min={0}
      max={23}
      placeholder="00"
      suffix={translate('common.hours-abbreviated')}
      error={!!hourError}
      hintText={hourError}
      bind:value={
        () => spec.calendar.hour?.[0]?.start?.toString() ?? '', setHour
      }
    />

    <Input
      id="minutes-{uuid}"
      label={translate('common.minutes')}
      labelHidden
      type="number"
      inputmode="numeric"
      step={1}
      min={0}
      max={59}
      placeholder="00"
      suffix={translate('common.minutes-abbreviated')}
      error={!!minuteError}
      hintText={minuteError}
      bind:value={
        () => spec.calendar.minute?.[0]?.start?.toString() ?? '', setMinute
      }
    />
  </div>
  <div class="flex gap-2 text-xs">
    <Icon name="clock" class="inline-block" />
    <p class="text-secondary">
      {translate('schedules.run-time-based-on-timezone', {
        timezoneName: $form.timezoneName,
      })}
    </p>
  </div>
</fieldset>
