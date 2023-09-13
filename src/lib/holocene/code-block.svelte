<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import { json } from '@codemirror/lang-json';
import {
    bracketMatching,
    indentOnInput,
    indentUnit,
    syntaxHighlighting,
  } from '@codemirror/language';
  import { EditorState } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { keymap } from '@codemirror/view';
  import _ from 'json-bigint';
  import { createEventDispatcher, onMount } from 'svelte';
  
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import {
    TEMPORAL_SYNTAX,
    TEMPORAL_THEME,
  } from '$lib/vendor/codemirror/theme';
  
  import Icon from './icon/icon.svelte';

  type BaseProps = HTMLAttributes<HTMLDivElement> & {
    content: Parameters<typeof JSON.stringify>[0];
    editable?: boolean;
    inline?: boolean;
    language?: string;
    testId?: string;
    copyable?: boolean;
    copyIconTitle?: string;
    copySuccessIconTitle?: string;
  };

  type CopyableProps = Omit<
    BaseProps,
    'copyable' | 'copyIconTitle' | 'copySuccessIconTitle'
  > & {
    copyable: false;
    copyIconTitle?: never;
    copySuccessIconTitle?: never;
  };

  type $$Props = BaseProps | CopyableProps;

  const dispatch = createEventDispatcher<{ change: string }>();

  export let content: Parameters<typeof JSON.stringify>[0];
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

  const createEditorView = (): EditorView => {
    return new EditorView({
      parent: editor,
      state: createEditorState(
        inline
          ? stringifyWithBigInt(content, undefined, 0)
          : stringifyWithBigInt(content, undefined, 2),
      ),
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

    return EditorState.create({
      doc: value,
      extensions,
    });
  };

  onMount(() => (view = createEditorView()));
</script>

<div class="relative grow min-w-[80px]">
  <div
    on:keydown|stopPropagation
    bind:this={editor}
    class={className}
    data-testid={$$props['data-testid']}
    {...$$restProps}
  />
  {#if copyable}
    <button
      on:click={(e) => copy(e, JSON.stringify(content, undefined, 2))}
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
