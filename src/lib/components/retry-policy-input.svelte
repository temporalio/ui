<script lang="ts">
  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  interface Props {
    initialInterval: string;
    backoffCoefficient: string;
    maximumInterval: string;
    maximumAttempts: string;
  }

  let {
    initialInterval = $bindable(),
    backoffCoefficient = $bindable(),
    maximumAttempts = $bindable(),
    maximumInterval = $bindable(),
  }: Props = $props();
</script>

<div class="space-y-2">
  <DurationInput
    label="Initial Interval"
    id="initial-interval-input"
    bind:value={initialInterval}
  />
  <Input
    type="number"
    label="Backoff Coefficient"
    id="backoff-coefficient-input"
    bind:value={backoffCoefficient}
  />
  <DurationInput
    label="Maximum Interval"
    id="maximum-interval-input"
    bind:value={maximumInterval}
  />
  <Input
    type="number"
    label="Maximum Attempts"
    id="maximum-attempts-input"
    bind:value={maximumAttempts}
  />
</div>
