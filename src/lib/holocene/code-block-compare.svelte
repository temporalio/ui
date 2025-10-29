<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import {
    bracketMatching,
    indentOnInput,
    indentUnit,
    syntaxHighlighting,
  } from '@codemirror/language';
  import { MergeView } from '@codemirror/merge';
  import { Compartment, EditorState, type Extension } from '@codemirror/state';
  import { EditorView, keymap } from '@codemirror/view';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge as merge, twMerge } from 'tailwind-merge';

  import { useDarkMode } from '$lib/utilities/dark-mode';
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

  interface BaseProps
    extends Override<
      HTMLAttributes<HTMLDivElement>,
      { onchange?: (text: string) => void }
    > {
    contentA: string;
    contentB: string;
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

  interface PropsWithCopyable
    extends Override<
      BaseProps,
      { copyable?: true; copyIconTitle?: string; copySuccessIconTitle?: string }
    > {}

  export type Props = BaseProps | PropsWithCopyable;

  let {
    contentA = 'This is A',
    contentB = 'This is B',
    language = 'json',
    class: className = undefined,
    editable = false,
    copyable = true,
    inline = false,
    testId = undefined,
    minHeight = undefined,
    maxHeight = undefined,
    label = '',
    ...editorProps
  }: Props = $props();

  // codemirror

  let editorElement = $state<HTMLElement | undefined>();
  let mergeView = $state<MergeView | undefined>();

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
      getEditorTheme($useDarkMode, false),
      getActionsTheme({ hasActions: copyable }),
      EditorState.readOnly.of(!editable),
      EditorView.editable.of(editable),
      EditorView.contentAttributes.of({ 'aria-label': label }),
      getLineBreakExtension(editable),
      getLanguageExtension(language),
      getHeightTheme({ maxHeight, minHeight, maximized }),
    ].filter((ext) => ext != null),
  );

  const createMergeView = () =>
    new MergeView({
      parent: editorElement,
      a: {
        doc: contentA,
        extensions: [staticExtensions, compartment.of(dynamicExtensions)],
      },
      b: {
        doc: contentB,
        extensions: [staticExtensions, compartment.of(dynamicExtensions)],
      },
    });

  onMount(() => {
    mergeView = createMergeView();
    return () => {
      mergeView?.destroy();
    };
  });
</script>

<div class={twMerge('min-w-[80px] grow')}>
  <div
    bind:this={editorElement}
    class:inline
    class:editable
    class:readOnly={!editable}
    class={merge('h-full', className)}
    data-testid={testId}
    {...editorProps}
  ></div>
</div>
