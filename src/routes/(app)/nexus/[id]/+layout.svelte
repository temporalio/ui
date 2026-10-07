<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { LayoutData } from './$types';

  import Error from '$lib/holocene/error.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForNexus } from '$lib/utilities/route-for';

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
    resource={translate('nexus.nexus-endpoint-simple')}
    namespaced={false}
    back={{
      href: routeForNexus(),
      label: translate('nexus.back-to-endpoints'),
    }}
  />
{:else}
  {@render children()}
{/if}
