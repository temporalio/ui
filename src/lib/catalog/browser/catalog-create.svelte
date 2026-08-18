<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  import type { CatalogAuthoringHost } from './catalog-authoring-host';
  import type { CatalogAuthoringStore } from './catalog-authoring-store';
  import { createCatalogAuthoringStore } from './catalog-authoring-store';

  import CatalogAuthoringWorkspace from './catalog-authoring-workspace.svelte';

  interface Props {
    exampleHref?: string | ((exampleId: string) => string);
    host: CatalogAuthoringHost;
  }

  let { exampleHref, host }: Props = $props();
  let exampleId = $state('');
  let store = $state<CatalogAuthoringStore>();
  let error = $state('');
  let loading = $state(false);
  const localExampleIdPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  const resolvedExampleHref = $derived.by((): string | undefined => {
    if (!store) return undefined;
    if (typeof exampleHref === 'function') {
      return exampleHref(store.getSnapshot().exampleId);
    }
    return exampleHref;
  });

  const create = async () => {
    error = '';
    const localExampleId = exampleId.trim();
    if (
      localExampleId.length > 128 ||
      localExampleId === 'create' ||
      !localExampleIdPattern.test(localExampleId)
    ) {
      error =
        'Use at most 128 lowercase letters, numbers, and hyphens, starting with a letter. The ID cannot be create.';
      return;
    }
    loading = true;
    try {
      await host.scaffold(localExampleId);
      store = createCatalogAuthoringStore(await host.load(localExampleId));
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Unable to create this example.';
    } finally {
      loading = false;
    }
  };
</script>

{#if store}
  <CatalogAuthoringWorkspace exampleHref={resolvedExampleHref} {store} {host} />
{:else}
  <form
    class="max-w-xl space-y-4"
    onsubmit={(event) => {
      event.preventDefault();
      void create();
    }}
  >
    <Input
      id="catalog-local-id"
      label="Local workflow ID"
      bind:value={exampleId}
      placeholder="order-tracking"
      required
      hintText="Use lowercase letters, numbers, and hyphens."
    />
    {#if error}
      <p role="alert" class="text-sm text-danger" tabindex="-1">{error}</p>
    {/if}
    <Button type="submit" {loading} disabled={loading || !host.available}>
      Create Local example
    </Button>
    {#if !host.available}
      <p class="text-sm text-secondary" role="status">
        Local catalog authoring is unavailable in this environment.
      </p>
    {/if}
  </form>
{/if}
