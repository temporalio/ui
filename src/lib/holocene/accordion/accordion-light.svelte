<script lang="ts">
  import { slide } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { v4 } from 'uuid';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  interface Props {
    id?: string;
    icon?: IconName;
    open?: boolean;
    expandable?: boolean;
    error?: string;
    onToggle?: () => void;
    'data-testid'?: string;
    title?: Snippet;
    description?: Snippet;
    action?: Snippet;
    children?: Snippet<[{ open: boolean }]>;
    onclick?: (e: MouseEvent) => void;
    onkeyup?: (e: KeyboardEvent) => void;
  }

  let {
    id = v4(),
    open = $bindable(false),
    onToggle = () => {},
    title,
    description,
    action,
    children,
    onclick = () => {},
    onkeyup = () => {},
    ...rest
  }: Props = $props();

  const toggleAccordion = () => {
    open = !open;
    onToggle();
  };
</script>

<div class="w-full" {...rest}>
  <button
    id="{id}-trigger"
    aria-expanded={open}
    aria-controls="{id}-content"
    class="focus-visible:outline-interactive w-full cursor-pointer hover:bg-interactive-secondary-hover"
    type="button"
    onclick={toggleAccordion}
  >
    <div class="flex w-full flex-row items-center justify-between gap-2">
      {@render title?.()}
      {@render description?.()}
      <div
        class="flex flex-row items-center gap-2 pr-2"
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          onclick(e);
        }}
        onkeyup={(e: KeyboardEvent) => {
          e.stopPropagation();
          onkeyup(e);
        }}
        role="none"
      >
        {@render action?.()}
        <Icon class="m-2" name={open ? 'arrow-down' : 'arrow-right'} />
      </div>
    </div>
  </button>
  <div
    id="{id}-content"
    aria-labelledby="{id}-trigger"
    role="textbox"
    class="block w-full bg-primary p-2"
    class:hidden={!open}
    transition:slide
  >
    {@render children?.({ open })}
  </div>
</div>
