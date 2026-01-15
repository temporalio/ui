<script lang="ts">
  import {
    DetailListLabel,
    DetailListValue,
  } from '$lib/components/detail-list';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Failure } from '$lib/types';

  interface Props {
    label: string;
    value: Failure;
    inline?: boolean;
  }

  let { label, value, inline = false }: Props = $props();
</script>

<DetailListLabel class="font-medium text-secondary">{label}</DetailListLabel>
<DetailListValue>
  <CodeBlock {inline} content={JSON.stringify(value, undefined, 2)} />
</DetailListValue>
