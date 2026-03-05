<script lang="ts">
  import holoceneUsage from 'virtual:holocene-usage';

  import type { PageData } from './$types';

  import Card from '$lib/holocene/card.svelte';
  import { componentRegistry } from '$lib/holocene/fairytale-registry';
  import componentsJson from '$lib/holocene/holocene-components.json';

  import LazyComponent from '../_components/lazy-component.svelte';

  let { data }: { data: PageData } = $props();

  const entry = $derived(componentRegistry[data.componentKey]);
  const propDefs = $derived(
    (
      componentsJson as Record<
        string,
        { name: string; type?: string; required?: boolean }[]
      >
    )[data.componentKey] || [],
  );
  const basePath = holoceneUsage.basePath;
  const usage = $derived(
    holoceneUsage.usage[data.componentKey] || { count: 0, files: [] },
  );

  let showAllFiles = $state(false);

  function parseUnionType(type: string): string[] | null {
    const cleaned = type.replace(/\n/g, '').replace(/\s+/g, ' ');
    const values: string[] = [];
    const regex = /'([^']+)'/g;
    let m;
    while ((m = regex.exec(cleaned)) !== null) {
      values.push(m[1]);
    }
    return values.length > 0 ? values : null;
  }

  type PropVariation = {
    name: string;
    type: string;
    kind: 'boolean' | 'union';
    values: { label: string; props: Record<string, unknown> }[];
  };

  const variations = $derived.by(() => {
    const result: PropVariation[] = [];
    const registryVariants = entry.variants || {};

    for (const [variantName, variantValues] of Object.entries(
      registryVariants,
    )) {
      result.push({
        name: variantName,
        type: variantValues.join(' | '),
        kind: 'union',
        values: variantValues.map((v) => ({
          label: v,
          props: { [variantName]: v },
        })),
      });
    }

    for (const prop of propDefs) {
      if (prop.name === 'class') continue;
      if (prop.name in registryVariants) continue;
      if (
        prop.name.startsWith('on') &&
        prop.name.length > 2 &&
        prop.name[2] === prop.name[2].toUpperCase()
      )
        continue;

      const t = (prop.type || '').trim();

      if (t === 'boolean' || (!prop.type && !prop.required)) {
        const isBooleanLike = !prop.type || t === 'boolean';
        if (!isBooleanLike && t !== '') continue;

        result.push({
          name: prop.name,
          type: 'boolean',
          kind: 'boolean',
          values: [
            { label: 'false', props: { [prop.name]: false } },
            { label: 'true', props: { [prop.name]: true } },
          ],
        });
      } else {
        const unionValues = parseUnionType(t);
        if (unionValues && unionValues.length > 1) {
          result.push({
            name: prop.name,
            type: t,
            kind: 'union',
            values: unionValues.map((v) => ({
              label: v,
              props: { [prop.name]: v },
            })),
          });
        }
      }
    }

    return result;
  });

  const displayFiles = $derived(
    showAllFiles ? usage.files : usage.files.slice(0, 10),
  );
</script>

<div class="p-8">
  <div class="mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-bold text-primary">
        {data.componentKey}
      </h1>
      <span
        class="text-interactive rounded-full bg-interactive-secondary-active px-2.5 py-0.5 text-xs font-medium"
      >
        {entry.category}
      </span>
    </div>
    <p class="mt-1 text-sm text-secondary">
      {entry.filePath}
    </p>
  </div>

  <section class="mb-8">
    <h2 class="mb-3 text-lg font-semibold text-primary">Default</h2>
    <div class="p-6">
      <LazyComponent {entry} />
    </div>
  </section>

  {#if variations.length > 0}
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold text-primary">Prop Variations</h2>

      <div class="space-y-6">
        {#each variations as variation (variation.name)}
          <Card class="overflow-hidden p-0">
            <div class="border-b border-subtle px-4 py-2">
              <span class="font-mono text-sm font-medium text-primary"
                >{variation.name}</span
              >
              <span class="ml-2 text-xs text-secondary">{variation.type}</span>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap items-start gap-6">
                {#each variation.values as v (v.label)}
                  <div class="flex flex-col items-center gap-2">
                    <div class="p-3">
                      <LazyComponent {entry} propOverrides={v.props} />
                    </div>
                    <span class="font-mono text-xs text-secondary"
                      >{variation.name}="{v.label}"</span
                    >
                  </div>
                {/each}
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </section>
  {/if}

  <section>
    <h2 class="mb-3 text-lg font-semibold text-primary">
      Usage
      <span class="ml-2 text-sm font-normal text-secondary">
        {usage.count} file{usage.count !== 1 ? 's' : ''}
      </span>
    </h2>

    {#if usage.files.length > 0}
      <Card class="overflow-hidden p-0">
        <ul class="divide-y divide-subtle text-sm">
          {#each displayFiles as file (file.path)}
            <li class="px-4 py-2 font-mono text-xs">
              <a
                href="vscode://file/{basePath}/{file.path}:{file.line}"
                class="text-interactive hover:underline"
              >
                {file.path}:{file.line}
              </a>
            </li>
          {/each}
        </ul>
        {#if usage.files.length > 10}
          <button
            onclick={() => (showAllFiles = !showAllFiles)}
            class="text-interactive w-full border-t border-subtle px-4 py-2 text-xs font-medium hover:surface-interactive-secondary"
          >
            {showAllFiles
              ? 'Show less'
              : `Show all ${usage.files.length} files`}
          </button>
        {/if}
      </Card>
    {:else}
      <p class="text-sm text-secondary">No usages found in the codebase.</p>
    {/if}
  </section>
</div>
