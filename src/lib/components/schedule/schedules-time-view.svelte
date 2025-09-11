<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  export let hour = '';
  export let minute = '';
  export let timezoneName: string;
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <h3>
      {translate('schedules.time-view-heading')}
    </h3>
    <p class="text-secondary">
      {translate('schedules.time-view-description')}
    </p>

    <div class="flex w-fit flex-col gap-2">
      <TimePicker
        bind:hour
        bind:minute
        twelveHourClock={false}
        includeSeconds={false}
      />
      <Input
        placeholder="UTC"
        id="timezone-name"
        bind:value={timezoneName}
        label={translate('common.timezone', { timezone: '' })}
        labelHidden
        suffix={translate('common.timezone', { timezone: '' })}
      />
    </div>
  </div>

  <div class="flex w-full flex-row items-center gap-2">
    <Icon name="clock" aria-hidden="true" />
    <span class="text-xs text-secondary"
      >{translate('schedules.iana-timezones-link-preface')}
      <Link newTab href="https://www.iana.org/time-zones"
        >{translate('schedules.iana-timezones-link')}</Link
      >
    </span>
  </div>
</div>
