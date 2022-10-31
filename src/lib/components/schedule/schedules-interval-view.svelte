<script lang="ts">
  import { fields } from '$lib/stores/schedules';

  import FancyFormInput from '$lib/holocene/forms/fancy-form-input.svelte';
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
        <FancyFormInput field={fields.hour} suffix="hrs" />
      </div>
      <div>:</div>
      <div class="w-24">
        <FancyFormInput field={fields.minute} suffix="min" />
      </div>
      <div>:</div>
      <div class="w-24">
        <FancyFormInput field={fields.second} suffix="sec" />
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
