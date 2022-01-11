<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';
  import Icon from 'svelte-fa';
  import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

  export let poller;
</script>

<article
  class="w-full h-full flex flex-row border-b-2 last:border-b-0 no-underline p-2"
>
  <div class="links w-3/12 text-left">
    {poller.identity}
  </div>
  <div class="links w-3/12 text-left">
    <h3>
      <p>{formatDate(poller.lastAccessTime)}</p>
    </h3>
  </div>
  <div class="w-3/12 text-left">
    {#if poller.taskQueueTypes.includes('WORKFLOW')}
      <Icon icon={faCheck} color="blue" />
    {:else}
      <Icon icon={faTimes} color="black" />
    {/if}
  </div>
  <div class="w-3/12 text-left">
    {#if poller.taskQueueTypes.includes('ACTIVITY')}
      <Icon icon={faCheck} color="blue" />
    {:else}
      <Icon icon={faTimes} color="black" />
    {/if}
  </div>
</article>
