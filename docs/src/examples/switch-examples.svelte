<script lang="ts">
  import { Switch } from '$lib/io-poc/switch';

  let paused = $state(false);
  let autoRefresh = $state(true);
  let showChildren = $state(true);
  let deleteProtection = $state(false);
</script>

<div class="flex flex-col gap-5">
  <Switch
    label="Pause schedule"
    helperText={paused
      ? 'No new workflows will start until you resume the schedule.'
      : 'New workflows start every 15 minutes.'}
    bind:checked={paused}
  />
  <Switch label="Auto-refresh event history" bind:checked={autoRefresh} />
  <Switch label="Show child workflows" size="sm" bind:checked={showChildren} />
  <Switch
    label="Deletion protection"
    helperText="Your role cannot change this setting."
    bind:checked={deleteProtection}
    disabled
  />
</div>
