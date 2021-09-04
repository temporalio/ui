<script lang="ts">
  import beautify from 'json-beautify';
  import type { PendingActivityInfo } from '$types';
  import { formatDate } from '$lib/utilities/format-date';

  export let activity: PendingActivityInfo;
</script>

<article class="border-2 p-2">
  <h4>
    {activity.activityType.name}
    <code>#{activity.activityId}</code>
  </h4>
  <section>
    <div class="row">
      <div class="key">State</div>
      <div class="value">{activity.state}</div>
    </div>
    <div class="row">
      <div class="key">Heartbeat Detaults</div>
      <div class="value">{activity.heartbeatDetails}</div>
    </div>
    <div class="row">
      <div class="key">Last Heartbeat Time</div>
      <div class="value">{formatDate(activity.lastHeartbeatTime)}</div>
    </div>
    <div class="row">
      <div class="key">Last Started Time</div>
      <div class="value">{formatDate(activity.lastStartedTime)}</div>
    </div>
    <div class="row">
      <div class="key">Attempt</div>
      <div class="value">{activity.attempt}</div>
    </div>
    <div class="row">
      <div class="key">Maximum Attempts</div>
      <div class="value">{activity.maximumAttempts}</div>
    </div>
    <div class="row">
      <div class="key">Scheduled Time</div>
      <div class="value">{formatDate(activity.scheduledTime)}</div>
    </div>
    <div class="row">
      <div class="key">Expiration Time</div>
      <div class="value">{formatDate(activity.expirationTime)}</div>
    </div>
    <div class="row">
      <div class="key">Last Failure</div>
      <div class="value overflow-y-scroll whitespace-pre font-mono">
        {beautify(activity.lastFailure, null, 2, 80)}
      </div>
    </div>
    <div class="row">
      <div class="key">Last Worker Identity</div>
      <div class="value">{activity.lastWorkerIdentity}</div>
    </div>
  </section>
</article>

<style lang="postcss">
  h4 {
    @apply mb-4 font-semibold;
  }

  .row {
    @apply flex p-4;
  }

  .key,
  .value {
    @apply w-full;
  }

  .key {
    @apply font-semibold max-w-sm;
  }

  .row:nth-child(even) {
    @apply bg-gray-100;
  }
</style>
