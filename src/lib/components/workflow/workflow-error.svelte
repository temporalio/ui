<script lang="ts">
  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import type { NetworkError } from '$lib/types/global';
  import { routeForWorkflows } from '$lib/utilities/route-for';

  interface Props {
    error: NetworkError;
  }

  let { error }: Props = $props();

  const namespace = $derived(page.params.namespace);

  const title = $derived(
    error.statusCode === 404
      ? translate('workflows.workflow-404-title')
      : translate('workflows.workflow-error-title'),
  );
</script>

<header class="mb-4 flex flex-col gap-1">
  <div class="mb-4 block">
    <Link
      href={`${routeForWorkflows({
        namespace,
      })}?${$workflowsSearchParams}`}
      data-testid="back-to-workflows"
      icon="chevron-left"
    >
      {translate('workflows.back-to-workflows')}
    </Link>
  </div>
</header>
<div
  class="mx-auto flex max-w-xl flex-col items-center rounded-panel border border-danger bg-danger/5 px-5 py-8 text-center align-middle"
>
  <h1 class="font-mono text-5xl font-semibold tracking-tight text-danger">
    {error?.statusCode ?? '500'}
  </h1>
  <p class="mt-2 text-base font-semibold">{title}</p>
  <p class="mt-2 text-sm text-danger">
    {error?.statusText ?? ''}
  </p>
</div>
