<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';

  export let hour = '';
  export let minute = '';
  export let second = '';
  export let time = 'AM';
</script>

<div class="flex gap-2">
  <Input
    id="hour"
    label={translate('common.hours-abbreviated')}
    labelHidden
    bind:value={hour}
    placeholder="00"
    suffix={translate('common.hours-abbreviated')}
    maxLength={2}
  />
  <Input
    id="minute"
    label={translate('common.minutes-abbreviated')}
    labelHidden
    required
    bind:value={minute}
    placeholder="00"
    suffix={translate('common.minutes-abbreviated')}
    maxLength={2}
  />
  <Input
    id="second"
    label={translate('common.seconds-abbreviated')}
    labelHidden
    bind:value={second}
    placeholder="00"
    suffix={translate('common.hours-abbreviated')}
    maxLength={2}
  />
  <ToggleButtons>
    <ToggleButton active={time === 'AM'} onclick={() => (time = 'AM')}
      >{translate('common.ante-meridiem')}</ToggleButton
    >
    <ToggleButton active={time === 'PM'} onclick={() => (time = 'PM')}
      >{translate('common.post-meridiem')}</ToggleButton
    >
  </ToggleButtons>
</div>
