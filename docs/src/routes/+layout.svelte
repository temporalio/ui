<script lang="ts">
  import type { Snippet } from 'svelte';

  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import { Badge } from '$lib/io/badge';
  import { IconMoon, IconSun, IconTemporal } from '$lib/io/icon';
  import { Button } from '$lib/io-poc/button';

  import { components } from '$docs/data/components';
  import { llmsPaths } from '$docs/data/llms';

  import '../../../src/app.css';

  let { children }: { children: Snippet } = $props();
  let theme = $state<'light' | 'dark'>('dark');
  let main = $state<HTMLElement>();

  afterNavigate(({ from, to }) => {
    if (from && !to?.url.hash) main?.scrollTo({ top: 0 });
  });

  const foundations: { label: string; href?: string }[] = [
    { label: 'Colors', href: '/foundations/colors' },
    { label: 'Typography', href: '/foundations/typography' },
    { label: 'Spacing' },
    { label: 'Icons', href: '/foundations/icons' },
  ];

  const agentPages = [
    { label: 'LLMs.txt', href: llmsPaths.llmsPage },
    { label: 'MCP server', href: llmsPaths.mcpServerPage },
  ];

  const navLinkClass =
    'flex items-center justify-between gap-2 rounded px-3 py-2 font-medium hover:bg-interactive-tertiary-hover';
  const navHeadingClass =
    'sticky top-0 z-10 -mx-6 bg-background-primary px-6 pb-3 pt-7 text-xs font-medium uppercase tracking-widest text-secondary lg:-mx-8 lg:px-8';

  $effect(() => {
    document.body.dataset.theme = theme;
  });
</script>

{#snippet navLink(label: string, href: string)}
  {@const selected = page.url.pathname === href}
  <a
    {href}
    aria-current={selected ? 'page' : undefined}
    class={navLinkClass}
    class:bg-interactive-secondary-hover={selected}
    class:text-brand={selected}>{label}</a
  >
{/snippet}

<div
  data-theme={theme}
  style:color-scheme={theme}
  class="flex min-h-screen flex-col bg-background-primary text-primary lg:h-screen lg:overflow-hidden"
>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-background-primary focus:p-3"
    >Skip to content</a
  >
  <header
    class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-primary bg-background-primary px-6 lg:static lg:px-8"
  >
    <a
      href="/"
      class="flex items-center gap-3 text-xl font-normal tracking-tight"
      aria-label="io Design System home"
    >
      <IconTemporal width={24} height={24} />
      <span>io Design System</span>
    </a>
    <Button
      colorScheme="ghost"
      size="sm"
      tracking={false}
      LeadingIcon={theme === 'dark' ? IconSun : IconMoon}
      aria-label={theme === 'dark'
        ? 'Switch to light mode'
        : 'Switch to dark mode'}
      onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
    />
  </header>
  <div
    class="grid min-h-0 flex-1 lg:grid-cols-[248px_minmax(0,1fr)] lg:overflow-hidden"
  >
    <aside
      class="min-h-0 border-b border-primary px-6 pb-7 lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r lg:px-8"
    >
      <h2 id="foundations-heading" class={navHeadingClass}>Foundations</h2>
      <nav aria-labelledby="foundations-heading" class="space-y-1">
        {#each foundations as item (item.label)}
          {#if item.href}
            {@render navLink(item.label, item.href)}
          {:else}
            <span
              class="{navLinkClass} cursor-default text-secondary hover:bg-transparent"
              aria-disabled="true"
            >
              {item.label}
              <Badge text="Coming soon" size="sm" />
            </span>
          {/if}
        {/each}
      </nav>
      <h2 id="agents-heading" class="{navHeadingClass} mt-4">For agents</h2>
      <nav aria-labelledby="agents-heading" class="space-y-1">
        {#each agentPages as item (item.href)}
          {@render navLink(item.label, item.href)}
        {/each}
      </nav>
      <h2 id="components-heading" class="{navHeadingClass} mt-4">Components</h2>
      <nav aria-labelledby="components-heading" class="space-y-1">
        {#each components as component (component.slug)}
          {@render navLink(component.name, `/components/${component.slug}`)}
        {/each}
      </nav>
      <div
        class="mt-10 border-t border-primary pt-5 text-xs leading-relaxed text-secondary"
      >
        <p class="font-medium text-primary">Component resources</p>
        <p class="mt-2">
          Usage patterns, interactive examples, and accessibility guidance for
          Temporal interfaces.
        </p>
        <a
          href="https://ark-ui.com/"
          class="mt-3 inline-block underline underline-offset-4"
          >About Ark UI ↗</a
        >
      </div>
    </aside>
    <main
      id="main"
      bind:this={main}
      tabindex="-1"
      class="min-h-0 min-w-0 px-6 py-10 focus:outline-none lg:overflow-y-auto lg:overscroll-contain lg:px-14 lg:py-12"
    >
      {@render children()}
    </main>
  </div>
</div>
