<script lang="ts">
  import DOMPurify from 'dompurify';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { useDarkMode } from '$lib/utilities/dark-mode';
  import { renderMarkdown } from '$lib/utilities/render-markdown';

  interface Props {
    content: string;
    class?: ClassNameValue;
    overrideTheme?:
      | 'background'
      | 'primary'
      | 'info'
      | 'details'
      | ''
      | undefined;
  }

  let { content, class: className = '', overrideTheme = '' }: Props = $props();

  const { workflow: workflowId, run: runId, namespace } = page.params;

  const replaceTemplate = (content: string) => {
    if (namespace) {
      content = content.replace(/\{namespace\}/g, namespace);
    }
    if (workflowId) {
      content = content.replace(/\{workflowId\}/g, workflowId);
    }
    if (runId) {
      content = content.replace(/\{runId\}/g, runId);
    }
    return content;
  };

  const templatedContent = $derived(replaceTemplate(content));
  const isDark = $derived($useDarkMode);
  const themeClass = $derived.by(() => {
    if (overrideTheme) {
      return isDark ? `dark-${overrideTheme}` : `light-${overrideTheme}`;
    }
    return isDark ? 'dark' : 'light';
  });

  let renderedHtml = $state('');

  $effect(() => {
    renderMarkdown(templatedContent).then((html) => {
      const purified = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'code',
          'pre',
          'a',
          'strong',
          'em',
          'blockquote',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'br',
          'hr',
          'del',
          'ins',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        ALLOW_DATA_ATTR: false,
        ALLOW_ARIA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
      });
      renderedHtml = purified;
    });
  });
</script>

<section
  class={twMerge('markdown-preview h-full w-full p-4', className)}
  data-theme={themeClass}
>
  {@html renderedHtml}
</section>

<style>
  .markdown-preview {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    white-space: pre-line;
    font-family: sans-serif;
  }

  .markdown-preview :global(h1) {
    font-size: 2em;
  }

  .markdown-preview :global(h2) {
    font-size: 1.5em;
  }

  .markdown-preview :global(h3) {
    font-size: 1.17em;
  }

  .markdown-preview :global(h4) {
    font-size: 1em;
  }

  .markdown-preview :global(h5) {
    font-size: 0.83em;
  }

  .markdown-preview :global(h6) {
    font-size: 0.67em;
  }

  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    white-space: normal;
  }

  .markdown-preview :global(li) {
    list-style-position: inside;
  }

  .markdown-preview :global(li *) {
    display: inline;
  }

  .markdown-preview :global(a) {
    gap: 0.5rem;
    align-items: center;
    border-radius: 0.25rem;
    max-width: fit-content;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  .markdown-preview :global(blockquote) {
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0.5rem;
    border-left: 4px solid;
    border-left-color: #92a4c3;
    background: #e8efff;
    color: #121416;
  }

  .markdown-preview :global(blockquote p) {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .markdown-preview :global(code) {
    font-family: monospace;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background: #e8efff;
    color: #121416;
  }

  .markdown-preview :global(pre) {
    font-family: monospace;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background: #e8efff;
    color: #121416;
  }

  .markdown-preview :global(pre code) {
    padding: 0;
  }

  .markdown-preview[data-theme='light'] {
    background-color: #fff;
    color: #121416;
  }

  .markdown-preview[data-theme='light'] :global(a) {
    color: #444ce7;
  }

  .markdown-preview[data-theme='dark'] {
    background-color: #141414;
    color: #f8fafc;
  }

  .markdown-preview[data-theme='dark'] :global(a) {
    color: #8098f9;
  }

  .markdown-preview[data-theme='light-background'] {
    background-color: #f8fafc;
    color: #121416;
  }

  .markdown-preview[data-theme='light-background'] :global(a) {
    color: #444ce7;
  }

  .markdown-preview[data-theme='light-background'] :global(code) {
    background: #e8efff;
    color: #121416;
  }

  .markdown-preview[data-theme='light-background'] :global(pre) {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border-color: #aebed9;
    background: #e8efff;
    color: #141414;
  }

  .markdown-preview[data-theme='dark-background'] {
    background-color: #141414;
    color: #f8fafc;
  }

  .markdown-preview[data-theme='dark-background'] :global(a) {
    color: #8098f9;
  }

  .markdown-preview[data-theme='dark-background'] :global(code) {
    background: #292d3e;
    color: #f8fafc;
  }

  .markdown-preview[data-theme='dark-background'] :global(pre) {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border-color: #1e293b;
    background: #292d3e;
    color: #f8fafc;
  }

  .markdown-preview[data-theme='light-primary'] {
    background-color: #fff;
    color: #121416;
  }

  .markdown-preview[data-theme='light-primary'] :global(a) {
    color: #444ce7;
  }

  .markdown-preview[data-theme='light-primary'] :global(code) {
    background: #e8efff;
    color: #121416;
  }

  .markdown-preview[data-theme='light-primary'] :global(pre) {
    padding: 0.5rem;
    border-radius: 0.25rem;
    background: #e8efff;
    color: #121416;
  }

  .markdown-preview[data-theme='dark-primary'] {
    background-color: #000;
    color: #f8fafc;
  }

  .markdown-preview[data-theme='dark-primary'] :global(a) {
    color: #8098f9;
  }

  .markdown-preview[data-theme='dark-primary'] :global(code) {
    background: #292d3e;
    color: #f8fafc;
  }

  .markdown-preview[data-theme='dark-primary'] :global(pre) {
    padding: 0.5rem;
    border-radius: 0.25rem;
    background: #292d3e;
    color: #f8fafc;
  }
</style>
