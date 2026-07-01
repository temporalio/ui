<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/state';

  import { extensionsForSlot } from '$lib/extensions/iframe-extensions';
  import type { ExtensionContext } from '$lib/extensions/types';

  import IframeExtension from './iframe-extension.svelte';

  interface Props {
    name: string;
    context?: Partial<ExtensionContext>;
    class?: string;
  }

  let { name, context = {}, class: className = 'contents' }: Props = $props();

  const routeParams = $derived(
    Object.fromEntries(
      Object.entries(page.params).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    ),
  );
  const iframeExtensions = $derived(
    page.data?.settings?.customUi?.enabled
      ? (page.data.settings.customUi.iframeExtensions ?? [])
      : [],
  );
  const extensions = $derived(
    extensionsForSlot(iframeExtensions, name, page.url.pathname),
  );
  const extensionContext = $derived<ExtensionContext>({
    ...context,
    uiVersion: page.data?.settings?.version ?? '',
    temporalVersion: page.data?.cluster?.serverVersion ?? undefined,
    basePath: base,
    route: {
      pathname: page.url.pathname,
      search: page.url.search,
      params: routeParams,
      ...context.route,
    },
    namespace: page.params.namespace,
  });
</script>

<div
  data-temporal-extension-slot={name}
  data-temporal-namespace={extensionContext.namespace}
  data-temporal-workflow-id={extensionContext.workflow?.workflowId}
  data-temporal-run-id={extensionContext.workflow?.runId}
  class={className}
>
  {#each extensions as extension (extension.id)}
    <IframeExtension
      {extension}
      context={extensionContext}
      currentOrigin={page.url.origin}
    />
  {/each}
</div>
