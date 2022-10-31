<script lang="ts">
  import { fields } from '$lib/stores/schedules';

  import FancyFormInput from '$lib/holocene/forms/fancy-form-input.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';

  let time: 'AM' | 'PM' = 'AM';
</script>

<div class="flex flex-col gap-2">
  <h3 class="text-base">Time</h3>
  <p>
    Specify the time for this schedule to run. By default, the schedule will run
    at 12:00am UTC if left blank.
  </p>
  <div class="flex flex-row items-center gap-2">
    <div class="w-24">
      <FancyFormInput field={fields.hour} suffix="hr" />
    </div>
    <div>:</div>
    <div class="w-24">
      <FancyFormInput field={fields.minute} suffix="min" />
    </div>
    <div>
      <ToggleButtons>
        <ToggleButton active={time === 'AM'} on:click={() => (time = 'AM')}
          >AM</ToggleButton
        >
        <ToggleButton active={time === 'PM'} on:click={() => (time = 'PM')}
          >PM</ToggleButton
        >
      </ToggleButtons>
    </div>
  </div>
</div>
