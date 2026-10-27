<script lang="ts">
  import { DateInput } from '$lib/io-ark/date-input';
  import { Fieldset } from '$lib/io-ark/fieldset';

  let { disabled = false }: { disabled?: boolean } = $props();
</script>

<Fieldset legend="Schedule" {disabled}>
  <DateInput label="Start date" />
</Fieldset>
