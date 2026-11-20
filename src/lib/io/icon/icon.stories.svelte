<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import type { Component, ComponentProps, Snippet } from 'svelte';

  import usage from './icon.usage.md?raw';
  import * as icons from './index';

  import IconSvgWrapper from './icon-svg-wrapper.svelte';

  const glyphs = Object.entries(icons)
    .filter(([name]) => name !== 'default')
    .sort(([a], [b]) => a.localeCompare(b)) as [string, Component][];

  const byName = icons as unknown as Record<string, Component>;

  type IconArgs = ComponentProps<typeof IconSvgWrapper> & { icon?: string };
  type IconTemplate = Snippet<[IconArgs, StoryContext<IconArgs>]>;

  // Show the picked icon as usage code instead of the Playground template.
  const iconSource = (_code: string, { args }: { args: IconArgs }) => {
    const { icon = 'IconAdd', ...props } = args;
    const attributes = Object.entries(props)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([name, value]) =>
        typeof value === 'string' ? `${name}="${value}"` : `${name}={${value}}`,
      );
    return `<${icon} ${attributes.join(' ')} />`;
  };

  const { Story } = defineMeta<IconTemplate, typeof IconSvgWrapper>({
    title: 'IO/Components/Icon',
    tags: ['autodocs'],
    component: IconSvgWrapper,
    parameters: {
      docs: {
        description: {
          component:
            'The shared IO icon library, including optical variants for adjusted visual sizing.',
        },
        usage,
        // The icon picker is a Playground control, not a component prop.
        // Storybook matches exclude against the argType's display name.
        argTypes: { exclude: ['Icon'] },
      },
    },
    argTypes: {
      icon: {
        name: 'Icon',
        description: 'Playground only: the icon to preview.',
        control: 'select',
        options: glyphs.map(([name]) => name),
      },
      title: { name: 'Accessible label', control: 'text' },
      class: { table: { disable: true } },
      children: { table: { disable: true } },
    },
  });
</script>

<script lang="ts">
  // Groups match the IO Design System icon page in Figma. Icons not listed
  // here, including new ones, fall into UI.
  const iconGroups: Record<string, string[]> = {
    Arrows: [
      'IconArrowAscending',
      'IconArrowDescending',
      'IconArrowDown',
      'IconArrowExpand',
      'IconArrowLeft',
      'IconArrowLeftToLine',
      'IconArrowMinimize',
      'IconArrowRight',
      'IconArrowRightArrowLeft',
      'IconArrowRightToLine',
      'IconArrowSquareCaretLeft',
      'IconArrowSquareCaretRight',
      'IconArrowTrendingDown',
      'IconArrowTrendingUp',
      'IconArrowUp',
      'IconArrowUpRight',
      'IconArrowsLeftRightToLine',
      'IconChevronDown',
      'IconChevronLeft',
      'IconChevronRight',
      'IconChevronSelectorVertical',
      'IconChevronUp',
      'IconCollapse',
    ],
    Temporal: [
      'IconAgent',
      'IconNamespace',
      'IconNexus',
      'IconTemporalActivity',
      'IconTemporalArchival',
      'IconTemporalBatch',
      'IconTemporalChildWorkflow',
      'IconTemporalCluster',
      'IconTemporalCodecServer',
      'IconTemporalCommand',
      'IconTemporalDataEncryption',
      'IconTemporalFrontendService',
      'IconTemporalHistoryService',
      'IconTemporalMarker',
      'IconTemporalMatchingService',
      'IconTemporalNamespaces',
      'IconTemporalNexus',
      'IconTemporalObservability',
      'IconTemporalPersistence',
      'IconTemporalQuery',
      'IconTemporalRainbowDeploy',
      'IconTemporalReplay',
      'IconTemporalRetry',
      'IconTemporalSchedules',
      'IconTemporalServer',
      'IconTemporalService',
      'IconTemporalSettings',
      'IconTemporalSignal',
      'IconTemporalSignalHandler',
      'IconTemporalSupport',
      'IconTemporalTaskQueue',
      'IconTemporalTimer',
      'IconTemporalTimeskippingOn',
      'IconTemporalUpdate',
      'IconTemporalUsage',
      'IconTemporalVersioning',
      'IconTemporalWelcome',
      'IconTemporalWorker',
      'IconTemporalWorkerService',
      'IconTemporalWorkflow',
    ],
    Language: [
      'IconDotnet',
      'IconDotnetColor',
      'IconDotnetColorblock',
      'IconGo',
      'IconGoColor',
      'IconGoColorblock',
      'IconJava',
      'IconJavaColor',
      'IconJavaColorblock',
      'IconPhp',
      'IconPhpColor',
      'IconPhpColorblock',
      'IconPython',
      'IconPythonColor',
      'IconPythonColorblock',
      'IconRuby',
      'IconRubyColor',
      'IconRubyColorblock',
      'IconRust',
      'IconRustColor',
      'IconRustColorblock',
      'IconSwift',
      'IconSwiftColor',
      'IconSwiftColorblock',
      'IconTypescript',
      'IconTypescriptColor',
      'IconTypescriptColorblock',
    ],
    'Logo/Brand': [
      'IconApple',
      'IconAws',
      'IconAwsColor',
      'IconAzure',
      'IconAzureColor',
      'IconClaude',
      'IconCodex',
      'IconCursor',
      'IconGcp',
      'IconGcpColor',
      'IconGithub',
      'IconGoogle',
      'IconGoogleColor',
      'IconLinkedin',
      'IconLinux',
      'IconMicrosoft',
      'IconMicrosoftColor',
      'IconOpenAi',
      'IconOracle',
      'IconPylon',
      'IconSlack',
      'IconTemporal',
      'IconVercel',
      'IconX',
      'IconYoutube',
    ],
  };

  // Optical variants sit with their base icon.
  const groupOf = (name: string) =>
    Object.keys(iconGroups).find((group) =>
      iconGroups[group].includes(name.replace(/Optical$/, '')),
    ) ?? 'UI';

  const groupedGlyphs = ['UI', ...Object.keys(iconGroups)].map((group) => ({
    group,
    glyphs: glyphs.filter(([name]) => groupOf(name) === group),
  }));

  const optical = glyphs
    .filter(([name]) => name.endsWith('Optical'))
    .map(([name, Glyph]) => {
      const baseName = name.slice(0, -'Optical'.length);
      return { name, baseName, Glyph, Base: byName[baseName] };
    })
    .filter(({ Base }) => Boolean(Base))
    .sort((a, b) => a.baseName.localeCompare(b.baseName));

  const sizes = [16, 20, 48];
