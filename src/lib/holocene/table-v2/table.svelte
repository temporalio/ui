<script lang="ts">
  import { onMount } from 'svelte';
  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  export let variant: 'simple' | 'fancy' = 'fancy';
  export let updating = false;
  export let id: string = null;
  export let columns: Array<{
    path: string;
    width?: number;
    resize?: boolean;
  }> = [];

  let className = '';
  export { className as class };

  let table: HTMLTableElement;
  let tableContainer: HTMLDivElement;
  let headers: Array<{ header: HTMLTableCellElement; size: string }> = [];
  let headerBeingResized: HTMLTableCellElement;

  const onMouseMove = (e: MouseEvent) =>
    requestAnimationFrame(() => {
      if (headerBeingResized) {
        const horizontalScrollOffset = tableContainer?.scrollLeft;
        const offsetLeft =
          tableContainer?.offsetParent?.offsetLeft +
          headerBeingResized?.offsetLeft;
        const width = horizontalScrollOffset + e.clientX - offsetLeft;
        const column = headers.find(
          ({ header }) => header === headerBeingResized,
        );

        column.size = Math.max(50, width) + 'px';

        for (let i = headers.length - 1; i >= 0; i--) {
          const header = headers[i];
          const hasResizer = header.header?.querySelector('.resizer');
          if (hasResizer) {
            // always set last sizable column to auto so the headers always take up the full table width
            header.size = 'auto';
            break;
          }
        }

        updateTableColumns();
      }
    });

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    headerBeingResized.classList.remove('header-resizing');
    headerBeingResized = null;
  };

  const initializeResize = ({ target }) => {
    headerBeingResized = target.parentNode;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    headerBeingResized.classList.add('header-resizing');
  };

  const updateTableColumns = () => {
    table.style.gridTemplateColumns = headers.map(({ size }) => size).join(' ');
  };

  onMount(() => {
    const tableHeaderCells = table.querySelectorAll('th');
    tableHeaderCells.forEach((header: HTMLTableCellElement, i: number) => {
      const width = columns[i]?.width;
      const resize = columns[i]?.resize ?? true;
      if (resize && i !== tableHeaderCells?.length - 1) {
        const resizer = document.createElement('span');
        resizer.className = 'resizer';
        resizer.addEventListener('mousedown', initializeResize);
        header.appendChild(resizer);
      }
      headers[i] = {
        header,
        size: width ? `${width}px` : 'auto',
      };

      updateTableColumns();
    });
  });
</script>

<div bind:this={tableContainer} class="table-container {variant}">
  <table class="{variant} {className}" {id} bind:this={table}>
    <thead>
      <slot name="headers" />
      {#if updating}
        <tr>
          <td
            class="z-50 p-0"
            style="grid-column: span {headers.length} / span {headers.length};"
          >
            <ProgressBar />
          </td>
        </tr>
      {/if}
    </thead>
    <tbody>
      <slot />
    </tbody>
  </table>
</div>

<style lang="postcss">
  .table-container.fancy {
    @apply relative max-w-full overflow-x-scroll rounded-xl border-3 border-gray-900 bg-white;
  }

  table {
    @apply grid w-fit min-w-full flex-1 border-collapse;

    :global(.row),
    :global(tr) {
      @apply contents;
    }

    thead {
      @apply contents;

      :global(th) {
        @apply relative text-left font-secondary text-sm font-medium;
      }
    }

    tbody {
      @apply contents;

      :global(td) {
        @apply overflow-hidden text-left text-sm;
      }
    }
  }

  table.fancy {
    @apply border-separate border-spacing-0;

    thead {
      :global(th) {
        @apply bg-gray-900 px-1 py-2 text-gray-100;
      }

      :global(span.resizer) {
        @apply absolute top-0 right-0 bottom-0 w-[3px] bg-white opacity-0;
      }

      :global(.header-resizing > span.resizer),
      :global(span.resizer):hover {
        @apply cursor-col-resize  opacity-50;
      }
    }

    tbody :global {
      td {
        @apply border-t border-t-gray-900 px-1 py-2 text-sm;
      }
    }
  }

  table.simple {
    thead :global(th) {
      @apply border-b border-primary py-2;
    }

    tbody :global(td) {
      @apply border-b border-gray-900 py-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
</style>
