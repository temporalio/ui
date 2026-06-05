<script lang="ts">
  import type { Component } from 'svelte';

  import type { Payload } from '$lib/types';
  import {
    describeNexusOperation,
    type NexusEmbeddedOperationKind,
    type NexusOperationDescriptor,
  } from '$lib/utilities/nexus-operation-registry';

  import DefaultRenderer from './system-nexus/default-renderer.svelte';
  import SignalWithStartRenderer from './system-nexus/signal-with-start-renderer.svelte';

  interface Props {
    payload: Payload;
    maxHeight?: number;
  }

  let { payload, maxHeight }: Props = $props();

  type RendererProps = {
    descriptor: NexusOperationDescriptor;
    maxHeight?: number;
  };

  const RENDERERS: Partial<
    Record<NexusEmbeddedOperationKind, Component<RendererProps>>
  > = {
    'signal-with-start-workflow': SignalWithStartRenderer,
  };

  const descriptor: NexusOperationDescriptor | null = $derived(
    describeNexusOperation(payload),
  );

  const Renderer = $derived(
    descriptor ? (RENDERERS[descriptor.kind] ?? DefaultRenderer) : null,
  );
</script>

{#if descriptor && Renderer}
  <Renderer {descriptor} {maxHeight} />
{/if}
