<script lang="ts">
  import { colorAlphaScales, colorScales, themes } from '$lib/theme/io/themes';

  import DocSection from '$docs/components/doc-section.svelte';
  import FoundationPage from '$docs/components/foundation-page.svelte';

  interface Token {
    path: string;
    variable: string;
    className: string;
  }

  interface ColorGroup {
    id: string;
    label: string;
    description: string;
    tokens: Token[];
  }

  const groupInfo: Record<
    string,
    { label: string; description: string; prefix: (path: string) => string }
  > = {
    background: {
      label: 'Background',
      description: 'The page canvas behind every surface.',
      prefix: (path) => `bg-background-${path}`,
    },
    surface: {
      label: 'Surface',
      description:
        'Cards, panels, and overlays that sit on the background. Overlay tokens tint content above other surfaces.',
      prefix: (path) => `bg-surface-${path}`,
    },
    content: {
      label: 'Content',
      description:
        'Text and icon colors. Static tokens keep the same hue in both themes.',
      prefix: (path) => `text-${path}`,
    },
    border: {
      label: 'Border',
      description: 'Dividers, outlines, and control borders.',
      prefix: (path) => `border-${path}`,
    },
    interactive: {
      label: 'Interactive',
      description:
        'Fills for buttons and other controls, with hover and press states.',
      prefix: (path) => `bg-interactive-${path}`,
    },
    action: {
      label: 'Action',
      description:
        'Event categories in workflow history, such as activities, signals, and timers.',
      prefix: (path) => `bg-action-${path}`,
    },
    extension: {
      label: 'Extension',
      description: 'Status colors for UI extensions.',
      prefix: (path) => `bg-extension-${path}`,
    },
  };

  const flatten = (group: object, path: string[] = []): string[] =>
    Object.entries(group).flatMap(([name, value]) =>
      typeof value === 'string'
        ? [[...path, name].join('-')]
        : flatten(value as object, [...path, name]),
    );

  const groups: ColorGroup[] = Object.entries(themes.light.color).map(
    ([group, values]) => {
      const info = groupInfo[group] ?? {
        label: group,
        description: '',
        prefix: (path: string) => `bg-${group}-${path}`,
      };
      return {
        id: group,
        label: info.label,
        description: info.description,
        tokens: flatten(values).map((path) => ({
          path,
          variable: `--color-${group}-${path}`,
          className: info.prefix(path),
        })),
      };
    },
  );

  const scaleSteps = Object.keys(colorScales.indigo);

  const sections = [
    ...groups.map((group) => ({ id: group.id, label: group.label })),
    { id: 'palette', label: 'Palette' },
    { id: 'alpha', label: 'Alpha' },
  ];

  let container = $state<HTMLElement>();
  let themeVersion = $state(0);
  let resolved = $state<Record<string, string>>({});
  let copied = $state('');
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const observer = new MutationObserver(() => themeVersion++);
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  });

  $effect(() => {
    void themeVersion;
    if (!container) return;
    const style = getComputedStyle(container);
    resolved = Object.fromEntries(
      groups.flatMap((group) =>
        group.tokens.map((token) => [
          token.variable,
          style.getPropertyValue(token.variable).trim(),
        ]),
      ),
    );
  });

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = text;
    } catch {
      copied = '';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = ''), 1500);
  }
</script>

<FoundationPage
  title="Colors"
  description="Semantic color tokens adapt to light and dark themes. Use them instead of palette colors so interfaces stay consistent in both. Select a token to copy its class name."
  {sections}
>
  <div bind:this={container}>
    <p role="status" aria-live="polite" class="sr-only">
      {copied ? `Copied ${copied}` : ''}
    </p>
    {#each groups as group, index (group.id)}
      <DocSection
        id={group.id}
        title={group.label}
        description={group.description}
        class={index === 0 ? 'mt-0' : undefined}
      >
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {#each group.tokens as token (token.variable)}
            <button
              type="button"
              class="flex min-w-0 items-center gap-3 rounded-lg border border-primary p-2 text-left hover:bg-interactive-tertiary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
              onclick={() => copy(token.className)}
              aria-label="Copy {token.className}"
            >
              {#if group.id === 'content'}
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-primary bg-background-primary text-lg font-semibold"
                  style:color="var({token.variable})"
                  aria-hidden="true">Aa</span
                >
              {:else if group.id === 'border'}
                <span
                  class="h-12 w-12 shrink-0 rounded-md border-2 bg-background-primary"
                  style:border-color="var({token.variable})"
                  aria-hidden="true"
                ></span>
              {:else}
                <span
                  class="h-12 w-12 shrink-0 rounded-md border border-primary"
                  style:background="var({token.variable})"
                  aria-hidden="true"
                ></span>
              {/if}
              <span class="flex min-w-0 flex-col gap-0.5">
                <span class="truncate font-mono text-xs font-medium"
                  >{copied === token.className
                    ? 'Copied'
                    : token.className}</span
                >
                <span class="truncate font-mono text-[11px] text-secondary"
                  >{token.variable}</span
                >
                <span class="truncate font-mono text-[11px] text-tertiary"
                  >{resolved[token.variable] ?? ''}</span
                >
              </span>
            </button>
          {/each}
        </div>
      </DocSection>
    {/each}

    <DocSection
      id="palette"
      title="Palette"
      description="Primitive scales behind the semantic tokens. Steps 1–12 run from lightest to darkest. Prefer semantic tokens; use these for data visualization and illustrations."
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th scope="col" class="w-28 text-left text-xs font-medium"
                ><span class="sr-only">Scale</span></th
              >
              {#each scaleSteps as step (step)}
                <th
                  scope="col"
                  class="text-center font-mono text-[11px] font-normal text-secondary"
                  >{step}</th
                >
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each Object.entries(colorScales) as [name, scale] (name)}
              <tr>
                <th
                  scope="row"
                  class="pr-2 text-left font-mono text-xs font-normal"
                  >{name}</th
                >
                {#each Object.entries(scale) as [step, value] (step)}
                  <td class="p-0">
                    <button
                      type="button"
                      class="block h-9 w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary"
                      style:background={value}
                      title="bg-{name}-{step} · {value}"
                      aria-label="Copy bg-{name}-{step} ({value})"
                      onclick={() => copy(`bg-${name}-${step}`)}
                    ></button>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection
      id="alpha"
      title="Alpha"
      description="Translucent versions of each hue's step 9, for tints and overlays."
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th scope="col" class="w-28"
                ><span class="sr-only">Scale</span></th
              >
              {#each Object.keys(colorAlphaScales.indigo) as step (step)}
                <th
                  scope="col"
                  class="text-center font-mono text-[11px] font-normal text-secondary"
                  >{step}</th
                >
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each Object.entries(colorAlphaScales) as [name, scale] (name)}
              <tr>
                <th
                  scope="row"
                  class="pr-2 text-left font-mono text-xs font-normal"
                  >{name}</th
                >
                {#each Object.entries(scale) as [step, value] (step)}
                  <td class="p-0">
                    <button
                      type="button"
                      class="block h-9 w-full rounded border border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
                      style:background="linear-gradient({value}, {value}),
                      repeating-conic-gradient(#8884 0% 25%, transparent 0% 50%)
                      50% / 12px 12px"
                      title="bg-alpha-{name}-{step}"
                      aria-label="Copy bg-alpha-{name}-{step}"
                      onclick={() => copy(`bg-alpha-${name}-${step}`)}
                    ></button>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </DocSection>
  </div>
</FoundationPage>
