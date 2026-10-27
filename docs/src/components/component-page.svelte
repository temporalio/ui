<script lang="ts">
  import { Toc } from '@ark-ui/svelte/toc';
  import type { Component, Snippet } from 'svelte';

  import {
    type ComponentDocumentation,
    getComponentContent,
  } from '../data/components';
  import { getContract } from '../data/contracts';

  import AnatomySection from './anatomy-section.svelte';
  import ContractSection from './contract-section.svelte';
  import DocSection from './doc-section.svelte';
  import MarkdownContent from './markdown-content.svelte';
  import PageActions from './page-actions.svelte';
  import SourceCode from './source-code.svelte';

  interface Props {
    component: ComponentDocumentation;
    examples: Component;
    examplesSource: string;
    framed?: boolean;
    sections?: { id: string; label: string }[];
    anatomy?: Snippet;
    extraExamples?: Snippet;
    children: Snippet;
  }

  let {
    component,
    examples: Examples,
    examplesSource,
    framed = false,
    sections: customSections,
    anatomy,
    extraExamples,
    children,
  }: Props = $props();

  const componentSections = $derived(
    getComponentContent(component.slug).sections,
  );
  const hasAnatomy = $derived(!!componentSections.anatomy);
  const hasContract = $derived(!!getContract(component.slug));
  const sections = $derived(
    customSections ?? [
      { id: 'playground', label: 'Playground' },
      ...(hasAnatomy ? [{ id: 'anatomy', label: 'Anatomy' }] : []),
      { id: 'examples', label: 'Examples' },
      { id: 'usage', label: 'Usage' },
      ...(hasContract ? [{ id: 'contract', label: 'Contract' }] : []),
      { id: 'api', label: 'API reference' },
    ],
  );

  const tocItems = $derived(
    sections.map((section) => ({
      value: section.id,
      depth: 2,
      label: section.label,
    })),
  );
</script>

<svelte:head>
  <title>{component.name} · io Design System</title>
  <meta name="description" content={component.description} />
</svelte:head>

<div
  class="grid min-w-0 max-w-[1240px] grid-cols-1 gap-x-10 xl:grid-cols-[minmax(0,1fr)_176px]"
>
  <div class="mb-8 min-w-0 xl:col-start-1 xl:mb-10">
    <p class="mb-5 text-xs text-secondary">Components</p>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-4xl font-semibold tracking-tight">{component.name}</h1>
      <PageActions {component} />
    </div>
    <p class="mt-4 max-w-2xl text-base leading-relaxed text-secondary">
      {component.description}
    </p>
  </div>
  <!-- Keep reading position stable when Ark updates the active section. -->
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
  <div class="min-w-0 xl:col-start-1">
    {@render children()}
    <AnatomySection slug={component.slug} preview={anatomy} />
    <DocSection id="examples" title={componentSections.examples.title}>
      <MarkdownContent section={componentSections.examples} />
      <div class="mt-5">
        {#if framed}
          <div class="rounded-lg border border-primary p-6"><Examples /></div>
        {:else}
          <Examples />
        {/if}
        <SourceCode
          code={examplesSource}
          filename="{component.slug}-examples.svelte"
          collapsible
        />
        {@render extraExamples?.()}
      </div>
    </DocSection>
    <DocSection id="usage" title={componentSections.usage.title}>
      <MarkdownContent section={componentSections.usage} />
    </DocSection>
    <ContractSection slug={component.slug} />
    <DocSection id="api" title={componentSections.api.title}>
      <MarkdownContent section={componentSections.api} />
    </DocSection>
  </div>
  <footer
    class="mt-14 border-t border-primary py-6 text-xs text-secondary xl:col-start-1"
  >
    io Design System · {component.name}
  </footer>
</div>
