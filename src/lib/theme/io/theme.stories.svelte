<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  interface ThemeToken {
    name: string;
    cssVariable: string;
    tailwindClass: string;
    value: string;
  }

  interface ThemeTokenGroup {
    name: string;
    tokens: ThemeToken[];
  }

  interface PrimitiveToken {
    name: string;
    step: string;
    value: string;
  }

  interface PrimitiveTokenGroup {
    name: string;
    tokens: PrimitiveToken[];
  }

  const { Story } = defineMeta({
    title: 'IO/Design System/Theme',
    parameters: {
      layout: 'fullscreen',
    },
  });
</script>

<script lang="ts">
  import {
    colorAlphaScales,
    colorScales,
    type CssVariables,
    defaultThemeName,
    type IoTheme,
    ioThemeToCssVariables,
    themes,
    toCssVariables,
  } from './themes';

  const colorGroupNames = [
    'background',
    'content',
    'surface',
    'border',
    'interactive',
    'action',
  ];

  const getTailwindClass = (group: string, name: string): string => {
    if (group === 'background') return ['bg', 'background', name].join('-');
    if (group === 'content') return ['text', name].join('-');
    if (group === 'surface') return ['bg', 'surface', name].join('-');
    if (group === 'border') return ['border', name].join('-');
    if (group === 'interactive') return ['bg', 'interactive', name].join('-');
    if (group === 'action') return ['text', 'action', name].join('-');

    return ['opacity', name].join('-');
  };

  const tokensWithPrefix = (
    variables: CssVariables,
    prefix: string,
    group: string,
  ): ThemeToken[] =>
    Object.entries(variables)
      .filter(([cssVariable]) => cssVariable.startsWith(prefix))
      .map(([cssVariable, value]) => {
        const name = cssVariable.slice(prefix.length);

        return {
          name,
          cssVariable,
          tailwindClass: getTailwindClass(group, name),
          value,
        };
      });

  const getThemeTokenGroups = (theme: IoTheme): ThemeTokenGroup[] => {
    const variables = ioThemeToCssVariables(theme);
    const colorGroups = colorGroupNames.map((name) => ({
      name,
      tokens: tokensWithPrefix(variables, `--color-${name}-`, name),
    }));

    return [
      ...colorGroups,
      {
        name: 'opacity',
        tokens: tokensWithPrefix(variables, '--opacity-', 'opacity'),
      },
    ];
  };

  const getWorkflowActionTokens = (theme: IoTheme): ThemeToken[] =>
    Object.entries(
      toCssVariables(theme.color.action.workflow, 'color-action-workflow'),
    ).map(([cssVariable, value]) => {
      const name = cssVariable.split('-').at(-1) || cssVariable;

      return {
        name,
        cssVariable,
        tailwindClass: ['text', 'action', 'workflow', name].join('-'),
        value,
      };
    });

  const primitiveTokenGroups: PrimitiveTokenGroup[] = Object.entries(
    colorScales,
  ).map(([name, scale]) => ({
    name,
    tokens: Object.entries(scale).map(([step, value]) => ({
      name: `${name}-${step}`,
      step,
      value,
    })),
  }));

  const alphaTokenGroups: PrimitiveTokenGroup[] = Object.entries(
    colorAlphaScales,
  ).map(([name, scale]) => ({
    name,
    tokens: Object.entries(scale).map(([step, value]) => ({
      name: `alpha-${name}-${step}`,
      step,
      value,
    })),
  }));

  const defaultTheme = themes[defaultThemeName];
  const semanticGroups = getThemeTokenGroups(defaultTheme);
  const registeredThemes = Object.entries(themes).map(([name, theme]) => ({
    name,
    groups: getThemeTokenGroups(theme),
  }));
  const workflowActionTokens = getWorkflowActionTokens(defaultTheme);
</script>

