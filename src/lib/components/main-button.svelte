<script lang="ts">
  //Styles passed along to custom Button Component
  export let styles: string = '';
  export let disabled: boolean = false;
  //Boolean to state if button is active or not
  export let active: boolean = false;
</script>

<button on:click class={styles} {disabled} class:active
  ><slot /></button
>

<style lang="postcss">
  button {
    @apply text-purple-700 border-purple-400 border-2 rounded-md bg-white;
  }

  button:hover {
    @apply bg-purple-100;
  }

  button:disabled {
    @apply text-purple-400 border-purple-400;
  }

  button:active {
    @apply text-purple-100 bg-purple-500;
  }
</style>
