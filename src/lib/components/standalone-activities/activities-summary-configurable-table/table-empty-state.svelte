<script lang="ts">
  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import PlaceholderCards from '$lib/components/empty-states/placeholder-cards.svelte';
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalActivity } from '$lib/io/icon';
  import { activityError } from '$lib/stores/activities';

  let query = $derived(page.url.searchParams.get('query'));
  const SDK_LINKS = [
    {
      sdk: 'Go',
      href: 'https://docs.temporal.io/develop/go/activities/standalone-activities',
    },
    {
      sdk: 'Python',
      href: 'https://docs.temporal.io/develop/python/activities/standalone-activities',
    },
    {
      sdk: 'Java',
      href: 'https://docs.temporal.io/develop/java/activities/standalone-activities',
    },
    {
      sdk: '.NET',
      href: 'https://docs.temporal.io/develop/dotnet/activities/standalone-activities',
    },
    {
      sdk: 'Typescript',
      href: 'https://docs.temporal.io/develop/typescript/activities/standalone-activities',
    },
    {
      sdk: 'Ruby',
      href: 'https://docs.temporal.io/develop/ruby/activities/standalone-activities',
    },
    {
      sdk: 'Rust',
      href: 'https://docs.temporal.io/develop/rust/activities/standalone-activities-quickstart',
    },
  ];
</script>

{#if query}
  <ResourceEmptyState
    title={translate(
      $activityError
        ? 'standalone-activities.activity-query-error-state'
        : 'standalone-activities.empty-state-title',
    )}
    content={translate('standalone-activities.empty-state-description')}
    error={$activityError}
  >
    {#snippet illustration()}
      <NoQueryResults class="text-tertiary" />
    {/snippet}
  </ResourceEmptyState>
{:else}
  <ResourceEmptyState
    title={translate(
      $activityError
        ? 'standalone-activities.empty-state-title'
        : 'standalone-activities.no-activities-title',
    )}
    Icon={IconTemporalActivity}
    error={$activityError}
  >
    {#snippet illustration()}
      <PlaceholderCards />
    {/snippet}
    {#snippet description()}
      <p>
        {translate('standalone-activities.empty-state-value-proposition')}
      </p>
      <p>
        {translate('standalone-activities.empty-state-read-docs-prefix')}
        <Link href="https://docs.temporal.io/standalone-activity" newTab>
          {translate('standalone-activities.empty-state-activity-docs-link')}
        </Link>
        {translate('standalone-activities.empty-state-read-docs-middle')}
        <Link
          href="https://docs.temporal.io/evaluate/development-production-features/job-queue"
          newTab
        >
          {translate('standalone-activities.empty-state-job-queue-guide-link')}
        </Link>
        {translate('standalone-activities.empty-state-read-docs-suffix')}
      </p>
    {/snippet}
    {#snippet resources()}
      <SdkLinks
        links={SDK_LINKS}
        label={translate('standalone-activities.get-started-title')}
      />
    {/snippet}
  </ResourceEmptyState>
{/if}
