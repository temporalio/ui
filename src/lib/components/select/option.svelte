<script lang="ts">
  export let value: string | boolean = '';
</script>

<option {value} class="border-0"><slot /></option>
