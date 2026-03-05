<script lang="ts">
  import type { Component } from 'svelte';

  import type { RegistryEntry } from '$lib/holocene/fairytale-registry';

  let {
    entry,
    propOverrides = {},
  }: { entry: RegistryEntry; propOverrides?: Record<string, unknown> } =
    $props();

  let LoadedComponent = $state<Component | null>(null);
  let loadError = $state<string | null>(null);

  $effect(() => {
    LoadedComponent = null;
    loadError = null;

    if (entry.requiresContext) return;

    entry
      .load()
      .then((mod) => {
        const m = mod as { default: Component };
        LoadedComponent = m.default;
      })
      .catch((err: Error) => {
        loadError = err?.message || 'Failed to load component';
      });
  });

  const mergedProps = $derived({ ...entry.defaultProps, ...propOverrides });
</script>

{#if entry.requiresContext}
  <div
    class="rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 text-center dark:border-yellow-700 dark:bg-yellow-900/20"
  >
    <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
      Requires App Context
    </p>
    <p class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
      This component depends on app stores or layout data and cannot be
      previewed in isolation.
    </p>
  </div>
{:else if loadError}
  <div
    class="rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8 text-center dark:border-red-700 dark:bg-red-900/20"
  >
    <p class="text-sm font-medium text-red-800 dark:text-red-200">
      Failed to load component
    </p>
    <p class="mt-1 text-xs text-red-600 dark:text-red-400">{loadError}</p>
  </div>
{:else if !LoadedComponent}
  <div class="flex items-center justify-center p-8">
    <div
      class="border-gray-300 h-6 w-6 animate-spin rounded-full border-2 border-t-blue-500"
    ></div>
  </div>
{:else}
  <svelte:boundary>
    {#if entry.children}
      <LoadedComponent {...mergedProps}>
        {entry.children}
      </LoadedComponent>
    {:else}
      <LoadedComponent {...mergedProps} />
    {/if}
    {#snippet failed(error)}
      {@const message =
        error instanceof Error ? error.message : 'Unknown error'}
      <div
        class="rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8 text-center dark:border-red-700 dark:bg-red-900/20"
      >
        <p class="text-sm font-medium text-red-800 dark:text-red-200">
          Render Error
        </p>
        <p class="mt-1 text-xs text-red-600 dark:text-red-400">
          {message}
        </p>
      </div>
    {/snippet}
  </svelte:boundary>
{/if}
