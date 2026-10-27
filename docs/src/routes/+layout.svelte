<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import { Button } from '$lib/io-ark/button';

  import { components } from '$docs/data/components';

  import '../../../src/app.css';

  let { children }: { children: Snippet } = $props();
  let theme = $state<'light' | 'dark'>('light');
</script>

<div
  data-theme={theme}
  style:color-scheme={theme}
  class="min-h-screen bg-background-primary text-primary"
>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-background-primary focus:p-3"
    >Skip to content</a
  >
  <header
    class="flex h-16 items-center justify-between border-b border-primary px-6 lg:px-10"
  >
    <a
      href="/"
      class="flex items-center gap-3 font-semibold tracking-tight"
      aria-label="Temporal Design System home"
    >
      <span
        class="flex h-8 w-8 items-center justify-center rounded bg-interactive-primary font-mono text-white"
        aria-hidden="true">T</span
      >
      Temporal
      <span class="hidden font-normal text-secondary sm:inline"
        >/ Design System</span
      >
    </a>
    <Button
      colorScheme="tertiary"
      size="sm"
      tracking={false}
      aria-pressed={theme === 'dark'}
      onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
      >Dark mode</Button
    >
  </header>
  <div class="mx-auto grid max-w-[1600px] lg:grid-cols-[230px_minmax(0,1fr)]">
    <aside
      class="border-b border-primary px-6 py-7 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r lg:px-8"
    >
      <p
        class="mb-6 text-xs font-medium uppercase tracking-widest text-secondary"
      >
        Components
      </p>
      <nav aria-label="Components" class="space-y-1">
        {#each components as component (component.slug)}
          {@const href = `/components/${component.slug}`}
          {@const selected = page.url.pathname === href}
          <a
            {href}
            aria-current={selected ? 'page' : undefined}
            class="block rounded px-3 py-2 font-medium hover:bg-interactive-tertiary-hover"
            class:bg-interactive-secondary-hover={selected}
            class:text-brand={selected}>{component.name}</a
          >
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
    <main id="main" class="min-w-0 px-6 py-10 lg:px-14 lg:py-12">
      {@render children()}
    </main>
  </div>
</div>
