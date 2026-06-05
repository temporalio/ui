<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import type { NexusOperationDescriptor } from '$lib/utilities/nexus-operation-registry';

  interface Props {
    descriptor: NexusOperationDescriptor;
    maxHeight?: number;
  }

  let { descriptor, maxHeight }: Props = $props();
</script>

<PayloadCodeBlock value={descriptor.embeddedInput} {maxHeight} />
