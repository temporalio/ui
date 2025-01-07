<script lang="ts">
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import ContinueAsNewNode from './continue-as-new-node.svelte';

  export let namespace: string;
  export let workflowId: string;
  export let first: string;
  export let previous: string;
  export let current: string;
  export let next: string;

  const span = 500;
  const x = first ? 200 : 0;
</script>

<div class="-mt-4 flex flex-col bg-primary">
  <div class="w-full overflow-hidden bg-primary">
    <ZoomSvg
      initialZoom={2}
      maxZoomOut={2.5}
      maxZoomIn={0.25}
      containerHeight={400}
      zoomable={false}
      pannable={false}
    >
      {#if first}
        <ContinueAsNewNode
          {x}
          y={200}
          {span}
          label={translate('workflows.first-execution')}
          value={first}
          href={routeForEventHistory({
            namespace,
            workflow: workflowId,
            run: first,
          })}
          dash
        />
      {/if}
      {#if previous}
        <ContinueAsNewNode
          x={x + span}
          y={200}
          {span}
          label={translate('workflows.previous-execution')}
          value={first}
          href={routeForEventHistory({
            namespace,
            workflow: workflowId,
            run: previous,
          })}
        />
      {/if}
      <ContinueAsNewNode
        x={first ? x + 2 * span : x + span}
        y={200}
        {span}
        label="Current"
        value={current}
        href={routeForEventHistory({
          namespace,
          workflow: workflowId,
          run: current,
        })}
      />
      {#if next}
        <ContinueAsNewNode
          x={first ? x + 3 * span : x + 2 * span}
          y={200}
          span={0}
          label={translate('workflows.next-execution')}
          value={next}
          href={routeForEventHistory({
            namespace,
            workflow: workflowId,
            run: next,
          })}
        />
      {/if}
    </ZoomSvg>
  </div>
</div>

<style lang="postcss">
  .ContinuedAsNew {
    @apply fill-green-200;
  }
</style>