{#snippet pageHeader(title: string, description: string)}
  <header class="mb-8 max-w-3xl space-y-2">
    <h1 class="text-2xl font-semibold text-primary">{title}</h1>
    <p class="text-sm text-secondary">{description}</p>
  </header>
{/snippet}

{#snippet semanticTokenGrid(tokens: ThemeToken[], useThemeVariables = true)}
  <ul
    class="grid list-none grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 p-0"
  >
    {#each tokens as token (token.cssVariable)}
      <li
        class="min-w-0 rounded-lg border border-primary bg-surface-primary p-3"
      >
        <div class="mb-3 rounded bg-surface-secondary p-1">
          <div
            class="h-16 rounded border border-primary"
            style:background-color={useThemeVariables
              ? `var(${token.cssVariable})`
              : token.value}
          ></div>
        </div>
        <p class="mb-2 text-sm font-medium text-primary">{token.name}</p>
        <dl class="space-y-2 text-xs">
          <div>
            <dt class="text-tertiary">Tailwind</dt>
            <dd>
              <code class="block break-all text-secondary">
                {token.tailwindClass}
              </code>
            </dd>
          </div>
          <div>
            <dt class="text-tertiary">CSS variable</dt>
            <dd>
              <code class="block break-all text-secondary">
                {token.cssVariable}
              </code>
            </dd>
          </div>
          {#if !useThemeVariables}
            <div>
              <dt class="text-tertiary">Value</dt>
              <dd>
                <code class="block break-all text-secondary">
                  {token.value}
                </code>
              </dd>
            </div>
          {/if}
        </dl>
      </li>
    {/each}
  </ul>
{/snippet}

{#snippet semanticSections(groups: ThemeTokenGroup[], useThemeVariables = true)}
  <div class="space-y-10">
    {#each groups as group (group.name)}
      <section>
        <div class="mb-4 flex items-baseline justify-between gap-4">
          <h2 class="text-lg font-semibold capitalize text-primary">
            {group.name}
          </h2>
          <span class="text-xs text-tertiary">{group.tokens.length} tokens</span
          >
        </div>
        {@render semanticTokenGrid(group.tokens, useThemeVariables)}
      </section>
    {/each}
  </div>
{/snippet}

{#snippet primitiveSections(groups: PrimitiveTokenGroup[])}
  <div class="space-y-8">
    {#each groups as group (group.name)}
      <section
        class="overflow-hidden rounded-lg border border-primary bg-surface-primary"
      >
        <div class="border-b border-primary px-4 py-3">
          <h2 class="font-medium text-primary">{group.name}</h2>
        </div>
        <div class="overflow-x-auto">
          <ul class="grid min-w-[48rem] list-none grid-cols-12 p-0">
            {#each group.tokens as token (token.name)}
              <li class="min-w-0 border-r border-primary last:border-r-0">
                <div
                  class="h-20"
                  style:background-color={token.value}
                  title={token.value}
                ></div>
                <div class="space-y-1 p-2">
                  <p class="text-xs font-medium text-primary">{token.step}</p>
                  <code class="block break-all text-[0.625rem] text-tertiary">
                    {token.value}
                  </code>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </section>
    {/each}
  </div>
{/snippet}

<Story name="Semantic Colors">
  {#snippet template()}
    <main class="min-h-screen bg-background-primary p-6 text-primary">
      {@render pageHeader(
        'Semantic colors',
        'These swatches use the active Storybook theme and the same CSS custom properties consumed by the application.',
      )}
      {@render semanticSections(semanticGroups)}
    </main>
  {/snippet}
</Story>

<Story name="Theme Comparison">
  {#snippet template()}
    <main class="min-h-screen bg-background-primary p-6 text-primary">
      {@render pageHeader(
        'Registered theme comparison',
        'Every registered IoTheme is rendered from the theme registry. Adding another theme automatically adds another section.',
      )}
      <div class="space-y-12">
        {#each registeredThemes as theme (theme.name)}
          <section
            data-theme={theme.name}
            class="rounded-xl border border-primary bg-background-primary p-6 text-primary shadow-sm"
          >
            <div class="mb-8 flex items-center justify-between gap-4">
              <h2 class="text-xl font-semibold capitalize">{theme.name}</h2>
              <code class="text-xs text-secondary">
                data-theme="{theme.name}"
              </code>
            </div>
            {@render semanticSections(theme.groups, false)}
          </section>
        {/each}
      </div>
    </main>
  {/snippet}
</Story>

<Story name="Primitive Scales">
  {#snippet template()}
    <main class="min-h-screen bg-background-primary p-6 text-primary">
      {@render pageHeader(
        'Primitive color scales',
        'Primitive scales are the source palette used to define semantic roles. Application UI should consume semantic tokens instead.',
      )}
      {@render primitiveSections(primitiveTokenGroups)}
    </main>
  {/snippet}
</Story>

<Story name="Alpha Scales">
  {#snippet template()}
    <main class="min-h-screen bg-background-primary p-6 text-primary">
      {@render pageHeader(
        'Alpha color scales',
        'Each alpha scale is generated from its corresponding primitive color using color-mix().',
      )}
      {@render primitiveSections(alphaTokenGroups)}
    </main>
  {/snippet}
</Story>

<Story name="Workflow Actions">
  {#snippet template()}
    <main class="min-h-screen bg-background-primary p-6 text-primary">
      {@render pageHeader(
        'Workflow action colors',
        'These colors identify Temporal workflow concepts. They are product identities rather than interaction states.',
      )}
      {@render semanticTokenGrid(workflowActionTokens)}
    </main>
  {/snippet}
</Story>
