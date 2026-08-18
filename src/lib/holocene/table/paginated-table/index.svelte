<script lang="ts" generics="Item">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import { getPaginatedTableMaxHeight } from './context';

  interface Props extends Omit<HTMLAttributes<HTMLTableElement>, 'class'> {
    visibleItems: Item[];
    loading?: boolean;
    updating?: boolean;
    maxHeight?: string;
    fixed?: boolean;
    stickyHeader?: boolean;
    stickyHeaderOffset?: string;
    stickyActions?: boolean;
    class?: ClassNameValue;
    caption?: Snippet;
    headers?: Snippet<[{ visibleItems: Item[] }]>;
    children?: Snippet;
    loadingContent?: Snippet;
    actionsStart?: Snippet;
    actionsCenter?: Snippet;
    actionsEnd?: Snippet;
    empty?: Snippet;
  }

  let {
    visibleItems,
    loading = false,
    updating = false,
    maxHeight = '',
    fixed = false,
    stickyHeader = false,
    stickyHeaderOffset = 'var(--scroll-inset-top, 0px)',
    stickyActions = false,
    class: className = '',
    caption,
    headers,
    children,
    loadingContent,
    actionsStart,
    actionsCenter,
    actionsEnd,
    empty,
    ...rest
  }: Props = $props();

  const contextMaxHeight = getPaginatedTableMaxHeight();

  let tableBox = $state<HTMLDivElement>();
  let tableContainer = $state<HTMLDivElement>();
  let actionsHeight = $state(0);

  let floatingHeader = $state<HTMLDivElement>();
  let tableInView = $state(false);
  let headerFloating = $state(false);
  let headerGeometry = $state({
    left: 0,
    width: 0,
    scrollLeft: 0,
    tableWidth: 0,
  });
  let columnWidths = $state<number[]>([]);

  const tableOffset = $derived(
    tableContainer?.offsetTop ? tableContainer.offsetTop + 32 : 0,
  );

  const showActions = $derived(visibleItems.length > 0);
  const actionsFloating = $derived(stickyActions && headerFloating);
  const floatingHeaderTop = $derived(
    stickyActions
      ? `calc(${stickyHeaderOffset} + ${actionsHeight}px)`
      : stickyHeaderOffset,
  );

  const containerStyle = $derived.by(() => {
    if (stickyHeader) {
      return `scroll-margin-top: ${stickyHeaderOffset};`;
    }

    const height =
      maxHeight || contextMaxHeight || `calc(100vh - ${tableOffset}px)`;
    return `max-height: ${height};`;
  });

  function updateFloatingHeader() {
    const table = tableContainer?.querySelector('table');
    const header = table?.querySelector('thead');
    if (loading || !tableBox || !tableContainer || !table || !header) {
      headerFloating = false;
      return;
    }

    const offset = parseFloat(getComputedStyle(tableBox).scrollMarginTop) || 0;
    const containerRect = tableBox.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    const headerHeight = header.getBoundingClientRect().height;

    const headerTop = offset + (stickyActions ? actionsHeight : 0);
    headerFloating =
      containerRect.top < offset && tableRect.bottom > headerTop + headerHeight;

    if (!headerFloating) {
      return;
    }

    headerGeometry = {
      left: containerRect.left,
      width: containerRect.width,
      scrollLeft: tableContainer.scrollLeft,
      tableWidth: table.offsetWidth,
    };

    const cells = header.querySelectorAll<HTMLElement>('tr > th');
    columnWidths = Array.from(
      cells,
      (cell) => cell.getBoundingClientRect().width,
    );
  }

  $effect(() => {
    if (!stickyHeader || !tableBox) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      tableInView = entry.isIntersecting;
    });

    observer.observe(tableBox);

    return () => observer.disconnect();
  });

  $effect(() => {
    if (!tableInView || !tableBox) {
      headerFloating = false;
      return;
    }

    updateFloatingHeader();

    const resizeObserver = new ResizeObserver(updateFloatingHeader);
    resizeObserver.observe(tableBox);
    window.addEventListener('scroll', updateFloatingHeader, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', updateFloatingHeader);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateFloatingHeader, {
        capture: true,
      });
      window.removeEventListener('resize', updateFloatingHeader);
    };
  });

  $effect(() => {
    void visibleItems;
    void loading;
    if (tableInView) {
      updateFloatingHeader();
    }
  });

  $effect(() => {
    if (!floatingHeader || !columnWidths.length) {
      return;
    }

    const cells =
      floatingHeader.querySelectorAll<HTMLElement>('thead > tr > th');
    cells.forEach((cell, index) => {
      const width = columnWidths[index];
      if (width === undefined) {
        return;
      }
      cell.style.width = `${width}px`;
    });
  });

  export function scrollToTop() {
    if (stickyHeader) {
      tableBox?.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }

    tableContainer?.scrollTo({ top: 0, behavior: 'instant' });
  }
