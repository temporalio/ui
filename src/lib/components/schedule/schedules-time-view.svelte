<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  export let hour = '';
  export let minute = '';
</script>

<div class="flex flex-col gap-4">
  <h3>
    {translate('schedules.time-view-heading')}
  </h3>
  <p>
    {translate('schedules.time-view-description')}
  </p>

  <TimePicker
    bind:hour
    bind:minute
    twelveHourClock={false}
    includeSeconds={false}
  />

  <div class="flex w-full flex-row items-center gap-2">
    <Icon name="clock" aria-hidden="true" />
    <span class="text-xs font-normal text-slate-500"
      >{translate('common.based-on-time-preface')} Universal Standard Time (UTC)
    </span>
  </div>
</div>
