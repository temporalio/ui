<script lang="ts">
  import type { Snippet } from 'svelte';
  import Error from './error.svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:boundary>
  {#if children}{@render children()}{/if}
  {#snippet failed(error, reset)}
    <Error {reset} {error} />
  {/snippet}
</svelte:boundary>