</script>

<Story
  tags={['!dev']}
  name="Playground"
  args={{ icon: 'IconAdd', width: 24, height: 24 }}
  parameters={{ docs: { source: { transform: iconSource } } }}
>
  {#snippet template({ icon, ...args })}
    {@const Glyph = (icon && byName[icon]) || icons.IconAdd}
    <Glyph {...args} />
  {/snippet}
</Story>

<Story name="Contact Sheet">
  {#snippet template()}
    <div class="w-full text-primary">
      <p class="mb-4 text-sm text-secondary">{glyphs.length} icons</p>
      {#each groupedGlyphs as { group, glyphs: groupGlyphs } (group)}
        <section class="mb-6 last:mb-0" aria-labelledby="icon-group-{group}">
          <h4 id="icon-group-{group}" class="mb-2 text-sm font-medium">
            {group}
            <span class="font-normal text-secondary">{groupGlyphs.length}</span>
          </h4>
          <ul
            class="grid list-none grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2 p-0"
          >
            {#each groupGlyphs as [name, Glyph] (name)}
              <li
                class="flex flex-col items-center gap-2 rounded-lg border border-primary bg-surface-primary p-3 text-center text-primary"
              >
                <span class="text-2xl"><Glyph /></span>
                <code
                  class="break-all text-[0.625rem] leading-tight opacity-70"
                >
                  {name}
                </code>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Optical Adjustments">
  {#snippet template()}
    <div class="w-full text-primary">
      <p class="mb-4 max-w-prose text-sm opacity-60">
        Some Io glyphs fill their viewBox where the icons they replaced were
        inset, so they read larger at the same box size. An optical variant
        nests the base icon in a smaller viewport, leaving the box — and so the
        surrounding layout — untouched. The dotted outline is the box.
      </p>
      <p class="mb-4 text-sm opacity-60">{optical.length} adjusted</p>
      <ul class="flex list-none flex-col gap-3 p-0">
        {#each optical as { name, baseName, Glyph, Base } (name)}
          <li
            class="flex flex-col gap-3 rounded-lg border border-primary bg-surface-primary p-4 text-primary"
          >
            <code class="text-xs opacity-70">{baseName}</code>
            <div class="flex flex-wrap items-end gap-6">
              {#each sizes as size (size)}
                <div class="flex items-end gap-3">
                  {#each [{ label: 'base', Component: Base }, { label: 'optical', Component: Glyph }] as variant (variant.label)}
                    {@const Rendered = variant.Component}
                    <div class="flex flex-col items-center gap-1">
                      <span class="outline-dotted outline-1 outline-danger">
                        <Rendered width={size} height={size} />
                      </span>
                      <span class="text-[0.625rem] opacity-60">
                        {variant.label}
                      </span>
                    </div>
                  {/each}
                  <span class="text-[0.625rem] opacity-40">{size}px</span>
                </div>
              {/each}
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm">
              {#each [{ label: baseName, Component: Base }, { label: name, Component: Glyph }] as variant (variant.label)}
                {@const Rendered = variant.Component}
                <span
                  class="inline-flex items-center gap-2 rounded border border-primary bg-surface-primary px-4 py-2 text-primary"
                >
                  In a button
                  <Rendered />
                </span>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}
</Story>
