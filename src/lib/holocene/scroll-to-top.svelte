<script lang="ts">
  import Button from '$lib/holocene/button.svelte';

  export let hidden: boolean;
  export let onScrollToTopClick: () => void;
</script>

<div class:invisible={hidden}>
  <Button
    size="sm"
    variant="primary"
    on:click={onScrollToTopClick}
    leadingIcon="arrow-up"
  />
</div>
