<script lang="ts">
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import { translate } from '$lib/i18n/translate';

  import IsCloudGuard from './is-cloud-guard.svelte';

  export let open = false;
  export let linkList: Partial<Record<string, string>>;
  export let isCloud = false;
</script>

{#if open}
  <div class="flex h-full flex-col justify-start gap-4">
    <IsCloudGuard {isCloud}>
      <NavigationItem
        link={linkList.feedback}
        label={translate('common.feedback')}
        icon="feedback"
        external
      />
    </IsCloudGuard>
    <IsCloudGuard {isCloud}>
      <NavigationItem
        link={linkList.docs}
        data-testid="docs-button"
        label={translate('common.docs')}
        icon="book"
      />
    </IsCloudGuard>
    <slot />
    <NavigationItem
      link={linkList.namespaces}
      data-testid="namespaces-button"
      label={translate('common.namespaces')}
      icon="namespace"
    />
    <div class="border-b-2 border-subtle" />
    <IsCloudGuard {isCloud}>
      <NavigationItem
        link={linkList.archive}
        data-testid="archive-button"
        label={translate('common.archive')}
        icon="archives"
      />
    </IsCloudGuard>
    <NavigationItem
      link={linkList.batchOperations}
      label={translate('batch.nav-title')}
      tooltip={translate('batch.list-page-title')}
      icon="batch-operation"
    />
    <NavigationItem
      link={linkList.schedules}
      data-testid="schedules-button"
      label={translate('common.schedules')}
      icon="schedules"
    />
    <NavigationItem
      link={linkList.workflows}
      data-testid="workflows-button"
      label={translate('common.workflows')}
      icon="workflow"
    />
  </div>
{/if}
