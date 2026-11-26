<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  import { DetailList, DetailListColumn } from '../detail-list';
</script>

<div class="grid w-full grid-cols-2 gap-4 max-md:grid-cols-1">
  <div class="flex flex-col gap-2">
    <Skeleton class="h-5 w-10 rounded-sm" />
    <Skeleton class="h-32 rounded-md" />
  </div>
  <div class="flex flex-col gap-2">
    <Skeleton class="h-5 w-12 rounded-sm" />
    <Skeleton class="h-32 rounded-md" />
  </div>
</div>

<Card class="space-y-6">
  <Skeleton class="h-5 w-52 rounded-sm" />

  <div class="space-y-4">
    <Skeleton class="h-4 w-28 rounded-sm" />
    <DetailList
      aria-label="nexus operation details loading"
      rowCount={4}
      class="gap-y-4"
    >
      <DetailListColumn>
        <Skeleton class="h-4 w-28 rounded-sm" />
        <Skeleton class="h-4 w-32 rounded-sm" />
        <Skeleton class="h-4 w-24 rounded-sm" />
        <Skeleton class="h-4 w-20 rounded-sm" />
      </DetailListColumn>
      <DetailListColumn>
        <Skeleton class="h-4 w-36 rounded-sm" />
        <Skeleton class="h-4 w-20 rounded-sm" />
        <Skeleton class="h-4 w-16 rounded-sm" />
        <Skeleton class="h-4 w-64 rounded-sm" />
      </DetailListColumn>
    </DetailList>
  </div>

  <div class="space-y-4">
    <Skeleton class="h-4 w-36 rounded-sm" />
    <DetailList
      aria-label="nexus operation details section loading"
      rowCount={3}
      class="gap-y-4"
    >
      <DetailListColumn>
        <Skeleton class="h-4 w-24 rounded-sm" />
        <Skeleton class="h-4 w-28 rounded-sm" />
        <Skeleton class="h-4 w-32 rounded-sm" />
      </DetailListColumn>
      <DetailListColumn>
        <Skeleton class="h-4 w-48 rounded-sm" />
        <Skeleton class="h-4 w-32 rounded-sm" />
        <Skeleton class="h-4 w-24 rounded-sm" />
      </DetailListColumn>
    </DetailList>
  </div>
</Card>
