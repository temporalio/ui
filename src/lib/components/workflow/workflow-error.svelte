<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import type { NetworkError } from '$lib/types/global';
  import { routeForWorkflows } from '$lib/utilities/route-for';
  import Logo from '$lib/vendor/logo-dark.svg';

  export let error: NetworkError;

  $: ({ namespace } = $page.params);

  $: title =
    error.statusCode === 404
      ? translate('workflows.workflow-404-title')
      : translate('workflows.workflow-error-title');
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
  <h1
    data-testid="workflow-error-heading"
    class="overflow-hidden text-3xl font-medium"
  >
    {error.statusText}
  </h1>
</header>
<div class="my-24 flex flex-col items-center gap-4 text-center">
  <p class="text-4xl font-bold text-red-700">{error.statusCode}</p>
  <h1 class="text-5xl font-semibold">
    {title}
  </h1>
  <img src={Logo} alt="temporal" class="max-h-10 text-black" />
</div>
