<script lang="ts">
  import {
    DetailListLabel,
    DetailListTimestampValue,
  } from '$lib/components/detail-list';

  interface Props {
    label: string;
    value: string | number;
  }

  let { label, value }: Props = $props();
</script>

<DetailListLabel class="font-medium text-secondary">{label}</DetailListLabel>
<DetailListTimestampValue timestamp={value} />
