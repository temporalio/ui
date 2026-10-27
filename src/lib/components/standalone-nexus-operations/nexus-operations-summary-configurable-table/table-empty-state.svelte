<script lang="ts">
  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalNexus, IconWarning } from '$lib/io/icon';
  import { nexusOperationError } from '$lib/stores/nexus-operations';

  let query = $derived(page.url.searchParams.get('query'));

  const codeSamples = [
    {
      sdk: 'Go',
      href: 'https://github.com/temporalio/samples-go',
    },
    {
      sdk: 'Java',
      href: 'https://github.com/temporalio/samples-java',
    },
    {
      sdk: 'Typescript',
      href: 'https://github.com/temporalio/samples-typescript',
    },
    {
      sdk: 'Python',
      href: 'https://github.com/temporalio/samples-python',
    },
    {
      sdk: '.NET',
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
      <NoQueryResults class="m-auto mt-8 text-tertiary" />
    </div>
  </div>
{:else}
  <ResourceEmptyState
    title={translate('standalone-nexus-operations.empty-state-no-data-title')}
    Icon={IconTemporalNexus}
  >
    {#snippet description()}
      {#if !$nexusOperationError}
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
      {/if}
    {/snippet}
    {#if $nexusOperationError}
      <Alert
        intent="warning"
        Icon={IconWarning}
        title={translate('common.error-occurred')}
        style="overflow-wrap: anywhere"
      >
        {$nexusOperationError}
      </Alert>
    {:else}
      <div class="flex flex-col items-center gap-2">
        <p class="text-sm text-secondary">
          {translate(
            'standalone-nexus-operations.empty-state-code-samples-title',
          )}
        </p>
        <SdkLinks links={codeSamples} />
      </div>
    {/if}
  </ResourceEmptyState>
{/if}
