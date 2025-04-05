<script lang="ts">
  import type { LayoutData } from './$types';

  import Error from '$lib/holocene/error.svelte';
  import { translate } from '$lib/i18n/translate';

  export let data: LayoutData;

  $: ({ endpoint } = data);
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
  <slot />
{/if}
