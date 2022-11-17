<script lang="ts">
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  export let hour = '';
  export let minute = '';
  export let second = '';
  export let time = 'AM';
</script>

<div class="flex gap-2">
  <Input
    id="hour"
    bind:value={hour}
    placeholder="00"
    suffix="hrs"
    maxLength={2}
  />
  <Input
    id="minute"
    required
    bind:value={minute}
    placeholder="00"
    suffix="min"
    maxLength={2}
  />
  <Input
    id="second"
    bind:value={second}
    placeholder="00"
    suffix="sec"
    maxLength={2}
  />
  <ToggleButtons>
    <ToggleButton active={time === 'AM'} on:click={() => (time = 'AM')}
      >AM</ToggleButton
    >
    <ToggleButton active={time === 'PM'} on:click={() => (time = 'PM')}
      >PM</ToggleButton
    >
  </ToggleButtons>
</div>
