<div class="row">
  <div class="cell md:table-cell">
    <p />
  </div>
  <div class="cell w-1/2 md:table-cell">
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
</div>

<style lang="postcss">
  .row {
    @apply items-center border-b-2 p-2 text-sm no-underline last-of-type:border-b-0 md:table-row md:text-base;
  }

  .cell {
    @apply p-2 text-left md:border-b-2;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
