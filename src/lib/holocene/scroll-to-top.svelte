<script lang="ts">
  import Button from '$lib/holocene/button.svelte';

  export let hidden = true;
  export let onScrollToTopClick: () => void;
</script>

<div id="scroll-container" class={$$props.class}>
  <slot />
  <div class="back-to-top" class:hidden>
    <Button
      class="!py-1.5 !px-1"
      icon="arrow-up"
      variant="secondary"
      on:click={onScrollToTopClick}
    />
  </div>
</div>

<style lang="postcss">
  .back-to-top {
    @apply fixed right-5 bottom-5 z-50;
  }

  .back-to-top.hidden {
    @apply invisible;
  }
</style>
