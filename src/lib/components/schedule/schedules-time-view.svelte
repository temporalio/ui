<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';

  export let hour = '';
  export let minute = '';

  $: {
    if (_hour) {
      if (_hour === '12') {
        hour = time === 'AM' ? '00' : '12';
      } else if (time === 'PM') {
        hour = (parseInt(_hour) + 12).toString();
      } else {
        hour = _hour;
      }
    } else {
      hour = '';
    }
  }

  let _hour = '';
  let time: 'AM' | 'PM' = 'AM';

  const error = (x: string, max: number) => {
    if (x) return isNaN(parseInt(x)) || parseInt(x) > max;
    return false;
  };
</script>

<div class="flex flex-col gap-4">
  <h3 class="text-lg font-medium">
    {translate('schedules.time-view-heading')}
  </h3>
  <p>
    {translate('schedules.time-view-description')}
  </p>
  <div class="flex flex-col items-center gap-2 lg:flex-row">
    <Input
      id="hour-time"
      class="w-24"
      label={translate('common.hour-abbreviated')}
      labelHidden
      bind:value={_hour}
      placeholder="00"
      suffix={translate('common.hour-abbreviated')}
      maxLength={2}
      hideCount
      error={error(_hour, 12)}
    />
    <div class="hidden lg:block">:</div>
    <Input
      id="minute-time"
      class="w-24"
      label={translate('common.minutes-abbreviated')}
      labelHidden
      bind:value={minute}
      placeholder="00"
      suffix={translate('common.minutes-abbreviated')}
      maxLength={2}
      hideCount
      error={error(minute, 59)}
    />
    <div class="ml-2">
      <ToggleButtons>
        <ToggleButton active={time === 'AM'} on:click={() => (time = 'AM')}
          >{translate('common.ante-meridiem')}</ToggleButton
        >
        <ToggleButton active={time === 'PM'} on:click={() => (time = 'PM')}
          >{translate('common.post-meridiem')}</ToggleButton
        >
      </ToggleButtons>
    </div>
  </div>
  <div class="flex w-full flex-row items-center gap-2">
    <Icon name="clock" aria-hidden="true" />
    <span class="text-xs font-normal text-gray-500"
      >{translate('common.based-on-time-preface')} Universal Standard Time (UTC)
    </span>
  </div>
</div>
