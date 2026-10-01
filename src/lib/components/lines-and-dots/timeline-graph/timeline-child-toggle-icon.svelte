<script lang="ts">
  import { IconTemporalChildWorkflow } from '$lib/io/icon';

  type Props = {
    expanded: boolean;
  };

  let { expanded }: Props = $props();
</script>

<span class="relative inline-flex h-3.5 w-3.5" aria-hidden="true">
  <IconTemporalChildWorkflow class="h-3.5 w-3.5" />
  <span
    class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-current bg-surface-primary"
  >
    <span
      class="absolute left-1/2 top-1/2 h-px w-1 -translate-x-1/2 -translate-y-1/2 bg-current"
    ></span>
    {#if !expanded}
      <span
        class="absolute left-1/2 top-1/2 h-1 w-px -translate-x-1/2 -translate-y-1/2 bg-current"
      ></span>
    {/if}
  </span>
</span>
