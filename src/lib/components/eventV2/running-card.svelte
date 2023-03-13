<script lang="ts">
  import EventGroupTimestamp from './event-group-timestamp.svelte';
</script>

<div class="flex gap-2">
  <EventGroupTimestamp event={undefined} last />
  <div class="h-full grow pt-8 text-gray-500">
    <p>Running...</p>
  </div>
</div>
