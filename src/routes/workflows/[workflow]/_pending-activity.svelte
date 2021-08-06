<script lang="ts">
  import type { PendingActivityInfo } from '$types/temporal/api/workflow/v1/message';

  export let activity: PendingActivityInfo;
</script>

<article class="border-2 p-2">
  <h4>
    {activity.activityType.name}
    <code>#{activity.activityId}</code>
  </h4>
  <table>
    <tbody>
      <tr>
        <td><code>state</code></td>
        <td>{activity.state}</td>
      </tr>
      <tr>
        <td><code>heartbeatDetails</code></td>
        <td>{activity.heartbeatDetails}</td>
      </tr>
      <tr>
        <td><code>lastHeartbeatTime</code></td>
        <td>{activity.lastHeartbeatTime}</td>
      </tr>
      <tr>
        <td><code>lastStartedTime</code></td>
        <td>{activity.lastStartedTime}</td>
      </tr>
      <tr>
        <td><code>attempt</code></td>
        <td>{activity.attempt}</td>
      </tr>
      <tr>
        <td><code>maximumAttempts</code></td>
        <td>{activity.maximumAttempts}</td>
      </tr>
      <tr>
        <td><code>scheduledTime</code></td>
        <td>{activity.scheduledTime}</td>
      </tr>
      <tr>
        <td><code>expirationTime</code></td>
        <td>{activity.expirationTime}</td>
      </tr>
      <tr>
        <td><code>lastWorkerIdentity</code></td>
        <td>{activity.lastWorkerIdentity}</td>
      </tr>
    </tbody>
  </table>
</article>

<style lang="postcss">
  h4 {
    @apply mb-4 font-semibold;
  }

  table {
    @apply w-full text-sm;
  }

  td {
    @apply p-2;
  }

  tr {
    @apply bg-gray-50;
  }

  tr:nth-child(even) {
    @apply bg-gray-100;
  }
</style>
