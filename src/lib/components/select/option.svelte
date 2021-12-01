<script lang="ts">
  export let value: string | boolean = null;
</script>

<option {value} class="border-0"><slot /></option>

<style lang="postcss">
  option {
    color: gray;
  }
</style>
