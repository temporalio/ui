<script lang="ts">
  import type { AnatomyPart } from '../data/markdown';

  let { parts }: { parts: AnatomyPart[] } = $props();

  interface NumberedPart extends AnatomyPart {
    number: number;
    depth: number;
    children: NumberedPart[];
  }

  const numbered = $derived.by(() => {
    let count = 0;
    const visit = (items: AnatomyPart[], depth: number): NumberedPart[] =>
      items.map((part) => {
        const number = ++count;
        return {
          ...part,
          number,
          depth,
          children: visit(part.children, depth + 1),
        };
      });
    return visit(parts, 0);
  });

  const flat = $derived.by(() => {
    const out: NumberedPart[] = [];
    const walk = (items: NumberedPart[]) =>
      items.forEach((part) => {
        out.push(part);
        walk(part.children);
      });
    walk(numbered);
    return out;
  });

  const rows = (items: NumberedPart[]) =>
    items.reduce<NumberedPart[][]>((out, part) => {
      const last = out.at(-1);
      if (part.children.length || !last || last[0].children.length) {
        out.push([part]);
      } else {
        last.push(part);
      }
      return out;
    }, []);

  let active = $state<number | null>(null);
</script>

{#snippet badge(part: NumberedPart)}
  <span
    class="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 font-mono text-[11px] font-medium leading-none transition-colors {active ===
    part.number
      ? 'bg-interactive-primary text-white'
      : 'bg-surface-tertiary text-primary'}"
    aria-hidden="true">{part.number}</span
  >
{/snippet}

{#snippet boxes(items: NumberedPart[])}
  <div class="flex min-w-0 flex-col gap-2">
    {#each rows(items) as row (row[0].number)}
      {#if row[0].children.length}
        {@render box(row[0])}
      {:else}
        <div class="flex min-w-0 flex-wrap gap-2 [&>*]:grow [&>*]:basis-28">
          {#each row as part (part.number)}
            {@render box(part)}
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{/snippet}

{#snippet box(part: NumberedPart)}
  <div
    role="presentation"
    onpointerenter={() => (active = part.number)}
    onpointerleave={() => (active = null)}
    class="flex min-w-0 max-w-full flex-col gap-2 rounded-md border border-dashed p-2.5 transition-colors {active ===
    part.number
      ? 'border-interactive-primary bg-interactive-secondary-hover'
      : part.depth % 2 === 0
        ? 'border-secondary bg-surface-primary'
        : 'border-secondary bg-surface-secondary'}"
  >
    <div class="flex items-center gap-2">
      {@render badge(part)}
      <span
        class="min-w-0 font-mono text-xs text-primary [overflow-wrap:anywhere]"
        >{part.name}</span
      >
    </div>
    {#if part.children.length}
      {@render boxes(part.children)}
    {/if}
  </div>
{/snippet}

<figure
  class="not-prose grid gap-6 rounded-lg border border-primary bg-surface-secondary p-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
>
  <div class="min-w-0" aria-hidden="true">
    {@render boxes(numbered)}
  </div>
  <figcaption class="min-w-0">
    <ol class="!ml-0 flex list-none flex-col gap-3">
      {#each flat as part (part.number)}
        <li
          class="!ml-0 flex gap-3 rounded p-1 transition-colors"
          class:bg-interactive-secondary-hover={active === part.number}
          onpointerenter={() => (active = part.number)}
          onpointerleave={() => (active = null)}
          style:padding-left="{part.depth * 0.75 + 0.25}rem"
        >
          {@render badge(part)}
          <span class="flex min-w-0 flex-col">
            <span class="font-mono text-xs font-medium text-primary"
              >{part.name}</span
            >
            {#if part.description}
              <span class="text-xs leading-relaxed text-secondary"
                >{part.description}</span
              >
            {/if}
          </span>
        </li>
      {/each}
    </ol>
  </figcaption>
</figure>
