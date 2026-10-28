<script lang="ts">
  import EmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import SdkLinks from '$lib/components/empty-states/sdk-links.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalSchedules } from '$lib/io/icon';

  interface Props {
    error?: string;
    query?: string;
  }

  let { error = '', query = '' }: Props = $props();

  const sdkLinks = [
    {
      sdk: 'Go',
      href: 'https://docs.temporal.io/develop/go/workflows/schedules',
    },
    {
      sdk: 'Python',
      href: 'https://docs.temporal.io/develop/python/workflows/schedules',
    },
    {
      sdk: 'Typescript',
      href: 'https://docs.temporal.io/develop/typescript/workflows/schedules',
    },
    {
      sdk: '.NET',
      href: 'https://docs.temporal.io/develop/dotnet/workflows/schedules',
    },
    {
      sdk: 'Ruby',
      href: 'https://docs.temporal.io/develop/ruby/workflows/schedules',
    },
    {
      sdk: 'Java',
      href: 'https://docs.temporal.io/develop/java/workflows/schedules',
    },
    {
      sdk: 'PHP',
      href: 'https://docs.temporal.io/develop/php/workflows/schedules',
    },
    {
      sdk: 'Rust',
      href: 'https://docs.rs/temporalio-client/latest/temporalio_client/schedules/index.html',
    },
  ];
</script>

{#if error}
  <EmptyState
    title={translate('schedules.empty-state-title')}
    Icon={IconTemporalSchedules}
    {error}
  />
{:else if query}
  <EmptyState
    title={translate('schedules.empty-state-title')}
    content={translate('schedules.empty-state-description')}
    Icon={IconTemporalSchedules}
  />
{:else}
  <EmptyState
    title={translate('schedules.empty-state-title')}
    Icon={IconTemporalSchedules}
  >
    {#snippet description()}
      <p>{translate('schedules.no-schedules-description')}</p>
      <p>
        {translate('schedules.getting-started-docs-link-preface')}
        <Link newTab href="https://docs.temporal.io/schedule"
          >{translate('schedules.getting-started-docs-link')}</Link
        >
        {translate('schedules.getting-started-cli-link-preface')}
        <Link newTab href="https://docs.temporal.io/cli/schedule"
          >Temporal CLI</Link
        >.
      </p>
    {/snippet}
    {#snippet resources()}
      <SdkLinks
        links={sdkLinks}
        label={translate('schedules.getting-started-sdk-title')}
      />
    {/snippet}
  </EmptyState>
{/if}
