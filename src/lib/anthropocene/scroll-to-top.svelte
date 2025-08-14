<script lang="ts">
  import Button from '$lib/anthropocene/button.svelte';

  export let hidden: boolean;
  export let onScrollToTopClick: () => void;
</script>

<div class:invisible={hidden}>
  <Button
    size="xs"
    variant="primary"
    onclick={onScrollToTopClick}
    leadingIcon="arrow-up"
    {...$$restProps}
  />
</div>
