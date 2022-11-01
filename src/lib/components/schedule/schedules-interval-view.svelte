<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import SimpleSplitButton from '$lib/holocene/simple-split-button.svelte';

  export let days = '';
  export let hour = '';
  export let minute = '';
  export let second = '';
  export let phase = '';

  let offset = '';
  let offsetUnit = 'min';

  const error = (x: string) => {
    if (x) return isNaN(parseInt(x));
    return false;
  };

  $: {
    if (offset) {
      if (offsetUnit === 'days') {
        phase = (parseInt(offset) * 60 * 60 * 24).toString() + 's';
        console.log('Phase: ', phase);
      } else if (offsetUnit === 'hrs') {
        phase = (parseInt(offset) * 60 * 60).toString() + 's';
      } else if (offsetUnit === 'min') {
        phase = (parseInt(offset) * 60).toString() + 's';
      } else if (offsetUnit === 'sec') {
        phase = parseInt(offset).toString() + 's';
      }
    }
  }

  const onPhaseClick = (unit: string) => {
    offsetUnit = unit;
  };
</script>

<div class="my-4 flex flex-col gap-4">
  <h3 class="text-base">Recurring Time</h3>
  <p>
    Specify the time interval for this schedule to run (for example every 5
    minutes).
  </p>
  <div class="flex flex-row items-center gap-2">
    <div class="w-24">
      <Input
        id="hour"
        bind:value={days}
        placeholder="00"
        suffix="days"
        maxLength={3}
        error={error(days)}
      />
    </div>
    <div>:</div>
    <div class="w-24">
      <Input
        id="hour"
        bind:value={hour}
        placeholder="00"
        suffix="hrs"
        maxLength={2}
        error={error(hour)}
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
        error={error(minute)}
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
        error={error(second)}
      />
    </div>
  </div>
  <h3 class="mt-4 text-base">Offset</h3>
  <p>
    Specify the time to offset when this schedule will run (for example 15 min
    past the hour).
  </p>
  <div class="flex w-40 gap-0">
    <Input
      id="phase"
      bind:value={offset}
      placeholder="00"
      error={error(phase)}
      unroundRight
      class="h-10"
    />
    <SimpleSplitButton
      class="rounded-tr rounded-br bg-offWhite"
      buttonClass="border border-gray-900 border-l-0"
      id="phase"
      label={offsetUnit}
      position="right"
    >
      <div class="flex flex-col gap-4 p-4">
        <button on:click={() => onPhaseClick('days')} class="days-label"
          >days</button
        >
        <button on:click={() => onPhaseClick('hrs')} class="hrs-label"
          >hrs</button
        >
        <button on:click={() => onPhaseClick('min')} class="min-label"
          >min</button
        >
        <button on:click={() => onPhaseClick('sec')} class="sec-label"
          >sec</button
        >
      </div>
    </SimpleSplitButton>
  </div>
</div>
