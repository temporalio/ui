<script lang="ts">
  import { fields } from '$lib/stores/schedules';

  import FancyFormInput from '$lib/holocene/forms/fancy-form-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  export let hour = '';
  export let minute = '';
  export let second = '';
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-2">
    <h3 class="text-base">Recurring Time</h3>
    <p>
      Specify the time interval for this schedule to run (for example every 5
      minutes).
    </p>
    <div class="flex flex-row items-center gap-2">
      <div class="w-24">
        <Input
          id="hour"
          bind:value={hour}
          placeholder="00"
          suffix="hrs"
          maxLength={2}
          error={parseInt(hour) > 60}
        />
      </div>
      <div>:</div>
      <div class="w-24">
        <Input
          id="minute"
          bind:value={minute}
          placeholder="00"
          suffix="min"
          maxLength={2}
          error={parseInt(minute) > 60}
        />
      </div>
      <div>:</div>
      <div class="w-24">
        <Input
          id="second"
          bind:value={second}
          placeholder="00"
          suffix="sec"
          maxLength={2}
          error={parseInt(second) > 60}
        />
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <h3 class="text-base">Offset</h3>
    <p>
      Specify the time to offset when this schedule will run (for example 15 min
      past the hour).
    </p>
    <div class="w-24">
      <FancyFormInput field={fields.phase} suffix="min" />
    </div>
  </div>
</div>
