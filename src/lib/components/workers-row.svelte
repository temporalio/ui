<script lang="ts">
  import Icon from 'svelte-fa';
  import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
  export let poller;
</script>

<article class="row flex flex-row border-b-2">
  <div class="links w-3/12 text-left">
    {poller.identity}
  </div>
  <div class="links w-3/12 text-left">
    <h3>
      {new Date(poller.lastAccessTime)}
    </h3>
  </div>
  <div class="w-3/12 text-left">
    {#if poller.taskQueueTypes.includes('WORKFLOW')}
      <Icon icon={faCheck} color="blue" />
    {:else}
      <Icon icon={faTimes} color="black" />
    {/if}
  </div>
  <div class="w-2/12 text-left">
    {#if poller.taskQueueTypes.includes('ACTIVITY')}
      <Icon icon={faCheck} color="blue" />
    {:else}
      <Icon icon={faTimes} color="black" />
    {/if}
  </div>
</article>

<style lang="postcss">
  .row {
    @apply w-full h-full flex no-underline p-2;
  }
</style>
