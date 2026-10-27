<script lang="ts">
  import { NumberInput } from '$lib/io-poc/number-input';

  let attempts = $state('5');
  let timeout = $state('30');
  let concurrency = $state('250');
  let backoff = $state('2');
</script>

<div class="grid gap-6 sm:grid-cols-2">
  <NumberInput
    label="Maximum attempts"
    helperText="Use 0 for unlimited attempts."
    bind:value={attempts}
    min={0}
    max={100}
  />
  <NumberInput
    label="Start-to-close timeout"
    unit="s"
    bind:value={timeout}
    min={1}
    max={3600}
    step={5}
  />
  <NumberInput
    label="Backoff coefficient"
    bind:value={backoff}
    min={1}
    max={10}
    step={0.5}
    formatOptions={{ minimumFractionDigits: 1 }}
  />
  <NumberInput
    label="Maximum concurrent activities"
    bind:value={concurrency}
    min={1}
    max={200}
    clampValueOnBlur={false}
    error={Number(concurrency) > 200
      ? 'Enter 200 or fewer concurrent activities.'
      : ''}
    required
  />
  <NumberInput
    label="Worker versioning rollout"
    value="100"
    unit="%"
    disabled
    helperText="Managed by the deployment."
  />
</div>
