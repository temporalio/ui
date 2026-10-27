<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import type { AnatomyPart, AnatomySide } from '../data/markdown';

  import SourceCode from './source-code.svelte';

  let { parts, preview }: { parts: AnatomyPart[]; preview: Snippet } = $props();

  interface FlatPart {
    number: number;
    depth: number;
    name: string;
    description: string;
    selector?: string;
    side?: AnatomySide;
  }

  interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  interface Callout {
    number: number;
    name: string;
    side: AnatomySide;
    x: number;
    y: number;
    path: string;
    rect: Box;
    isRoot: boolean;
  }

  const GAP = 32;
  const ROW = 26;
  const PAD_Y = 72;
  const OUTLINE = 8;

  const flat = $derived.by(() => {
    const out: FlatPart[] = [];
    let count = 0;
    const walk = (items: AnatomyPart[], depth: number) =>
      items.forEach((part) => {
        out.push({ ...part, number: ++count, depth });
        walk(part.children, depth + 1);
      });
    walk(parts, 0);
    return out;
  });

  const labelWidth = (name: string) => name.length * 7.2 + 4;

  const gutter = $derived(
    Math.min(
      Math.max(
        ...flat
          .filter((part) => part.selector)
          .map((part) => labelWidth(part.name) + 56),
        104,
      ),
      184,
    ),
  );

  let figure = $state<HTMLElement>();
  let stage = $state<HTMLElement>();
  let callouts = $state<Callout[]>([]);
  let outline = $state<Box | null>(null);
  let wide = $state(true);
  let zoom = $state(1);
  let active = $state<number | null>(null);
  let structure = $state('');

  const activePart = $derived(flat.find((part) => part.number === active));
  const shownPart = $derived(activePart ?? flat[0]);
  const calloutNumbers = $derived(
    new Set(callouts.map((callout) => callout.number)),
  );
  const mappedParts = $derived(
    calloutNumbers.size
      ? flat.filter((part) => calloutNumbers.has(part.number))
      : flat,
  );

  interface StructureNode {
    name: string;
    children: StructureNode[];
  }

  const pascal = (value: string) =>
    value.replace(/(^|-)([a-z0-9])/g, (_, __, letter: string) =>
      letter.toUpperCase(),
    );

  function buildStructure(container: Element) {
    const walk = (element: Element, out: StructureNode[]) => {
      for (const child of element.children) {
        const scope = child.getAttribute('data-scope');
        const part = child.getAttribute('data-part');
        if (scope && part) {
          const node = {
            name: `${pascal(scope)}.${pascal(part)}`,
            children: [],
          };
          out.push(node);
          walk(child, node.children);
        } else {
          walk(child, out);
        }
      }
    };
    const merge = (nodes: StructureNode[]): StructureNode[] => {
      const byName: Record<string, StructureNode> = {};
      const order: string[] = [];
      for (const node of nodes) {
        const existing = byName[node.name];
        if (existing) {
          existing.children.push(...node.children);
        } else {
          byName[node.name] = { ...node, children: [...node.children] };
          order.push(node.name);
        }
      }
      return order.map((name) => ({
        ...byName[name],
        children: merge(byName[name].children),
      }));
    };
    const print = (nodes: StructureNode[], depth: number): string[] =>
      nodes.flatMap((node) => {
        const indent = '  '.repeat(depth);
        if (!node.children.length) return [`${indent}<${node.name} />`];
        return [
          `${indent}<${node.name}>`,
          ...print(node.children, depth + 1),
          `${indent}</${node.name}>`,
        ];
      });
    const roots: StructureNode[] = [];
    walk(container, roots);
    return print(merge(roots), 0).join('\n');
  }

  const toSelector = (selector: string) =>
    /^[a-z][a-z0-9-]*$/.test(selector) ? `[data-part="${selector}"]` : selector;

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));

  function autoSide(rect: Box, root: Box): AnatomySide {
    const cx = rect.x + rect.w / 2;
    if (rect.w > root.w * 0.6) {
      if (rect.y - root.y < root.h * 0.25) return 'top';
      if (root.y + root.h - (rect.y + rect.h) < root.h * 0.25) return 'bottom';
      return 'right';
    }
    return cx < root.x + root.w / 2 ? 'left' : 'right';
  }

  function measure() {
    if (!figure || !stage) return;
    const origin = figure.getBoundingClientRect();
    wide = origin.width >= gutter * 2 + 240;
    const boxOf = (element: Element): Box => {
      const r = element.getBoundingClientRect();
      return {
        x: r.left - origin.left,
        y: r.top - origin.top,
        w: r.width,
        h: r.height,
      };
    };

    const [rootPart, ...rest] = flat;
    const rootElement =
      (rootPart?.selector &&
        stage.querySelector(toSelector(rootPart.selector))) ||
      stage.firstElementChild;
    if (!rootPart || !rootElement) return;
    const root = boxOf(rootElement);
    const naturalWidth = root.w / zoom;
    const nextZoom = naturalWidth < 160 ? 1.5 : naturalWidth < 280 ? 1.25 : 1;
    if (nextZoom !== zoom) {
      zoom = nextZoom;
      schedule();
      return;
    }
    outline = {
      x: root.x - OUTLINE,
      y: root.y - OUTLINE,
      w: root.w + OUTLINE * 2,
      h: root.h + OUTLINE * 2,
    };
    const content = stage.firstElementChild
      ? boxOf(stage.firstElementChild)
      : outline;
    const frameX = Math.min(outline.x, content.x);
    const frameY = Math.min(outline.y, content.y);
    const frame = {
      x: frameX,
      y: frameY,
      w: Math.max(outline.x + outline.w, content.x + content.w) - frameX,
      h: Math.max(outline.y + outline.h, content.y + content.h) - frameY,
    };
    const maxLabel = gutter - 56;
    const gapX = clamp((origin.width - frame.w) / 2 - maxLabel - 12, GAP, 96);

    const placed: Callout[] = [];
    const bySide: Record<AnatomySide, (Callout & { want: number })[]> = {
      top: [],
      right: [],
      bottom: [],
      left: [],
    };

    for (const part of rest) {
      if (!part.selector) continue;
      const element = stage.querySelector(toSelector(part.selector));
      if (!element) continue;
      const rect = boxOf(element);
      if (rect.w < 2 && rect.h < 2) continue;
      const side = part.side ?? autoSide(rect, root);
      const want =
        side === 'left' || side === 'right'
          ? rect.y + rect.h / 2
          : rect.x + rect.w / 2;
      bySide[side].push({
        number: part.number,
        name: part.name,
        side,
        x: 0,
        y: 0,
        path: '',
        rect,
        isRoot: false,
        want,
      });
    }

    const rootLabelX = outline.x + Math.min(outline.w * 0.3, 120);
    bySide.top.push({
      number: rootPart.number,
      name: rootPart.name,
      side: 'top',
      x: 0,
      y: 0,
      path: '',
      rect: root,
      isRoot: true,
      want: rootLabelX,
    });

    for (const side of ['left', 'right'] as const) {
      const items = bySide[side].sort((a, b) => a.want - b.want);
      let previous = -Infinity;
      for (const item of items) {
        item.y = Math.max(item.want, previous + ROW);
        previous = item.y;
        item.x = side === 'left' ? frame.x - gapX : frame.x + frame.w + gapX;
        const r = item.rect;
        const bracket = r.h >= 40;
        const startX = side === 'left' ? item.x + 8 : item.x - 8;
        if (bracket) {
          const bx =
            side === 'left'
              ? Math.min(r.x, frame.x) - 12
              : Math.max(r.x + r.w, frame.x + frame.w) + 12;
          const tick = side === 'left' ? 6 : -6;
          const ty = clamp(item.y, r.y, r.y + r.h);
          const lead =
            Math.abs(ty - item.y) < 1
              ? `M${startX} ${item.y}H${bx}`
              : `M${startX} ${item.y}H${(startX + bx) / 2}V${ty}H${bx}`;
          item.path = `${lead}M${bx + tick} ${r.y}H${bx}V${r.y + r.h}H${bx + tick}`;
        } else {
          const tx = side === 'left' ? r.x : r.x + r.w;
          const ty = clamp(item.y, r.y + 3, r.y + r.h - 3);
          item.path =
            Math.abs(ty - item.y) < 1
              ? `M${startX} ${item.y}H${tx}`
              : `M${startX} ${item.y}H${(startX + tx) / 2}V${ty}H${tx}`;
        }
        placed.push(item);
      }
    }

    for (const side of ['top', 'bottom'] as const) {
      const items = bySide[side].sort((a, b) => a.want - b.want);
      let previousRight = -Infinity;
      for (const item of items) {
        const half = labelWidth(item.name) / 2;
        item.x = Math.max(item.want, previousRight + 16 + half);
        previousRight = item.x + half;
        item.y = side === 'top' ? frame.y - GAP : frame.y + frame.h + GAP;
        const startY = side === 'top' ? item.y + 6 : item.y - 6;
        if (item.isRoot) {
          item.path = `M${item.x} ${startY}V${outline.y}`;
        } else {
          const r = item.rect;
          const tx = clamp(item.x, r.x + 4, r.x + r.w - 4);
          const ty = side === 'top' ? r.y : r.y + r.h;
          item.path =
            Math.abs(tx - item.x) < 1
              ? `M${item.x} ${startY}V${ty}`
              : `M${item.x} ${startY}V${(startY + ty) / 2}H${tx}V${ty}`;
        }
        placed.push(item);
      }
    }

    callouts = placed;
    structure = buildStructure(stage);
  }

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };

  onMount(() => {
    schedule();
    const resize = new ResizeObserver(schedule);
    if (figure) resize.observe(figure);
    if (stage) resize.observe(stage);
    const mutation = new MutationObserver(schedule);
    if (stage)
      mutation.observe(stage, {
        subtree: true,
        childList: true,
        attributes: true,
      });
    document.fonts?.ready.then(schedule);
    const retries = [150, 600, 1500].map((delay) =>
      setTimeout(schedule, delay),
    );
    const visibility = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) schedule();
    });
    if (figure) visibility.observe(figure);
    return () => {
      retries.forEach(clearTimeout);
      visibility.disconnect();
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  });

  const labelTransform: Record<AnatomySide, string> = {
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)',
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
  };
