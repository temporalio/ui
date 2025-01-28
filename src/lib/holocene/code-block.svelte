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
  import { onMount } from 'svelte';

  import CopyButton from '$lib/holocene/copyable/button.svelte';
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

  type Language = 'json' | 'text' | 'shell';

  type BaseProps = HTMLAttributes<HTMLDivElement> & {
    content: string;
    language?: Language;
    editable?: boolean;
    inline?: boolean;
    testId?: string;
    copyable?: boolean;
    minHeight?: number;
    maxHeight?: number;
    label?: string;
    change?: (value: string) => void;
  };

  type CopyableProps = BaseProps & {
    copyable: true;
    copyIconTitle: string;
    copySuccessIconTitle: string;
  };

  type Props =
    | (BaseProps & { copyIconTitle?: string; copySuccessIconTitle?: string })
    | CopyableProps;

  let {
    content,
    class: className = '',
    editable = false,
    inline = false,
    language = 'json',
    copyable = true,
    copyIconTitle = '',
    copySuccessIconTitle = '',
    minHeight,
    maxHeight,
    label = '',
    testId,
    change = () => {},
    ...rest
  }: Props = $props();

  const { copy, copied } = copyToClipboard();

  const handleCopy = (e: Event) => {
    copy(e, content);
  };

  let editor: HTMLElement = $state();
  let view: EditorView = $state();

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

  let value = $derived(formatValue({ value: content, language }));

  const createEditorView = (isDark: boolean): EditorView => {
    return new EditorView({
      parent: editor,
      state: createEditorState(value, isDark),
      dispatch(transaction) {
        view.update([transaction]);
        if (transaction.docChanged) {
          change(view.state.doc.toString());
        }
      },
    });
  };

  const createEditorState = (
    value: string | null | undefined,
    isDark: boolean,
  ): EditorState => {
    const extensions = [
      keymap.of([...standardKeymap, ...historyKeymap]),
      TEMPORAL_THEME({ isDark, copyable }),
      syntaxHighlighting(TEMPORAL_SYNTAX, { fallback: true }),
      indentUnit.of('  '),
      closeBrackets(),
      autocompletion(),
      indentOnInput(),
      bracketMatching(),
      EditorState.readOnly.of(!editable),
      EditorView.editable.of(editable),
      EditorView.contentAttributes.of({ 'aria-label': label }),
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

    if (minHeight || maxHeight) {
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
    view = createView($useDarkMode);
    return () => view?.destroy();
  });

  const createView = (isDark: boolean): EditorView => {
    if (view) view.destroy();
    return createEditorView(isDark);
  };

  useDarkMode.subscribe((isDark) => {
    view = createView(isDark);
  });

  const resetView = ({
    value = '',
    format = true,
    language,
  }: {
    value?: string;
    format?: boolean;
    language: Language;
  }) => {
    const formattedValue = format ? formatValue({ value, language }) : value;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: formattedValue,
      },
    });
  };

  const setView = ({
    content,
    language,
  }: {
    content: string;
    language: Language;
  }) => {
    if (view && (!editable || view.state.doc.toString() !== content)) {
      resetView({ value: content, language });
    }
  };

  $effect(() => {
    setView({ content, language });
  });
</script>

<div class="relative min-w-[80px] grow">
  <div
    bind:this={editor}
    class={className}
    class:inline
    data-testid={testId}
    class:editable
    class:readOnly={!editable}
    {...rest}
  ></div>
  {#if copyable}
    <CopyButton
      {copyIconTitle}
      {copySuccessIconTitle}
      class="absolute right-1 top-1 text-secondary"
      onclick={handleCopy}
      copied={$copied}
    ></CopyButton>
  {/if}
</div>
