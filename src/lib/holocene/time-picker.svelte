<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';

  export let hour = '';
  export let minute = '';
  export let second = '';
  export let half: 'AM' | 'PM' = 'AM';
</script>

<div class="flex gap-2">
  <Input
    id="hour"
    bind:value={hour}
    placeholder="00"
    suffix="hrs"
    maxLength={2}
    error={Boolean(parseInt(hour) > 12)}
  />
  <Input
    id="minute"
    required
    bind:value={minute}
    placeholder="00"
    suffix="min"
    maxLength={2}
    error={Boolean(parseInt(hour) > 59)}
  />
  <Input
    id="second"
    bind:value={second}
    placeholder="00"
    suffix="sec"
    maxLength={2}
    error={Boolean(parseInt(hour) > 59)}
  />
  <ToggleButtons>
    <ToggleButton active={half === 'AM'} on:click={() => (half = 'AM')}
      >AM</ToggleButton
    >
    <ToggleButton active={half === 'PM'} on:click={() => (half = 'PM')}
      >PM</ToggleButton
    >
  </ToggleButtons>
</div>
