<script lang="ts">
  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import TableEmptyStateArtwork from '$lib/components/empty-states/table-empty-state-artwork.svelte';
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
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
      <NoQueryResults class="m-auto mt-4 text-subtle" />
    </div>
  </div>
{:else}
  <div
    class="surface-primary h-full w-full overflow-y-auto rounded-panel border border-subtle xl:flex xl:flex-row xl:overflow-hidden"
    aria-live="polite"
  >
    <div class="surface-primary flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
      {#if $activityError}
        <h2>
          {translate('standalone-activities.empty-state-title')}
        </h2>
        <Alert
          intent="warning"
          icon="warning"
          title={translate('common.error-occurred')}
          style="overflow-wrap: anywhere"
        >
          {$activityError}
        </Alert>
      {:else}
        <h2>
          {translate('standalone-activities.no-activities-title')}
        </h2>
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
        <p>
          {translate('standalone-activities.no-activities-description-part-2')}
        </p>
        <p>
          {translate('standalone-activities.no-activities-description-part-3')}
        </p>
        <h3 class="mt-4">
          {translate('standalone-activities.get-started-title')}
        </h3>
        <div class="flex flex-wrap gap-2">
          {#each SDK_LINKS as { sdk, href } (sdk)}
            <Link newTab {href}>
              <SdkLogo {sdk} version="" hideDocsLink />
            </Link>
          {/each}
        </div>
      {/if}
    </div>
    <TableEmptyStateArtwork />
  </div>
{/if}
