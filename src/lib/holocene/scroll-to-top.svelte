<script lang="ts">
  import Button, {
    type ButtonWithoutHrefProps,
  } from '$lib/holocene/button.svelte';

  interface Props extends ButtonWithoutHrefProps {
    hidden: boolean;
    onScrollToTopClick: () => void;
  }

  let { hidden, onScrollToTopClick, ...rest }: Props = $props();
</script>

<div class:invisible={hidden}>
  <Button
    size="xs"
    variant="primary"
    onclick={onScrollToTopClick}
    leadingIcon="arrow-up"
    {...rest}
  />
</div>
