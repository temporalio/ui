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
    syntaxHighlighting,
  } from '@codemirror/language';
  import { EditorState } from '@codemirror/state';
  import { EditorView, keymap } from '@codemirror/view';
  import { createEventDispatcher, onMount } from 'svelte';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';
  import {
    TEMPORAL_SYNTAX,
    TEMPORAL_THEME,
  } from '$lib/vendor/codemirror/theme';

  import Icon from './icon/icon.svelte';

  type BaseProps = HTMLAttributes<HTMLDivElement> & {
    content: string;
    language?: 'json' | 'text';
    editable?: boolean;
    inline?: boolean;
    testId?: string;
    copyable?: boolean;
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

  const { copy, copied } = copyToClipboard();

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

  $: value = language === 'json' ? formatJSON(content) : content;

  const createEditorView = (): EditorView => {
    return new EditorView({
      parent: editor,
      state: createEditorState(value),
      dispatch(transaction) {
        view.update([transaction]);
        if (transaction.docChanged) {
          dispatch('change', view.state.doc.toString());
        }
      },
    });
  };

  const createEditorState = (value: string | null | undefined): EditorState => {
    const extensions = [
      keymap.of([...standardKeymap, ...historyKeymap]),
      TEMPORAL_THEME,
      syntaxHighlighting(TEMPORAL_SYNTAX, { fallback: true }),
      indentUnit.of('  '),
      closeBrackets(),
      autocompletion(),
      indentOnInput(),
      bracketMatching(),
      EditorView.lineWrapping,
      EditorState.readOnly.of(!editable),
    ];

    if (language === 'json') {
      extensions.push(json());
    }

    if (!editable) {
      extensions.push(foldGutter());
    }

    return EditorState.create({
      doc: value,
      extensions,
    });
  };

  onMount(() => {
    view = createEditorView();
  });

  const setView = () => {
    if (view && !editable) {
      const newState = createEditorState(value);
      view.setState(newState);
    }
  };

  $: content, language, setView();
</script>

<div class="relative min-w-[80px] grow">
  <div
    on:keydown|stopPropagation
    bind:this={editor}
    class={className}
    data-testid={$$props.testId}
    class:editable
    {...$$restProps}
  />
  {#if copyable}
    <button
      on:click={(e) => copy(e, stringifyWithBigInt(content, undefined, 2))}
      class="absolute top-2.5 right-2.5 rounded-md bg-gray-900 opacity-90 hover:bg-white"
    >
      <Icon
        title={$copied ? copySuccessIconTitle : copyIconTitle}
        name={$copied ? 'checkmark' : 'copy'}
        class="text-white hover:text-gray-900"
      />
    </button>
  {/if}
</div>
