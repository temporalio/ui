<script lang="ts">
  import { viewDataEncoderSettings } from '$lib/components/data-encoder-settings.svelte';
</script>

<div
  class="absolute bottom-0 left-0 right-0 {$viewDataEncoderSettings
    ? 'top-[540px]'
    : 'top-0'}
flex h-full flex-col"
>
  <slot />
</div>
