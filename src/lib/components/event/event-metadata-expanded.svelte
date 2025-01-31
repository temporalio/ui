<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import type { Payload } from '$lib/types';

  import MetadataDecoder from './metadata-decoder.svelte';

  export let value: Payload;
</script>

<div class="flex {$$props.class}">
  <div class="content code-block-row">
    <div class="flex flex-col">
      <p class="text-sm">Summary</p>
      <MetadataDecoder {value} fallback="" let:decodedValue>
        {#if decodedValue}
          <Badge type="secondary" class="block select-none truncate">
            {decodedValue}
          </Badge>
        {/if}
      </MetadataDecoder>
    </div>
  </div>
</div>

<style lang="postcss">
  .content {
    @apply block w-full px-2 py-1 text-left;
  }

  .code-block-row {
    @apply block w-full select-all py-1 text-left;
  }

  .detail-row {
    @apply flex w-full items-center gap-2 py-1 text-left;
  }
</style>
