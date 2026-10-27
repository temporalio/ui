<script lang="ts">
  import { IconPin, IconPinSolid, IconStar, IconStarSolid } from '$lib/io/icon';
  import { Toggle } from '$lib/io-ark/toggle';

  let liveUpdates = $state(true);
  let pinned = $state(false);
  let starred = $state(true);
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-wrap items-center gap-3">
    <Toggle label="Live updates" bind:pressed={liveUpdates} />
    <p class="text-xs text-secondary">
      {liveUpdates ? 'Event history refreshes automatically' : 'Paused'}
    </p>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <Toggle
      aria-label="Pin workflow"
      Icon={IconPin}
      PressedIcon={IconPinSolid}
      bind:pressed={pinned}
    />
    <Toggle
      aria-label="Star namespace"
      Icon={IconStar}
      PressedIcon={IconStarSolid}
      bind:pressed={starred}
    />
    <Toggle label="Show child workflows" size="sm" />
    <Toggle label="Archived" disabled />
  </div>
</div>
