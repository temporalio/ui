<script lang="ts">
  export let value: SelectOptionValue = null;
</script>

<option {value} class="border-0"><slot>{value}</slot></option>