</script>

{#snippet tableHeaders()}
  {@render headers?.({ visibleItems })}
{/snippet}

{#snippet actionsBar()}
  <div
    class={merge(
      'surface-primary flex w-full shrink-0 items-center justify-between gap-2 border-subtle px-4 py-2',
      stickyActions ? 'border-b' : 'border-t',
      actionsFloating && 'border-x border-t',
    )}
    style={actionsFloating
      ? `position: fixed; z-index: 20; top: ${stickyHeaderOffset}; left: ${headerGeometry.left}px; width: ${headerGeometry.width}px;`
      : undefined}
    bind:offsetHeight={actionsHeight}
  >
    {@render actionsStart?.()}
    {@render actionsCenter?.()}
    {@render actionsEnd?.()}
  </div>
{/snippet}

<div
  class={merge(
    'surface-primary flex min-h-[154px] grow flex-col border border-subtle',
    className,
  )}
  bind:this={tableBox}
  style={containerStyle}
>
  {#if stickyActions}
    {#if loading}
      <div
        class="flex w-full shrink-0 items-center justify-between gap-2 border-b border-subtle px-4 py-2"
      >
        <Skeleton class="h-6 w-28" />
        <Skeleton class="h-6 w-52" />
      </div>
    {:else if showActions}
      <div
        class="shrink-0"
        style={actionsFloating ? `height: ${actionsHeight}px;` : undefined}
      >
        {@render actionsBar()}
      </div>
    {/if}
  {/if}

  <div
    class="min-h-0 grow overflow-auto"
    id="{rest['id']}-container"
    bind:this={tableContainer}
    style="scroll-padding-top: var(--table-header-h, 2.25rem);
    --table-header-h: 2.25rem;"
  >
    {#if loading}
      {#if loadingContent}
        {@render loadingContent()}
      {:else}
        <SkeletonTable bordered={false} rows={25} />
      {/if}
    {:else}
      <Table
        bordered={false}
        {updating}
        {fixed}
        {caption}
        headers={tableHeaders}
        {...rest}
      >
        {@render children?.()}
      </Table>
      {#if !showActions}
        <div style="height: calc(100% - var(--table-header-h));">
          {@render empty?.()}
        </div>
      {/if}
    {/if}
  </div>

  {#if !loading && showActions && !stickyActions}
    {@render actionsBar()}
  {/if}
</div>

{#if headerFloating}
  <div
    class={merge(
      'fixed z-20 overflow-hidden border-x border-subtle',
      !stickyActions && 'border-t',
    )}
    style="top: {floatingHeaderTop}; left: {headerGeometry.left}px; width: {headerGeometry.width}px;"
    bind:this={floatingHeader}
  >
    <div style="transform: translateX(-{headerGeometry.scrollLeft}px);">
      <Table
        bordered={false}
        fixed
        headers={tableHeaders}
        style="width: {headerGeometry.tableWidth}px;"
      />
    </div>
  </div>
{/if}
