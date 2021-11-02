<script lang="ts">
  //Styles passed along to custom Button Component
  export let styles: string = '';
  export let disabled: boolean = false;
  //Boolean to state if button is active or not
  export let active: boolean = false;
</script>

<button on:click {disabled} class:active><slot /></button>

<style lang="postcss">
</style>
