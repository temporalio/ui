<script lang="ts">
  export let value: SelectOptionValue = null;
</script>

<option {value} class="border-0 {$$props.class}"><slot>{value}</slot></option>
