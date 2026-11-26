<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { LayoutData } from './$types';

  import Error from '$lib/holocene/error.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    data: LayoutData;
    children: Snippet;
  }
  let { data, children }: Props = $props();
  let { endpoint } = $derived(data);
</script>

{#if !endpoint}
  <Error
    error={{
      statusCode: 404,
      message: translate('common.page-not-found'),
    }}
    status={404}
  />
{:else}
  {@render children()}
{/if}
