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
      variant="primary"
      on:click={onScrollToTopClick}
      leadingIcon="arrow-up"
    />
  </div>
</div>

<style lang="postcss">
  .back-to-top {
    @apply invisible bottom-5 right-8 z-50 md:fixed;
  }

  .back-to-top.hidden {
    @apply invisible;
  }
</style>
