<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import {
    bracketMatching,
    ensureSyntaxTree,
    foldGutter,
    indentOnInput,
    indentUnit,
    syntaxHighlighting,
  } from '@codemirror/language';
  import { Compartment, EditorState, type Extension } from '@codemirror/state';
  import { EditorView, keymap } from '@codemirror/view';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge as merge, twMerge } from 'tailwind-merge';

  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import { Maximizable } from '$lib/holocene/maximizable';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { useDarkMode } from '$lib/utilities/dark-mode';
  import { formatJSON } from '$lib/utilities/format-json';
  import {
    type EditorLanguage,
    getActionsTheme,
    getEditorTheme,
    getHeightTheme,
    getLanguageExtension,
    getLineBreakExtension,
    highlightStyles,
  } from '$lib/vendor/codemirror/custom-extensions';

  type Override<T, NewT> = Omit<T, keyof NewT> & NewT;

  interface BaseProps extends Override<
    HTMLAttributes<HTMLDivElement>,
    { onchange?: (text: string) => void }
  > {
    content: string;
    language?: EditorLanguage;
    editable?: boolean;
    copyable: false;
    copyIconTitle?: never;
    copySuccessIconTitle?: never;
    inline?: boolean;
    testId?: string;
    minHeight?: number;
    maxHeight?: number;
    label?: string;
    class?: string;
    tabs?: string[];
    activeTab?: string;
    headerActions?: Snippet<[]>;
  }

  interface PropsWithCopyable extends Override<
    BaseProps,
    { copyable?: true; copyIconTitle?: string; copySuccessIconTitle?: string }
  > {}

  export type Props = BaseProps | PropsWithCopyable;

  let {
    content,
    language = 'json',
    class: className = undefined,
    editable = false,
    copyable = true,
    copyIconTitle = '',
    copySuccessIconTitle = '',
    inline = false,
    testId = undefined,
    minHeight = undefined,
    maxHeight = undefined,
    label = '',
    onchange = undefined,
    tabs,
    activeTab = $bindable(),
    headerActions,
    ...editorProps
  }: Props = $props();

  // codemirror

  let editorElement = $state<HTMLElement | undefined>();
  let editorView = $state<EditorView | undefined>();

  // content

  const { copy, copied } = copyToClipboard();

  const format = (
    contentToFormat: string,
    languageFormat: EditorLanguage,
    inlineFormat: boolean,
  ) =>
    languageFormat === 'json'
      ? formatJSON(contentToFormat, inlineFormat ? 0 : 2)
      : contentToFormat;

  const getFormattedDoc = () => {
    const doc = editorView?.state?.doc;
    if (!doc) return '';
    return format(doc.toString(), language, inline);
  };

  const replaceContent = (newContent: string) => {
    const doc = editorView?.state?.doc;
    if (!doc) return;

    if (doc.toString() !== newContent) {
      editorView?.dispatch({
        changes: {
          from: 0,
          to: doc.length,
          insert: newContent,
        },
      });
    }
  };

  const FULL_PARSE_THRESHOLD = 100_000;
  const ensureFullParse = () => {
    if (!editorView) return;
    if (language !== 'json') return;
    const len = editorView.state.doc.length;
    if (len < FULL_PARSE_THRESHOLD) return;
    try {
      ensureSyntaxTree(editorView.state, len, 2000);
    } catch {
      // no-op: parsing is best-effort
    }
  };

  // ui
  const hasHeader = $derived(!!tabs);
  let maximized = $state(false);

  const maximizable = $derived(
    (maxHeight && !hasHeader && editorView?.contentHeight > maxHeight) ?? false,
  );

  // a compartment allows us to update extensions like the theme
  const compartment = $state(new Compartment());

  const staticExtensions: Extension[] = [
    keymap.of([...standardKeymap, ...historyKeymap]),
    syntaxHighlighting(highlightStyles, { fallback: true }),
    indentUnit.of('  '),
    closeBrackets(),
    autocompletion(),
    indentOnInput(),
    bracketMatching(),
  ];

  let dynamicExtensions: Extension[] = $derived(
    [
      getEditorTheme($useDarkMode, hasHeader),
      getActionsTheme({ hasActions: copyable || maximizable }),
      EditorState.readOnly.of(!editable),
      EditorView.editable.of(editable),
      EditorView.contentAttributes.of({ 'aria-label': label }),
      getLineBreakExtension(editable),
      getLanguageExtension(language),
      !inline ? EditorView.lineWrapping : undefined,
      !inline && !editable ? foldGutter() : undefined,
      getHeightTheme({ maxHeight, minHeight, maximized }),
    ].filter((ext) => ext != null),
  );

  const createEditorView = () =>
    new EditorView({
      parent: editorElement,
      state: EditorState.create({
        doc: format(content, language, inline),
        extensions: [staticExtensions, compartment.of(dynamicExtensions)],
      }),
      dispatch(transaction) {
        editorView.update([transaction]);
        if (transaction.docChanged) {
          onchange?.(getFormattedDoc());
        }
      },
    });

  // lifecycle

  // keep dynamic extensions up to date in codemirror
  $effect(() => {
    editorView?.dispatch({
      effects: compartment.reconfigure(dynamicExtensions),
    });
  });

  // add tabindex if maximizable, so up/down arrows can scroll
  $effect(() => {
    if (maximizable) {
      editorView?.scrollDOM?.setAttribute('tabindex', '0');
    } else {
      editorView?.scrollDOM?.removeAttribute('tabindex');
    }
  });

  // when content prop changes, update the document
  $effect(() => {
    const doc = editorView?.state?.doc;
    if (!doc) return;

    const userIsEditing = editable && editorView?.hasFocus;

    if (!userIsEditing) {
      const formattedContent = format(content, language, inline);
      if (doc.toString() !== formattedContent) {
        replaceContent(formattedContent);
      }
      ensureFullParse();
    }
  });

  // handlers

  const handleCopy = (e: Event) => {
    copy(e, getFormattedDoc());
  };

  const handleEditorBlur = () => {
    replaceContent(getFormattedDoc());
  };

  onMount(() => {
    editorView = createEditorView();
    editorView.contentDOM.onblur = handleEditorBlur;
    ensureFullParse();
    return () => {
      editorView?.destroy();
    };
  });
