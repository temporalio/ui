<script lang="ts">
  import defaultTheme from 'tailwindcss/defaultTheme';

  import { fontSize as presetFontSize } from '$lib/theme/preset';

  import rootConfig from '../../../../../tailwind.config';

  import DocSection from '$docs/components/doc-section.svelte';
  import FoundationPage from '$docs/components/foundation-page.svelte';

  type FontSizeValue = string | [string, string | { lineHeight?: string }];

  const toSize = (value: FontSizeValue) => {
    if (typeof value === 'string') return { size: value, lineHeight: '' };
    const [size, options] = value;
    return {
      size,
      lineHeight:
        typeof options === 'string' ? options : (options.lineHeight ?? ''),
    };
  };

  const remToPx = (value: string) =>
    value.endsWith('rem') ? `${parseFloat(value) * 16}px` : value;

  const scale = Object.entries({
    ...presetFontSize,
    ...(defaultTheme.fontSize as Record<string, FontSizeValue>),
  })
    .map(([name, value]) => ({ name, ...toSize(value) }))
    .sort((a, b) => parseFloat(a.size) - parseFloat(b.size));

  const families = Object.entries(rootConfig.theme.fontFamily)
    .filter(([name]) => name !== 'serif')
    .map(([name, stack]) => ({ name, stack: stack.join(', ') }));

  const weights = Object.entries(
    defaultTheme.fontWeight as Record<string, string>,
  ).filter(([name]) => ['normal', 'medium', 'semibold', 'bold'].includes(name));

  const headings = [
    { tag: 'h1', size: '3xl' },
    { tag: 'h2', size: '2xl' },
    { tag: 'h3', size: 'xl' },
    { tag: 'h4', size: 'lg' },
    { tag: 'h5', size: 'base' },
    { tag: 'h6', size: 'sm' },
  ].map((heading) => ({
    ...heading,
    ...(scale.find((step) => step.name === heading.size) ?? {
      name: heading.size,
      size: '',
      lineHeight: '',
    }),
  }));

  const textStyles = [
    {
      name: 'body-normal',
      description: 'Default body text. Small size, normal weight.',
    },
    { name: 'body-medium', description: 'Emphasized body text and labels.' },
    {
      name: 'body-small',
      description: 'Supporting text, captions, and metadata.',
    },
    { name: 'body-small-medium', description: 'Small labels and badges.' },
    {
      name: 'body-small-mono',
      description: 'IDs, timestamps, and code-like values.',
    },
  ];

  const sections = [
    { id: 'families', label: 'Font families' },
    { id: 'text-styles', label: 'Text styles' },
    { id: 'headings', label: 'Headings' },
    { id: 'scale', label: 'Type scale' },
    { id: 'weights', label: 'Weights' },
  ];
</script>

<FoundationPage
  title="Typography"
  description="Type uses the system sans-serif and monospace stacks. Text styles and heading defaults come from the Temporal Tailwind preset, so the same classes work in the product and in packages that use it."
  {sections}
>
  <DocSection
    id="families"
    title="Font families"
    description="Use sans for interface text and mono for identifiers, payloads, and code."
    class="mt-0"
  >
    <div class="grid gap-4 md:grid-cols-2">
      {#each families as family (family.name)}
        <div class="rounded-lg border border-primary p-5">
          <p class="font-mono text-xs text-secondary">font-{family.name}</p>
          <p class="mt-3 text-2xl" style:font-family={family.stack}>
            Workflow order-fulfillment-7f3a
          </p>
          <p
            class="mt-2 text-sm text-secondary"
            style:font-family={family.stack}
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
          </p>
          <p class="mt-3 break-words font-mono text-[11px] text-tertiary">
            {family.stack}
          </p>
        </div>
      {/each}
    </div>
  </DocSection>

  <DocSection
    id="text-styles"
    title="Text styles"
    description="Preset classes for body text. Prefer these over combining size and weight utilities."
  >
    <div class="divide-y divide-primary rounded-lg border border-primary">
      {#each textStyles as style (style.name)}
        <div class="grid gap-2 p-4 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p class="font-mono text-xs font-medium">.{style.name}</p>
            <p class="mt-1 text-xs text-secondary">{style.description}</p>
          </div>
          <p class={style.name}>
            Activity ChargePayment completed after 3 attempts on
            payments-task-queue.
          </p>
        </div>
      {/each}
    </div>
  </DocSection>

  <DocSection
    id="headings"
    title="Headings"
    description="Heading elements get a size and medium weight by default. Use the semantic level that matches the page outline."
  >
    <div class="divide-y divide-primary rounded-lg border border-primary">
      {#each headings as heading (heading.tag)}
        <div
          class="grid items-baseline gap-2 p-4 sm:grid-cols-[180px_minmax(0,1fr)]"
        >
          <p class="font-mono text-xs">
            &lt;{heading.tag}&gt;
            <span class="text-secondary">text-{heading.name}</span>
          </p>
          <p
            class="font-medium"
            style:font-size={heading.size}
            style:line-height={heading.lineHeight}
          >
            Schedules
          </p>
        </div>
      {/each}
    </div>
  </DocSection>

  <DocSection
    id="scale"
    title="Type scale"
    description="Font size utilities with their default line heights."
  >
    <div class="divide-y divide-primary rounded-lg border border-primary">
      {#each scale as step (step.name)}
        <div
          class="grid items-baseline gap-2 p-4 sm:grid-cols-[180px_minmax(0,1fr)]"
        >
          <div class="font-mono text-xs">
            <p class="font-medium">text-{step.name}</p>
            <p class="text-secondary">
              {remToPx(step.size)}{step.lineHeight
                ? ` / ${remToPx(step.lineHeight)}`
                : ''}
            </p>
          </div>
          <p
            class="truncate"
            style:font-size={step.size}
            style:line-height={step.lineHeight || undefined}
          >
            Start a workflow
          </p>
        </div>
      {/each}
    </div>
  </DocSection>

  <DocSection
    id="weights"
    title="Weights"
    description="Use normal for body text, medium for labels and headings, and semibold sparingly for page titles."
  >
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#each weights as [name, value] (name)}
        <div class="rounded-lg border border-primary p-4">
          <p class="text-2xl" style:font-weight={value}>Temporal</p>
          <p class="mt-2 font-mono text-xs text-secondary">
            font-{name} · {value}
          </p>
        </div>
      {/each}
    </div>
  </DocSection>
</FoundationPage>
