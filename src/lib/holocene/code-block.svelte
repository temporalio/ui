<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import {
    bracketMatching,
    foldGutter,
    indentOnInput,
    indentUnit,
    syntaxHighlighting,
  } from '@codemirror/language';
  import { Compartment, EditorState, type Extension } from '@codemirror/state';
  import { EditorView, keymap } from '@codemirror/view';
  import { createEventDispatcher, onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import { Maximizable } from '$lib/holocene/maximizable';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { useDarkMode } from '$lib/utilities/dark-mode';
  import { formatJSON } from '$lib/utilities/format-json';
  import {
    type EditorLanguage,
    getActionsTheme,
    getEditorTheme,
    getFocusableExtension,
    getHeightTheme,
    getLanguageExtension,
    getLineBreakExtension,
    highlightStyles,
  } from '$lib/vendor/codemirror/custom-extensions';

  interface BaseProps extends HTMLAttributes<HTMLDivElement> {
    content: string;
    language?: EditorLanguage;
    editable?: boolean;
    copyable?: boolean;
    inline?: boolean;
    testId?: string;
    minHeight?: number;
    maxHeight?: number;
    label?: string;
    class?: string;
  }

  interface PropsWithoutCopyable extends BaseProps {
    copyable: false;
    copyIconTitle: never;
    copySuccessIconTitle: never;
  }

  interface PropsWithCopyable extends BaseProps {
    copyable: true;
    copyIconTitle: string;
    copySuccessIconTitle: string;
  }

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
    ...editorProps
  }: PropsWithoutCopyable | PropsWithCopyable = $props();

  const svelteDispatch = createEventDispatcher<{ change: string }>();

  // codemirror
  let editorElement = $state<HTMLElement | undefined>();
  let view = $state<EditorView | undefined>();

  // content
  const { copy, copied } = copyToClipboard();
  const formatContent = (
    language: EditorLanguage,
    content: string,
    inline: boolean,
  ) => (language === 'json' ? formatJSON(content, inline ? 0 : 2) : content);

  // ui
  let maximizable = $derived(
    (maxHeight && view?.contentHeight > maxHeight) ?? false,
  );
  let maximized = $state(false);

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
      getEditorTheme({ isDark: $useDarkMode }),
      getActionsTheme({ hasActions: copyable || maximizable }),
      EditorState.readOnly.of(!editable),
      EditorView.editable.of(editable),
      EditorView.contentAttributes.of({ 'aria-label': label }),
      getLineBreakExtension(editable),
      getLanguageExtension(language),
      !inline ? EditorView.lineWrapping : undefined,
      !inline && !editable ? foldGutter() : undefined,
      getHeightTheme({ maxHeight, minHeight, maximized }),
      getFocusableExtension(maxHeight, maximized),
    ].filter((ext) => ext != null),
  );

  const createView = () =>
    new EditorView({
      parent: editorElement,
      state: EditorState.create({
        doc: formatContent(language, content, inline),
        extensions: [staticExtensions, compartment.of(dynamicExtensions)],
      }),
      dispatch(transaction, view) {
        view.update([transaction]);
        if (transaction.docChanged) {
          svelteDispatch('change', view.state.doc.toString());
        }
      },
    });

  // keep dynamic extensions up to date in codemirror
  $effect(() => {
    view?.dispatch({
      effects: compartment.reconfigure(dynamicExtensions),
    });
  });

  // reset view if content change
  $effect(() => {
    editable;
    language;
    content;
    inline;
    const doc = view?.state?.doc;
    if (doc && (!editable || doc.toString() !== content)) {
      view?.dispatch({
        changes: {
          from: 0,
          to: doc.length,
          insert: formatContent(language, content, inline),
        },
      });
    }
  });

  onMount(() => {
    view = createView();
    return () => {
      view?.destroy();
    };
  });

  const onMaximize = (value: boolean) => {
    maximized = value;
  };

  const handleCopy = (e: Event) => {
    copy(e, content);
  };
</script>

<div class="min-w-[80px] grow">
  <Maximizable {maximized} {onMaximize} enabled={maximizable}>
    <div
      bind:this={editorElement}
      class={merge('h-full', className)}
      class:inline
      data-testid={testId}
      class:editable
      class:readOnly={!editable}
      {...editorProps}
    ></div>

    {#snippet actions()}
      {#if copyable}
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
