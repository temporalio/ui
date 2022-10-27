<script lang="ts">
  import { fields } from '$lib/stores/schedules';

  import FormInput from '$lib/holocene/forms/form-input.svelte';
</script>

<div class="flex flex-col gap-2">
  <p class="text-base">Start Time</p>
  <p>
    Specify the start time for this schedule to run. By default, the schedule
    will run at 12:00am UTC if left blank.
  </p>
  <div class="flex flex-row items-center gap-2">
    <div class="w-10">
      <FormInput field={fields.hour} hideLabel />
    </div>
    <div class="w-10">
      <FormInput field={fields.minute} hideLabel />
    </div>
    <div class="w-10">
      <FormInput field={fields.second} hideLabel />
    </div>
  </div>
</div>
