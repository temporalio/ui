<script lang="ts">
  import { Toc } from '@ark-ui/svelte/toc';
  import type { Snippet } from 'svelte';

  interface Props {
    category?: string;
    title: string;
    description: string;
    sections: { id: string; label: string }[];
    children: Snippet;
  }

  let {
    category = 'Foundations',
    title,
    description,
    sections,
    children,
  }: Props = $props();

  const tocItems = $derived(
    sections.map((section) => ({
      value: section.id,
      depth: 2,
      label: section.label,
    })),
  );
</script>

<svelte:head>
  <title>{title} · io Design System</title>
  <meta name="description" content={description} />
</svelte:head>

<div
  class="grid min-w-0 max-w-[1240px] grid-cols-1 gap-x-10 xl:grid-cols-[minmax(0,1fr)_176px]"
>
  <div class="mb-8 min-w-0 xl:col-start-1 xl:mb-10">
    <p class="mb-5 text-xs text-secondary">{category}</p>
    <h1 class="text-4xl font-semibold tracking-tight">{title}</h1>
    <p class="mt-4 max-w-2xl text-base leading-relaxed text-secondary">
      {description}
    </p>
  </div>
  <Toc.Nav
    items={tocItems}
    autoScroll={false}
    scrollBehavior="auto"
    class="mb-10 min-w-0 border-b border-primary pb-4 text-sm text-secondary xl:sticky xl:top-8 xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:mb-0 xl:self-start xl:border-b-0 xl:pb-0"
  >
    <Toc.Title class="mb-3 text-xs font-medium text-primary"
      >On this page</Toc.Title
    >
    <Toc.List
      class="flex list-none flex-wrap gap-x-6 gap-y-2 xl:block xl:border-l xl:border-primary"
    >
      {#each tocItems as item (item.value)}
        <Toc.Item {item}>
          <Toc.Link
            href="#{item.value}"
            class="block rounded-sm py-1 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 xl:-ml-px xl:border-l xl:border-transparent xl:py-2 xl:pl-4 [&[data-active]]:font-medium [&[data-active]]:text-brand [&[data-active]]:underline [&[data-active]]:underline-offset-4 xl:[&[data-active]]:border-brand xl:[&[data-active]]:no-underline"
            >{item.label}</Toc.Link
          >
        </Toc.Item>
      {/each}
    </Toc.List>
  </Toc.Nav>
  <div class="min-w-0 xl:col-start-1">{@render children()}</div>
  <footer
    class="mt-14 border-t border-primary py-6 text-xs text-secondary xl:col-start-1"
  >
    io Design System · {title}
  </footer>
</div>
