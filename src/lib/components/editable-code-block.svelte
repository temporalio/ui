<script lang="ts">
  import { onMount } from 'svelte';

  let Prism = window.Prism;
  export let placeholder: string | undefined = '';
  export let value = `WorkflowId = '<workflow-id>'
WorkflowId = '<workflow-id>' or WorkflowId = '<another-workflow-id>'
WorkflowId = '<workflow-id>' order by StartTime desc
WorkflowId = '<workflow-id>' and ExecutionStatus = 'Running'
WorkflowId = '<workflow-id>' or ExecutionStatus = 'Running'
WorkflowId = '<workflow-id>' and StartTime > '2021-08-22T15:04:05+00:00'
ExecutionTime between '2021-08-22T15:04:05+00:00' and '2021-08-28T15:04:05+00:00'
ExecutionTime < '2021-08-28T15:04:05+00:00' or ExecutionTime > '2021-08-22T15:04:05+00:00'
order by ExecutionTime
order by StartTime desc, CloseTime asc
order by CustomIntField asc
`;
  export let onChange: (value: string) => void | null = null;

  let highlightContainer;
  let highlighter;
  let textInput;

  function keepElementsTheSameSize(element) {
    let resizeObs = new ResizeObserver(function (entries) {
      let { offsetWidth, offsetHeight } = entries[0]
        .target as HTMLTextAreaElement;

      highlightContainer.style.height = `${offsetHeight}px`;
      highlightContainer.style.width = `${offsetWidth}px`;
    });

    resizeObs.observe(element);

    return {
      destroy() {
        resizeObs.unobserve(element);
      },
    };
  }

  onMount(() => {
    update(value);
  });

  function update(text) {
    // Handle final newlines (see article)
    if (text[text.length - 1] == '\n') {
      text += ' ';
    }
    // Update code
    highlighter.innerHTML = text
      .replace(new RegExp('&', 'g'), '&amp;')
      .replace(new RegExp('<', 'g'), '&lt;'); /* Global RegExp */
    // Syntax Highlight
    Prism.highlightElement(highlighter);
    if (onChange) {
      onChange(value);
    }
  }

  function sync_scroll() {
    /* Scroll result to scroll coords of event - sync with textarea */
    highlightContainer.scrollTop = textInput.scrollTop;
    highlightContainer.scrollLeft = textInput.scrollLeft;
  }

  function check_tab(event) {
    let code = textInput.value;

    if (event.key == 'Tab') {
      event.preventDefault();
      let before_tab = code.slice(0, textInput.selectionStart); // text before tab
      let after_tab = code.slice(
        textInput.selectionEnd,
        textInput.value.length,
      ); // text after tab
      let cursor_pos = textInput.selectionEnd + 1; // where cursor moves after tab - moving forward by 1 char to after tab
      textInput.value = before_tab + '\t' + after_tab; // add tab char
      // move cursor
      textInput.selectionStart = cursor_pos;
      textInput.selectionEnd = cursor_pos;
      update(textInput.value); // Update text to include indent
    }
  }
</script>

<div>
  <textarea
    class="editable-code-block"
    spellcheck="false"
    {placeholder}
    use:keepElementsTheSameSize
    bind:this={textInput}
    bind:value
    on:input={(e) => {
      update(e.currentTarget.value);
      sync_scroll();
    }}
    on:scroll={sync_scroll}
    on:keydown={check_tab}
  />

  <pre
    class="highlighting-container"
    bind:this={highlightContainer}
    aria-hidden="true">
    
    <code class="language-temporalql" bind:this={highlighter} />
    </pre>
</div>

<style>
  /* Please see the article */

  .editable-code-block,
  .highlighting-container {
    /* Both elements need the same text and space styling so they are directly on top of each other */
    margin: 10px;
    padding: 10px;
    border: 0;
    width: 98%;
    height: 150px;
  }
  .editable-code-block,
  .highlighting-container,
  .highlighting-container * {
    /* Also add text styles to highlighing tokens */
    font-size: 15pt;
    font-family: monospace;
    line-height: 20pt;
    tab-size: 2;
  }

  .editable-code-block,
  .highlighting-container {
    /* In the same place */
    position: absolute;
    top: 0;
    left: 0;
  }

  /* Move the textarea in front of the result */

  .editable-code-block {
    z-index: 1;
  }
  .highlighting-container {
    z-index: 0;
  }

  /* Make textarea almost completely transparent */

  .editable-code-block {
    color: transparent;
    background: transparent;
    caret-color: white; /* Or choose your favourite color */
  }

  /* Can be scrolled */
  .editable-code-block,
  .highlighting-container {
    overflow: auto;
    white-space: nowrap; /* Allows textarea to scroll horizontally */
  }

  .editable-code-block {
    resize: var(--resize, both);
  }

  /* Paragraphs; First Image */
  * {
    font-family: 'Fira Code', monospace;
  }
</style>
