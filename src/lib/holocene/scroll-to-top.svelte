<script lang="ts">
  import Button from '$lib/holocene/button.svelte';

  export let hidden = true;
  export let onScrollToTopClick: () => void;
</script>

<div id="scroll-container" class={$$props.class}>
  <slot />
  <div class="back-to-top" class:hidden>
    <Button
      size="sm"
      variant="secondary"
      on:click={onScrollToTopClick}
      leadingIcon="arrow-up"
    />
  </div>
</div>

<style lang="postcss">
  .back-to-top {
    @apply fixed right-8 bottom-5 z-50;
  }

  .back-to-top.hidden {
    @apply invisible;
  }
</style>
