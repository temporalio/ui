<tr class={$$props.class}>
  <slot />
</tr>

<style lang="postcss">
  tr {
    :global(th) {
      @apply flex items-center;
    }
  }
</style>
