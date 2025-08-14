<script lang="ts">
  import type { SelectOptionValue } from '$lib/types/global';

  export let value: SelectOptionValue = null;
</script>

<option {value} class="border-0 {$$props.class}"><slot>{value}</slot></option>
