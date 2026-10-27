<script lang="ts">
  import { Field, FieldInput } from '$lib/io-ark/field';
  import { Fieldset } from '$lib/io-ark/fieldset';

  let initialInterval = $state('1');
  let maximumInterval = $state('100');
  let maximumAttempts = $state('5');

  const intervalError = $derived(
    Number(maximumInterval) < Number(initialInterval)
      ? 'Maximum interval must be at least the initial interval.'
      : '',
  );
</script>

<div class="grid gap-8 md:grid-cols-2">
  <Fieldset
    legend="Retry policy"
    helperText="Applies to every activity in this workflow."
    error={intervalError}
  >
    <Field label="Initial interval (seconds)">
      <FieldInput type="number" min="0" bind:value={initialInterval} />
    </Field>
    <Field label="Maximum interval (seconds)">
      <FieldInput type="number" min="0" bind:value={maximumInterval} />
    </Field>
    <Field label="Maximum attempts" helperText="Use 0 for unlimited attempts.">
      <FieldInput type="number" min="0" bind:value={maximumAttempts} />
    </Field>
  </Fieldset>
  <Fieldset
    legend="Archival"
    helperText="Archival settings are managed by your account owner."
    disabled
  >
    <Field label="History URI">
      <FieldInput value="s3://temporal-archive/history" />
    </Field>
    <Field label="Visibility URI">
      <FieldInput value="s3://temporal-archive/visibility" />
    </Field>
  </Fieldset>
</div>
