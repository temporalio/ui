<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { IconChevronDown, IconChevronUp } from '$lib/io/icon';
  import type { CommonError } from '$lib/types/common-errors';

  import { severityStyles } from './common-error-severity';

  interface Props {
    error: CommonError;
    open?: boolean;
    onToggle?: () => void;
    class?: string;
    'data-testid'?: string;
  }

  let {
    error,
    open = false,
    onToggle,
    class: className = '',
    ...rest
  }: Props = $props();

  const id = $props.id();

  const style = $derived(severityStyles[error.severity]);
  const Icon = $derived(style.Icon);
  const Chevron = $derived(open ? IconChevronUp : IconChevronDown);
</script>

<div
  class="border-l-4 border-t-primary {style.borderClass} {className}"
  {...rest}
>
  <button
    id="{id}-trigger"
    aria-controls="{id}-content"
    aria-expanded={open}
    class="flex w-full items-center gap-2 p-3 text-left hover:bg-interactive-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary"
    type="button"
    onclick={onToggle}
  >
    <Icon class="shrink-0 {style.iconClass}" />
    <span class="body-medium shrink-0">{error.title}</span>
    <span
      class="body-normal line-clamp-1 min-w-0 flex-1 text-secondary max-sm:hidden"
      class:invisible={open}
    >
      {error.description}
    </span>
    <Chevron class="ml-auto shrink-0" />
  </button>
  <div
    id="{id}-content"
    aria-labelledby="{id}-trigger"
    class="flex flex-col items-start gap-2 py-4 pl-11 pr-4 text-sm"
    class:hidden={!open}
  >
    <p>{error.description}</p>
    <Link href={error.link} newTab>{error.action} →</Link>
  </div>
</div>
