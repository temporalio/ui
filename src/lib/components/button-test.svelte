<script>
  import { createEventDispatcher } from 'svelte';
  export let text = '';
  const dispatch = createEventDispatcher();
  function onClick(event) {
    dispatch('click', event);
  }
</script>

<button on:click={onClick}>
  {text}
</button>
