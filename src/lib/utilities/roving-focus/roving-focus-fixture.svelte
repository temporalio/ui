<script lang="ts">
  import type { RovingFocusOptions } from './roving-focus';

  import { createRovingFocusState } from './roving-focus.svelte';

  type Props = Pick<
    RovingFocusOptions<string>,
    'orientation' | 'loop' | 'isDisabled' | 'onNavigate'
  > & {
    items: string[];
    selected?: string;
    disabled?: string[];
    ariaDisabled?: string[];
    withAction?: boolean;
  };

  let {
    items,
    selected,
    disabled = [],
    ariaDisabled = [],
    withAction = false,
    ...options
  }: Props = $props();

  const elements: Record<string, HTMLButtonElement | null> = {};

  const roving = createRovingFocusState<string>({
    getItems: () => items,
    getElement: (id) => elements[id],
    getResetItem: () => selected,
    get isDisabled() {
      return options.isDisabled;
    },
    get orientation() {
      return options.orientation;
    },
    get loop() {
      return options.loop;
    },
    onNavigate: (id, element) => options.onNavigate?.(id, element),
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  role="group"
  aria-label="Items"
  onkeydown={roving.onkeydown}
  onfocusin={roving.onfocusin}
  onfocusout={roving.onfocusout}
>
  {#each items as id (id)}
    <button
      bind:this={elements[id]}
      tabindex={roving.tabIndex(id)}
      disabled={disabled.includes(id)}
      aria-disabled={ariaDisabled.includes(id) ? 'true' : undefined}
      >{id}</button
    >
  {/each}
  {#if withAction}
    <button>action</button>
  {/if}
</div>
<button>outside</button>
