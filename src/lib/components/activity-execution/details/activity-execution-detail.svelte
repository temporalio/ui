<script lang="ts">
  import {
    DetailListLabel,
    DetailListValue,
  } from '$lib/components/detail-list';

  interface Props {
    label: string;
    value: string;
  }

  let { label, value }: Props = $props();
</script>

<DetailListLabel class="font-medium text-secondary">{label}</DetailListLabel>
<DetailListValue>
  {value}
</DetailListValue>
