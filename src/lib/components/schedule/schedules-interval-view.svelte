<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { createTranslate, translate } from '$lib/i18n/translate';
  import type { ScheduleOffsetUnit } from '$lib/types/schedule';

  export let days = '';
  export let hour = '';
  export let minute = '';
  export let second = '';
  export let phase = '';

  let offset = '';
  let offsetUnit: ScheduleOffsetUnit = 'min';
  const t = createTranslate('schedules');
  const error = (x: string) => {
    if (x) return isNaN(parseInt(x));
    return false;
  };

  $: {
    if (offset) {
      if (offsetUnit === 'days') {
        phase = (parseInt(offset) * 60 * 60 * 24).toString() + 's';
      } else if (offsetUnit === 'hrs') {
        phase = (parseInt(offset) * 60 * 60).toString() + 's';
      } else if (offsetUnit === 'min') {
        phase = (parseInt(offset) * 60).toString() + 's';
      } else if (offsetUnit === 'sec') {
        phase = parseInt(offset).toString() + 's';
      }
    }
  }
</script>

<div class="my-2 flex flex-col gap-4">
  <h3 class="text-lg font-medium">
    {t('interval-view-heading')}
  </h3>
  <p>
    {t('interval-view-description')}
  </p>
  <div class="flex flex-row items-center gap-2">
    <div class="w-24">
      <Input
        id="days"
        label={translate('days')}
        labelHidden
        bind:value={days}
        placeholder="00"
        suffix={translate('days')}
        maxLength={3}
        error={error(days)}
      />
    </div>
    <div>:</div>
    <div class="w-24">
      <Input
        id="hour-interval"
        label={translate('hours-abbreviated')}
        labelHidden
        bind:value={hour}
        placeholder="00"
        suffix={translate('hours-abbreviated')}
        maxLength={2}
        error={error(hour)}
      />
    </div>
    <div>:</div>
    <div class="w-24">
      <Input
        id="minute-interval"
        label={translate('minutes-abbreviated')}
        labelHidden
        bind:value={minute}
        placeholder="00"
        suffix={translate('minutes-abbreviated')}
        maxLength={2}
        error={error(minute)}
      />
    </div>
    <div>:</div>
    <div class="w-24">
      <Input
        id="second"
        label={translate('seconds-abbreviated')}
        labelHidden
        bind:value={second}
        placeholder="00"
        suffix={translate('seconds-abbreviated')}
        maxLength={2}
        error={error(second)}
      />
    </div>
  </div>
  <h3 class="mt-4 text-lg font-medium">
    {t('offset-heading')}
  </h3>
  <p>
    {t('offset-description')}
  </p>
  <div class="flex w-48 gap-0">
    <Input
      id="phase"
      label={t('offset-heading')}
      labelHidden
      bind:value={offset}
      placeholder="00"
      error={error(phase)}
      unroundRight
    />
    <Select
      label={t('offset-unit')}
      labelHidden
      unroundLeft
      id="phase-unit"
      bind:value={offsetUnit}
    >
      <Option value="days">{translate('days')}</Option>
      <Option value="hrs">{translate('hours-abbreviated')}</Option>
      <Option value="min">{translate('minutes-abbreviated')}</Option>
      <Option value="sec">{translate('seconds-abbreviated')}</Option>
    </Select>
  </div>
</div>
