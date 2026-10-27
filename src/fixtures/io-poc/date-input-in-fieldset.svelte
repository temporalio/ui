<script lang="ts">
  import { DateInput } from '$lib/io-poc/date-input';
  import { Fieldset } from '$lib/io-poc/fieldset';

  let { disabled = false }: { disabled?: boolean } = $props();
</script>

<Fieldset legend="Schedule" {disabled}>
  <DateInput label="Start date" />
</Fieldset>
