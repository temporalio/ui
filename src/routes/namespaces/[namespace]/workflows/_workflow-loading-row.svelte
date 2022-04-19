<article class="row">
  <div class="cell md:table-cell">
    <p />
  </div>
  <div class="cell md:table-cell w-1/2">
    <p>Loading</p>
  </div>
  <div class="cell md:table-cell">
    <p />
  </div>
  <div class="cell inline-block md:hidden xl:table-cell">
    <p />
  </div>
  <div class="cell inline-block md:hidden xl:table-cell">
    <p />
  </div>
</article>

<style lang="postcss">
  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
  }

  .cell {
    @apply md:border-b-2 text-left p-2;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
