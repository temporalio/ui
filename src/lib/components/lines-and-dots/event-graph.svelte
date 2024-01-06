<script lang="ts">
  import { VisGraph, VisSingleContainer } from '@unovis/svelte';
  import { GraphLayoutType, GraphNodeShape } from '@unovis/ts';

  import type { WorkflowEvents } from '$lib/types/events';

  import { getLinks, getNodes, type LinkDatum, type NodeDatum } from './data';

  export let history: WorkflowEvents;

  const layoutType = GraphLayoutType.Parallel;
  const nodeLabel = () => '';
  const nodeShape = (n: NodeDatum) => n.shape as GraphNodeShape;
  const nodeStroke = (l: LinkDatum) => l.color;
  const linkFlow = (l: LinkDatum) => l.active;
  const linkStroke = (l: LinkDatum) => l.color;

  const nodes = getNodes(history);
  const links = getLinks(history);
  const data = { nodes, links };
</script>

<VisSingleContainer {data} height={1200}>
  <VisGraph
    zoomScaleExtent={[0.1, 2]}
    {layoutType}
    {nodeLabel}
    {nodeShape}
    {nodeStroke}
    {linkFlow}
    {linkStroke}
    layoutParallelNodesPerColumn={10000}
  />
</VisSingleContainer>
