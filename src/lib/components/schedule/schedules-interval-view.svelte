<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';

  import type { ScheduleOffsetUnit } from '$lib/types/schedule';

  export let days = '';
  export let hour = '';
  export let minute = '';
  export let second = '';
  export let phase = '';

  let offset = '';
  let offsetUnit: ScheduleOffsetUnit = 'min';

  const error = (x: string) => {
    if (x) return isNaN(parseInt(x));
    return false;
  };

  $: {
    if (offset) {
      if (offsetUnit === 'days') {
        phase = (parseInt(offset) * 60 * 60 * 24).toString() + 's';
      } else if (offsetUnit === 'hrs') {
        phase = (parseInt(offset) * 60 * 60).toString() + 's';
      } else if (offsetUnit === 'min') {
        phase = (parseInt(offset) * 60).toString() + 's';
      } else if (offsetUnit === 'sec') {
        phase = parseInt(offset).toString() + 's';
      }
    }
  }

  const onPhaseClick = (unit: ScheduleOffsetUnit) => {
    offsetUnit = unit;
  };
</script>

<div class="my-2 flex flex-col gap-4">
  <h3 class="text-lg font-medium">Recurring Time</h3>
  <p>
    Specify the time interval for this schedule to run (for example every 5
    minutes).
  </p>
  <div class="flex flex-row items-center gap-2">
    <div class="w-24">
      <Input
        id="days"
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
  <h3 class="mt-4 text-lg font-medium">Offset</h3>
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
    <MenuContainer>
      <MenuButton
        hasIndicator
        id="phase"
        controls="phase-menu"
        class="rounded-r bg-offWhite border border-primary border-l-0 h-10 w-16 px-2"
      >
        {offsetUnit}
      </MenuButton>
      <Menu id="phase-menu">
        <MenuItem on:click={() => onPhaseClick('days')}>days</MenuItem>
        <MenuItem on:click={() => onPhaseClick('hrs')}>hrs</MenuItem>
        <MenuItem on:click={() => onPhaseClick('min')}>min</MenuItem>
        <MenuItem on:click={() => onPhaseClick('sec')}>sec</MenuItem>
      </Menu>
    </MenuContainer>
  </div>
</div>