</script>

{#snippet partButton(part: FlatPart)}
  <button
    type="button"
    class="w-full rounded px-3 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary {active ===
    part.number
      ? 'bg-surface-tertiary text-primary'
      : 'text-primary hover:bg-surface-tertiary'}"
    aria-pressed={active === part.number}
    onpointerenter={() => (active = part.number)}
    onpointerleave={() => (active = null)}
    onfocus={() => (active = part.number)}
    onblur={() => (active = null)}
  >
    {#if !wide}<span
        class="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-tertiary px-1 font-mono text-[11px] leading-none"
        aria-hidden="true">{part.number}</span
      >{/if}{part.name}
  </button>
{/snippet}

<div class="not-prose space-y-4">
  <figure
    class="grid overflow-hidden rounded-lg border border-primary bg-surface-secondary lg:grid-cols-[minmax(0,1fr)_196px]"
  >
    <div
      bind:this={figure}
      class="relative min-w-0"
      style:padding="{PAD_Y}px {wide ? gutter : 24}px"
    >
      <div class="flex justify-center">
        <div
          bind:this={stage}
          inert
          class="relative flex w-full max-w-[460px] justify-center [transform:translateZ(0)]"
          style:zoom={zoom === 1 ? undefined : zoom}
        >
          {@render preview()}
        </div>
      </div>
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {#if outline}
          <rect
            x={outline.x}
            y={outline.y}
            width={outline.w}
            height={outline.h}
            rx="6"
            fill="none"
            class="stroke-[color:var(--color-content-secondary)] transition-opacity"
            stroke-width="1.25"
            stroke-dasharray="2 3"
            opacity={active !== null && active !== flat[0]?.number ? 0.35 : 1}
          />
        {/if}
        {#each callouts as callout (callout.number)}
          {@const highlighted = active === callout.number}
          {@const dimmed = active !== null && !highlighted}
          {#if highlighted && !callout.isRoot}
            <rect
              x={callout.rect.x - 3}
              y={callout.rect.y - 3}
              width={callout.rect.w + 6}
              height={callout.rect.h + 6}
              rx="4"
              fill="none"
              class="stroke-[color:var(--color-content-primary)]"
              stroke-width="1.5"
            />
          {/if}
          {#if wide}
            <path
              d={callout.path}
              fill="none"
              stroke-width="1.25"
              stroke-dasharray={callout.isRoot ? '2 3' : undefined}
              opacity={dimmed ? 0.35 : 1}
              class="transition-opacity {highlighted
                ? 'stroke-[color:var(--color-content-primary)]'
                : 'stroke-[color:var(--color-content-secondary)]'}"
            />
          {/if}
        {/each}
      </svg>
      {#each callouts as callout (callout.number)}
        {#if wide}
          <span
            role="presentation"
            class="absolute whitespace-nowrap px-1 text-sm transition-colors {active ===
              null || active === callout.number
              ? 'text-primary'
              : 'text-tertiary'}"
            style:left="{callout.x}px"
            style:top="{callout.y}px"
            style:transform={labelTransform[callout.side]}
            onpointerenter={() => (active = callout.number)}
            onpointerleave={() => (active = null)}>{callout.name}</span
          >
        {:else if !callout.isRoot}
          <span
            aria-hidden="true"
            class="absolute flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[11px] font-medium leading-none {active ===
            callout.number
              ? 'bg-interactive-primary text-white'
              : 'bg-content-primary text-inverse-primary'}"
            style:left="{callout.rect.x - 6}px"
            style:top="{callout.rect.y - 6}px">{callout.number}</span
          >
        {/if}
      {/each}
    </div>
    <div
      class="min-w-0 border-t border-primary p-4 lg:border-l lg:border-t-0 lg:py-8"
    >
      <ul class="flex flex-col gap-1" aria-label="Parts">
        {#each mappedParts as part (part.number)}
          <li>{@render partButton(part)}</li>
        {/each}
      </ul>
    </div>
    <figcaption
      class="grid border-t border-primary px-6 py-4 lg:col-span-2"
      aria-hidden="true"
    >
      {#each mappedParts as part (part.number)}
        <div
          class="[grid-area:1/1] {part.number === shownPart?.number
            ? 'visible'
            : 'invisible'}"
        >
          <p class="text-sm font-medium text-primary">{part.name}</p>
          <p class="text-sm leading-relaxed text-secondary">
            {part.description}
          </p>
        </div>
      {/each}
    </figcaption>
  </figure>
  <p class="sr-only" aria-live="polite">
    {#if activePart}{activePart.name}: {activePart.description}{/if}
  </p>
  {#if structure}
    <SourceCode code={structure} filename="Structure" />
  {/if}
</div>
