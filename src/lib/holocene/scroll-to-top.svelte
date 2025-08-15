<script lang="ts">
  import Button from '$lib/anthropocene/button.svelte';

  export let hidden: boolean;
  export let onScrollToTopClick: () => void;
</script>

<div class:invisible={hidden}>
  <Button
    size="xs"
    variant="primary"
    on:click={onScrollToTopClick}
    leadingIcon="arrow-up"
    {...$$restProps}
  />
</div>
