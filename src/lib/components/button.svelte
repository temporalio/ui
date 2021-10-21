<script lang="ts">
  export let styles: string = '';
  export let disabled: boolean = false;
</script>

<button class={styles} {disabled}><slot /></button>

<style lang="postcss">
  button {
    @apply text-purple-700 border-purple-400 border-2 rounded-md;
  }

  button:hover {
    @apply bg-purple-100;
  }

  button:disabled {
    @apply text-purple-400 border-purple-400;
  }
</style>
