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
    label={translate('hours-abbreviated')}
    labelHidden
    bind:value={hour}
    placeholder="00"
    suffix={translate('hours-abbreviated')}
    maxLength={2}
  />
  <Input
    id="minute"
    label={translate('minutes-abbreviated')}
    labelHidden
    required
    bind:value={minute}
    placeholder="00"
    suffix={translate('minutes-abbreviated')}
    maxLength={2}
  />
  <Input
    id="second"
    label={translate('seconds-abbreviated')}
    labelHidden
    bind:value={second}
    placeholder="00"
    suffix={translate('hours-abbreviated')}
    maxLength={2}
  />
  <ToggleButtons>
    <ToggleButton active={time === 'AM'} on:click={() => (time = 'AM')}
      >{translate('ante-meridiem')}</ToggleButton
    >
    <ToggleButton active={time === 'PM'} on:click={() => (time = 'PM')}
      >{translate('post-meridiem')}</ToggleButton
    >
  </ToggleButtons>
</div>
