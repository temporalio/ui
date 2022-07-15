<button class="icon-button {$$props.class}" on:click data-cy={$$props.dataCy}>
  <slot />
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-block focus:shadow-none focus:outline-none;
  }
</style>
