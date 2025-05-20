<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import { createEventDispatcher } from 'svelte';

  export let id: string;
  export let value = '';
  export let options: string[] = [];
  export let placeholder = '';
  export let label = '';

  const dispatch = createEventDispatcher<{ select: string; change: string }>();

  let datalistId = `${id}-list`;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      const list = document.getElementById(datalistId) as HTMLDataListElement;
      if (list && list.options.length > 0) {
        event.preventDefault();
        value = list.options[0].value;
        dispatch('select', value);
      }
    }
  }

  function handleChange() {
    dispatch('change', value);
  }
</script>

<Input
  {id}
  {label}
  labelHidden
  bind:value
  placeholder={placeholder}
  list={datalistId}
  on:keydown={handleKeydown}
  on:change={handleChange}
/>
<datalist id={datalistId}>
  {#each options as option}
    <option value={option} />
  {/each}
</datalist>
