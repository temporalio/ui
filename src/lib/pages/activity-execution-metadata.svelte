<script lang="ts">
  import UserMetadata from '$lib/components/user-metadata.svelte';
  import { activityExecution } from '$lib/utilities/activity-execution-poller.svelte';
</script>

<UserMetadata userMetadata={$activityExecution.info.userMetadata} />
