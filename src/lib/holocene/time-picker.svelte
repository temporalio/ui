<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Input from './input/input.svelte';

  const dispatch = createEventDispatcher();

  let value = '';

  const parseTime = (time: string) => {
    const parsed = time.split(':');
    return {
      hour: parsed[0] ?? '',
      minute: parsed[1] ?? '',
      second: parsed[2] ?? '',
    };
  };
  const onChange = (e: Event) => {
    const { value } = e.target as HTMLInputElement;
    const time = parseTime(value);
    dispatch('timechange', time);
  };
</script>

<div class="relative">
  <Input
    id="timepicker"
    icon="clock"
    type="time"
    on:input={onChange}
    placeholder="00:00:00"
    {value}
  />
</div>
