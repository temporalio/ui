<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import { json } from '@codemirror/lang-json';
  import {
    bracketMatching,
    foldGutter,
    indentOnInput,
    indentUnit,
    StreamLanguage,
    syntaxHighlighting,
  } from '@codemirror/language';
  import { shell } from '@codemirror/legacy-modes/mode/shell';
  import { EditorState } from '@codemirror/state';
  import { EditorView, keymap } from '@codemirror/view';
  import { createEventDispatcher, onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import { Maximizable } from '$lib/holocene/maximizable';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { useDarkMode } from '$lib/utilities/dark-mode';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';
  import {
    TEMPORAL_SYNTAX,
    TEMPORAL_THEME,
  } from '$lib/vendor/codemirror/theme';

  type BaseProps = HTMLAttributes<HTMLDivElement> & {
    content: string;
    language?: 'json' | 'text' | 'shell';
    editable?: boolean;
    inline?: boolean;
    testId?: string;
    copyable?: boolean;
    minHeight?: number;
    maxHeight?: number;
    label?: string;
    class?: string;
  };

  type CopyableProps = BaseProps & {
    copyable: true;
    copyIconTitle: string;
    copySuccessIconTitle: string;
  };

  type $$Props = BaseProps | CopyableProps;

  const dispatch = createEventDispatcher<{ change: string }>();

  export let content: string;
  let className: string = null;
  export { className as class };
  export let editable = false;
  export let inline = false;
  export let language = 'json';
  export let copyable = true;
  export let copyIconTitle = '';
  export let copySuccessIconTitle = '';
  export let minHeight = undefined;
  export let maxHeight = undefined;
  export let label = '';

  const { copy, copied } = copyToClipboard();
  let maximized = false;
  let scrollSnapshot;

  const handleCopy = (e: Event) => {
    copy(e, content);
  };

  const handleMaximize = () => {
    scrollSnapshot = view?.scrollSnapshot();
    maximized = !maximized;
  };

  let editor: HTMLElement;
  let view: EditorView;

  const formatJSON = (jsonData: string): string => {
    if (!jsonData) return;

    let parsedData: string;
    try {
      parsedData = parseWithBigInt(jsonData);
    } catch (error) {
      parsedData = jsonData;
    }

    return stringifyWithBigInt(parsedData, undefined, inline ? 0 : 2);
  };

  const formatValue = ({ value, language }) =>
    language === 'json' ? formatJSON(value) : value;

  $: value = formatValue({ value: content, language });

  const lineBreakReplacer = EditorView.updateListener.of((update) => {
    if (editable) return;
    const newText = update.state.doc.toString().replace(/\\n/g, '\n');
    if (newText !== update.state.doc.toString()) {
      update.view.dispatch({
        changes: { from: 0, to: update.state.doc.length, insert: newText },
      });
    }
  });

  const createEditorView = (
    isDark: boolean,
    maximized: boolean,
  ): EditorView => {
    return new EditorView({
      parent: editor,
      state: createEditorState(value, isDark, maximized),
      scrollTo: scrollSnapshot,
      dispatch(transaction) {
        view.update([transaction]);
        if (transaction.docChanged) {
          dispatch('change', view.state.doc.toString());
        }
      },
    });
  };

  const createEditorState = (
    value: string | null | undefined,
    isDark: boolean,
    maximized: boolean,
  ): EditorState => {
    const extensions = [
      keymap.of([...standardKeymap, ...historyKeymap]),
      TEMPORAL_THEME({ isDark, hasActions: copyable || maximizable }),
      syntaxHighlighting(TEMPORAL_SYNTAX, { fallback: true }),
      indentUnit.of('  '),
      closeBrackets(),
      autocompletion(),
      indentOnInput(),
      bracketMatching(),
      EditorState.readOnly.of(!editable),
      EditorView.editable.of(editable),
      EditorView.contentAttributes.of({ 'aria-label': label }),
      lineBreakReplacer,
    ];

    if (language === 'json') {
      extensions.push(json());
    }

    if (language === 'shell') {
      extensions.push(StreamLanguage.define(shell));
    }

    if (!inline) {
      extensions.push(EditorView.lineWrapping);
    }

    if (!inline && !editable) {
      extensions.push(foldGutter());
    }

    if (minHeight || (maxHeight && !maximized)) {
      extensions.push(
        EditorView.theme({
          '&': {
            ...(minHeight ? { 'min-height': `${minHeight}px` } : {}),
            ...(maxHeight ? { 'max-height': `${maxHeight}px` } : {}),
          },
        }),
      );
      extensions.push(EditorView.contentAttributes.of({ tabindex: '0' }));
    }

    return EditorState.create({
      doc: value,
      extensions,
    });
  };

  onMount(() => {
    createView($useDarkMode, maximized);
    return () => view?.destroy();
  });

  const createView = (isDark: boolean, maximized: boolean) => {
    if (view) view.destroy();
    view = createEditorView(isDark, maximized);
  };

  $: createView($useDarkMode, maximized);

  const resetView = (value = '', format = true) => {
    const formattedValue = format ? formatValue({ value, language }) : value;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: formattedValue,
      },
    });
  };

  const setView = () => {
    if (view && (!editable || view.state.doc.toString() !== content)) {
      resetView(content);
    }
  };

  $: content, language, setView();

  $: maximizable =
    (!editable && maxHeight && contentHeight(editor) > maxHeight) ?? false;

  const contentHeight = (element: HTMLElement) => {
    const childElement = element?.querySelector('.cm-content') as HTMLElement;
    if (childElement) {
      return childElement?.offsetHeight || 0;
    }
    return 0;
  };
</script>

<div class="min-w-[80px] grow">
  <Maximizable
    {maximized}
    onToggleMaximize={handleMaximize}
    enabled={maximizable}
  >
    <div
      bind:this={editor}
      class={merge('h-full', className)}
      class:inline
      data-testid={$$props.testId}
      class:editable
      class:readOnly={!editable}
      {...$$restProps}
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
