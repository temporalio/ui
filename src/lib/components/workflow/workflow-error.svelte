<script lang="ts">
  import { page } from '$app/state';

  import Error from '$lib/holocene/error.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import type { NetworkError } from '$lib/types/global';
  import { routeForWorkflows } from '$lib/utilities/route-for';

  interface Props {
    error: NetworkError;
  }

  let { error }: Props = $props();

  const namespace = $derived(page.params.namespace);
</script>

<Error
  {error}
  resource={translate('common.workflows-plural', { count: 1 })}
  back={{
    href: `${routeForWorkflows({ namespace })}?${$workflowsSearchParams}`,
    label: translate('workflows.back-to-workflows'),
  }}
/>
