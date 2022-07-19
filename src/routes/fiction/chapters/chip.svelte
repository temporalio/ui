<script>
  import Chip from '$lib/holocene/chip.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter description="A chip">
  <Chip>lucille@temporal.io</Chip>
</Chapter>

<Chapter description="A warning chip">
  <Chip intent="warning">lucille@temporal.io</Chip>
</Chapter>
