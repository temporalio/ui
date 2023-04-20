<script lang="ts">
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import Input from '$lib/holocene/input/input.svelte';

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
  <h3 class="text-lg font-medium">Time</h3>
  <p>
    Specify the time (UTC) for this schedule to run. By default, the schedule
    will run at 12:00am UTC if left blank.
  </p>
  <div class="flex flex-row items-center gap-2">
    <div class="w-24">
      <Input
        id="hour"
        bind:value={_hour}
        placeholder="00"
        suffix="hrs"
        maxLength={2}
        error={error(_hour, 12)}
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
        error={error(minute, 59)}
      />
    </div>
    <div class="ml-2">
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
