<script lang="ts">
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
</script>

<article class="row">
  <div class="cell">
    <p />
  </div>
  <div class="cell w-1/2">
    <p>Loading</p>
  </div>
  <div class="cell">
    <p />
  </div>
  <div class="cell">
    <p />
  </div>
  <span class=" md:hidden"> - </span>
  <div class="cell">
    <p />
  </div>
</article>

<style lang="postcss">
  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
  }

  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
