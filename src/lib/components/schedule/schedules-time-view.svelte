<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  export let hour = '';
  export let minute = '';
  export let timezoneName: string;

  $: timezoneHint =
    timezoneName.toLowerCase() === 'utc'
      ? 'Universal Standard Time (UTC)'
      : timezoneName;
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <h3>
      {translate('schedules.time-view-heading')}
    </h3>
    <p class="text-secondary">
      {translate('schedules.time-view-description', { timezoneName })}
    </p>

    <TimePicker
      bind:hour
      bind:minute
      twelveHourClock={false}
      includeSeconds={false}
    />
  </div>

  <div class="flex w-full flex-row items-center gap-2">
    <Icon name="clock" aria-hidden="true" />
    <span class="text-xs font-normal text-slate-500"
      >{translate('common.based-on-time-preface')} {timezoneHint}
    </span>
  </div>
</div>
