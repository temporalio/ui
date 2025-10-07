<script lang="ts">
  import type { Snippet } from 'svelte';

  import { viewDataEncoderSettings } from '$lib/components/data-encoder-settings.svelte';

  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();
</script>

<div
  class="absolute bottom-0 left-0 right-0 {$viewDataEncoderSettings
    ? 'top-[540px]'
    : 'top-0'}
flex h-full flex-col"
>
  {@render children()}
</div>
