<script lang="ts">
  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import TableEmptyStateArtwork from '$lib/components/empty-states/table-empty-state-artwork.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { nexusOperationError } from '$lib/stores/nexus-operations';

  let query = $derived(page.url.searchParams.get('query'));

  const codeSamples = [
    {
      label: 'samples-go',
      href: 'https://github.com/temporalio/samples-go',
    },
    {
      label: 'samples-java',
      href: 'https://github.com/temporalio/samples-java',
    },
    {
      label: 'samples-typescript',
      href: 'https://github.com/temporalio/samples-typescript',
    },
    {
      label: 'samples-python',
      href: 'https://github.com/temporalio/samples-python',
    },
    {
      label: 'samples-dotnet',
      href: 'https://github.com/temporalio/samples-dotnet',
    },
  ];
</script>

{#if query}
  <div
    class="flex h-full w-full flex-col items-center justify-center p-4"
    aria-live="polite"
  >
    <div class="text-center">
      <h2>
        {#if $nexusOperationError}
          {translate(
            'standalone-nexus-operations.nexus-operation-query-error-state',
          )}
        {:else}
          {translate('standalone-nexus-operations.empty-state-title')}
        {/if}
      </h2>
      <p class="text-secondary">
        {#if $nexusOperationError}
          {$nexusOperationError}
        {:else}
          {translate('standalone-nexus-operations.empty-state-description')}
        {/if}
      </p>
      <NoQueryResults class="m-auto mt-4 text-subtle" />
    </div>
  </div>
{:else}
  <div
    class="surface-primary h-full w-full overflow-hidden rounded-panel border border-subtle xl:flex xl:flex-row"
    aria-live="polite"
  >
    <div class="surface-primary flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
      <h2>
        {translate('standalone-nexus-operations.empty-state-no-data-title')}
      </h2>
      {#if $nexusOperationError}
        <Alert
          intent="warning"
          icon="warning"
          title={translate('common.error-occurred')}
          style="overflow-wrap: anywhere"
        >
          {$nexusOperationError}
        </Alert>
      {:else}
        <div class="flex flex-col gap-2">
          <p>
            {translate(
              'standalone-nexus-operations.empty-state-value-proposition',
            )}
          </p>
          <p>
            {translate(
              'standalone-nexus-operations.empty-state-read-docs-prefix',
            )}
            <Link href="https://docs.temporal.io/evaluate/nexus" newTab>
              {translate(
                'standalone-nexus-operations.empty-state-nexus-docs-link',
              )}
            </Link>
            {translate(
              'standalone-nexus-operations.empty-state-read-docs-middle',
            )}
            <Link href="https://docs.temporal.io/cloud/nexus" newTab>
              {translate(
                'standalone-nexus-operations.empty-state-nexus-eval-guide-link',
              )}
            </Link>
            {translate(
              'standalone-nexus-operations.empty-state-read-docs-suffix',
            )}
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <h3 class="text-base font-medium">
            {translate(
              'standalone-nexus-operations.empty-state-code-samples-title',
            )}
          </h3>
          <ul class="flex flex-col gap-2">
            {#each codeSamples as sample (sample.label)}
              <li class="flex items-center gap-2">
                <Icon name="github" class="h-5 w-5 shrink-0" />
                <Link href={sample.href} newTab>
                  {sample.label}
                </Link>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
    <TableEmptyStateArtwork />
  </div>
{/if}
