<script lang="ts">
  import { type Snippet } from 'svelte';

  import { setViewportContext } from './context';

  import { ViewportModel } from './model.svelte';

  interface Props {
    viewportHeight?: number;
    startTimeMs: number;
    endTimeMs: number;
    children: Snippet<[{ viewportModel: ViewportModel }]>;
  }

  const {
    viewportHeight = 0,
    startTimeMs,
    endTimeMs,
    children,
  }: Props = $props();

  const viewportModel = new ViewportModel({
    startTimeMs: 0,
    endTimeMs: 0,
    widthPx: 0,
    heightPx: 0,
  });

  let canvasWidthPx = $state(0);
  $effect(() => viewportModel.setSize(canvasWidthPx, viewportHeight));
  $effect(() => viewportModel.setTimespan(startTimeMs, endTimeMs));

  setViewportContext(viewportModel);
</script>

<div bind:clientWidth={canvasWidthPx}>
  {@render children({ viewportModel })}
</div>
