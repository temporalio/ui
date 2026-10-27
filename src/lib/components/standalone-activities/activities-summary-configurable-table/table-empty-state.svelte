<script lang="ts">
  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalActivity, IconWarning } from '$lib/io/icon';
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
      sdk: 'TypeScript',
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
  <div
    class="flex h-full w-full flex-col items-center justify-center p-4"
    aria-live="polite"
  >
    <div class="text-center">
      <h2>
        {#if $activityError}
          {translate('standalone-activities.activity-query-error-state')}
        {:else}
          {translate('standalone-activities.empty-state-title')}
        {/if}
      </h2>
      <p class="text-secondary">
        {#if $activityError}
          {$activityError}
        {:else}
          {translate('standalone-activities.empty-state-description')}
        {/if}
      </p>
      <NoQueryResults class="m-auto mt-8 text-tertiary" />
    </div>
  </div>
{:else}
  <ResourceEmptyState
    title={translate(
      $activityError
        ? 'standalone-activities.empty-state-title'
        : 'standalone-activities.no-activities-title',
    )}
    Icon={IconTemporalActivity}
  >
    {#snippet description()}
      {#if !$activityError}
        <p>
          <Link href="https://docs.temporal.io/standalone-activity" newTab
            >{translate('standalone-activities.standalone-activities')}</Link
          >{translate(
            'standalone-activities.no-activities-description-part-1-preface',
          )}<Link
            href="https://docs.temporal.io/evaluate/development-production-features/job-queue"
            newTab>{translate('standalone-activities.job-queue-link')}</Link
          >{translate(
            'standalone-activities.no-activities-description-part-1-postface',
          )}
        </p>
      {/if}
    {/snippet}
    {#if $activityError}
      <Alert
        intent="warning"
        Icon={IconWarning}
        title={translate('common.error-occurred')}
        style="overflow-wrap: anywhere"
      >
        {$activityError}
      </Alert>
    {:else}
      <div class="flex flex-col items-center gap-2">
        <p class="text-sm text-secondary">
          {translate('standalone-activities.get-started-title')}
        </p>
        <SdkLinks links={SDK_LINKS} />
      </div>
    {/if}
  </ResourceEmptyState>
{/if}
