<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';

  export let hour = '';
  export let minute = '';
  export let second = '';
  export let phase = '';

  const error = (x: string) => {
    if (x) return isNaN(parseInt(x)) || parseInt(x) > 60;
    return false;
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
  <div class="w-24">
    <Input
      id="phase"
      bind:value={phase}
      placeholder="00"
      suffix="phase"
      maxLength={2}
      error={error(phase)}
    />
  </div>
</div>
