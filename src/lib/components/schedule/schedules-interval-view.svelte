<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ScheduleOffsetUnit } from '$lib/types/schedule';

  export let days = '';
  export let hour = '';
  export let minute = '';
  export let second = '';
  export let phase = '';

  let offset = '';
  let offsetUnit: ScheduleOffsetUnit = 'min';

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
    {translate('schedules.interval-view-heading')}
  </h3>
  <p>
    {translate('schedules.interval-view-description')}
  </p>
  <div class="flex flex-col items-center gap-2 lg:flex-row">
    <Input
      id="days"
      label={translate('common.days')}
      labelHidden
      bind:value={days}
      placeholder="00"
      suffix={translate('common.days')}
      maxLength={3}
      error={error(days)}
    />
    <div class="hidden lg:block">:</div>
    <Input
      id="hour-interval"
      label={translate('common.hours-abbreviated')}
      labelHidden
      bind:value={hour}
      placeholder="00"
      suffix={translate('common.hours-abbreviated')}
      maxLength={2}
      error={error(hour)}
    />
    <div class="hidden lg:block">:</div>
    <Input
      id="minute-interval"
      label={translate('common.minutes-abbreviated')}
      labelHidden
      bind:value={minute}
      placeholder="00"
      suffix={translate('common.minutes-abbreviated')}
      maxLength={2}
      error={error(minute)}
    />
    <div class="hidden lg:block">:</div>
    <Input
      id="second"
      label={translate('common.seconds-abbreviated')}
      labelHidden
      bind:value={second}
      placeholder="00"
      suffix={translate('common.seconds-abbreviated')}
      maxLength={2}
      error={error(second)}
    />
  </div>
  <h3 class="mt-4 text-lg font-medium">
    {translate('schedules.offset-heading')}
  </h3>
  <p>
    {translate('schedules.offset-description')}
  </p>
  <div class="flex w-48 gap-0">
    <Input
      id="phase"
      label={translate('schedules.offset-heading')}
      labelHidden
      bind:value={offset}
      placeholder="00"
      error={error(phase)}
      unroundRight
    />
    <Select
      label={translate('schedules.offset-unit')}
      labelHidden
      unroundLeft
      id="phase-unit"
      bind:value={offsetUnit}
    >
      <Option value="days">{translate('common.days')}</Option>
      <Option value="hrs">{translate('common.hours-abbreviated')}</Option>
      <Option value="min">{translate('common.minutes-abbreviated')}</Option>
      <Option value="sec">{translate('common.seconds-abbreviated')}</Option>
    </Select>
  </div>
</div>
