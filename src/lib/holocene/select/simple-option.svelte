<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { SelectOptionValue } from '$lib/types/global';

  interface Props {
    value?: SelectOptionValue;
    class?: string;
    children?: Snippet;
  }

  let { value = null, class: className = '', children }: Props = $props();
</script>

<option {value} class="border-0 {className}">
  {#if children}
    {@render children()}
  {:else}
    {value}
  {/if}
</option>
