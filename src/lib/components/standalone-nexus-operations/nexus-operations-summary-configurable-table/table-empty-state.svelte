<script lang="ts">
  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalNexus } from '$lib/io/icon';
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
  <ResourceEmptyState
    title={translate(
      $nexusOperationError
        ? 'standalone-nexus-operations.nexus-operation-query-error-state'
        : 'standalone-nexus-operations.empty-state-title',
    )}
    content={translate('standalone-nexus-operations.empty-state-description')}
    error={$nexusOperationError}
  >
    {#snippet illustration()}
      <NoQueryResults class="text-tertiary" />
    {/snippet}
  </ResourceEmptyState>
{:else}
  <ResourceEmptyState
    title={translate('standalone-nexus-operations.empty-state-no-data-title')}
    Icon={IconTemporalNexus}
    error={$nexusOperationError}
  >
    {#snippet description()}
      <p>
        {translate('standalone-nexus-operations.empty-state-value-proposition')}
      </p>
      <p>
        {translate('standalone-nexus-operations.empty-state-read-docs-prefix')}
        <Link href="https://docs.temporal.io/evaluate/nexus" newTab>
          {translate('standalone-nexus-operations.empty-state-nexus-docs-link')}
        </Link>
        {translate('standalone-nexus-operations.empty-state-read-docs-middle')}
        <Link href="https://docs.temporal.io/cloud/nexus" newTab>
          {translate(
            'standalone-nexus-operations.empty-state-nexus-eval-guide-link',
          )}
        </Link>
        {translate('standalone-nexus-operations.empty-state-read-docs-suffix')}
      </p>
    {/snippet}
    {#snippet resources()}
      <SdkLinks
        links={codeSamples}
        label={translate(
          'standalone-nexus-operations.empty-state-code-samples-title',
        )}
      />
    {/snippet}
  </ResourceEmptyState>
{/if}
