<script lang="ts">
  import type { CommonError } from '$lib/types/common-errors';

  import CommonErrorItem from './common-error.svelte';
  interface Props {
    errors: CommonError[];
    class?: string;
    'data-testid'?: string;
  }

  let { errors, class: className = '', ...rest }: Props = $props();
</script>

{#if errors.length > 0}
  <div
    class="flex flex-col gap-4 {className}"
    data-testid={rest['data-testid']}
  >
    {#each errors as error (error.id)}
      <CommonErrorItem {error} />
    {/each}
  </div>
{/if}