</script>

{#snippet tab(title: string)}
  <button
    class={twMerge(
      'h-full border-b-2 border-transparent py-2',
      title === activeTab ? 'border-brand' : '',
    )}
    onclick={() => (activeTab = title)}
  >
    {title}
  </button>
{/snippet}

<div
  class={twMerge('min-w-[80px] grow', hasHeader && ['border border-subtle'])}
>
  {#if tabs && tabs.length > 0}
    <div
      class="flex flex-row items-center justify-between border-b border-subtle bg-code-block px-3"
    >
      <div class="flex flex-row items-center gap-4">
        {#each tabs as title (title)}
          {@render tab(title)}
        {/each}
      </div>
      <div class="flex flex-row items-center gap-4">
        {@render headerActions?.()}
        {#if copyable}
          <CopyButton
            {copyIconTitle}
            {copySuccessIconTitle}
            class="m-0 rounded-full text-secondary"
            on:click={handleCopy}
            copied={$copied}
          />
        {/if}
      </div>
    </div>
  {/if}
  <Maximizable bind:maximized enabled={maximizable}>
    <div
      bind:this={editorElement}
      class:inline
      class:editable
      class:readOnly={!editable}
      class={merge('h-full', className)}
      data-testid={testId}
      {...editorProps}
      onblur={handleEditorBlur}
    ></div>

    {#snippet actions()}
      {#if copyable && !hasHeader}
        <CopyButton
          {copyIconTitle}
          {copySuccessIconTitle}
          class="m-0 rounded-full text-secondary"
          on:click={handleCopy}
          copied={$copied}
        />
      {/if}
    {/snippet}
  </Maximizable>
</div>
