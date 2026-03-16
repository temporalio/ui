<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForServerlessWorkerCreate } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const createHref = $derived(routeForServerlessWorkerCreate({ namespace }));
</script>

<div class="flex w-full flex-col items-center gap-4 px-5 py-16">
  <div class="flex flex-col items-center gap-2">
    <span class="flex h-20 w-20 items-center justify-center">
      <Icon name="robot" class="block h-full w-full" />
    </span>
    <div class="flex flex-col items-center gap-2 text-center text-primary">
      <p class="text-base font-medium">
        {translate('workers.empty-no-workers-title')}
      </p>
      <p class="max-w-lg text-sm">
        {translate('workers.empty-no-workers-description')}
      </p>
    </div>
  </div>
  <Button variant="primary" href={createHref}>
    {translate('workers.create-serverless-worker')}
  </Button>
  <div class="flex flex-col items-center gap-2">
    <div class="flex w-full items-center gap-2">
      <hr class="flex-1 border-subtle" />
      <span class="text-xs font-medium text-secondary">
        {translate('workers.available-integrations')}
      </span>
      <hr class="flex-1 border-subtle" />
    </div>
    <div class="flex items-center gap-4 text-sm text-primary">
      <span>{translate('workers.integration-aws-lambda')}</span>
      <span>{translate('workers.integration-google-cloud-run')}</span>
      <span>{translate('workers.integration-vercel-functions')}</span>
    </div>
  </div>
</div>
<div class="flex w-full items-center border border-subtle bg-blue-50 p-3">
  <div class="flex items-center gap-1">
    <span class="text-xs text-primary">
      {translate('workers.self-managed-banner')}
    </span>
    <Link href="https://docs.temporal.io/workers" newTab>
      {translate('workers.view-docs')}
    </Link>
  </div>
</div>
