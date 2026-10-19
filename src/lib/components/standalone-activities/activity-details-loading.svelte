<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  import { DetailList, DetailListColumn } from '../detail-list';
</script>

<div class="grid w-full grid-cols-2 gap-4 max-md:grid-cols-1">
  <div class="flex flex-col gap-2">
    <Skeleton class="h-5 w-12 rounded-xs" />
    <Skeleton class="h-32 rounded-md" />
  </div>
  <div class="flex flex-col gap-2">
    <Skeleton class="h-5 w-14 rounded-xs" />
    <Skeleton class="h-32 rounded-md" />
  </div>
</div>

<Card class="space-y-6">
  <Skeleton class="h-5 w-64 rounded-xs" />

  <div class="space-y-4">
    <Skeleton class="h-4 w-28 rounded-xs" />
    <DetailList
      aria-label="activity current state loading"
      rowCount={2}
      class="gap-y-4"
    >
      <DetailListColumn>
        <Skeleton class="h-4 w-24 rounded-xs" />
        <Skeleton class="h-4 w-20 rounded-xs" />
      </DetailListColumn>
      <DetailListColumn>
        <Skeleton class="h-4 w-32 rounded-xs" />
        <Skeleton class="h-4 w-28 rounded-xs" />
      </DetailListColumn>
    </DetailList>
  </div>

  <div class="space-y-4">
    <Skeleton class="h-4 w-40 rounded-xs" />
    <DetailList
      aria-label="activity timing and progress loading"
      rowCount={3}
      class="gap-y-4"
    >
      <DetailListColumn>
        <Skeleton class="h-4 w-28 rounded-xs" />
        <Skeleton class="h-4 w-40 rounded-xs" />
        <Skeleton class="h-4 w-32 rounded-xs" />
      </DetailListColumn>
      <DetailListColumn>
        <Skeleton class="h-4 w-36 rounded-xs" />
        <Skeleton class="h-4 w-24 rounded-xs" />
        <Skeleton class="h-4 w-40 rounded-xs" />
      </DetailListColumn>
    </DetailList>
  </div>

  <div class="space-y-4">
    <Skeleton class="h-4 w-48 rounded-xs" />
    <DetailList
      aria-label="activity timeout configuration loading"
      rowCount={3}
      class="gap-y-4"
    >
      <DetailListColumn>
        <Skeleton class="h-4 w-44 rounded-xs" />
        <Skeleton class="h-4 w-16 rounded-xs" />
        <Skeleton class="h-4 w-44 rounded-xs" />
      </DetailListColumn>
      <DetailListColumn>
        <Skeleton class="h-4 w-20 rounded-xs" />
        <Skeleton class="h-4 w-40 rounded-xs" />
        <Skeleton class="h-4 w-16 rounded-xs" />
      </DetailListColumn>
    </DetailList>
  </div>

  <div class="space-y-4">
    <Skeleton class="h-4 w-24 rounded-xs" />
    <DetailList
      aria-label="activity worker loading"
      rowCount={2}
      class="gap-y-4"
    >
      <DetailListColumn>
        <Skeleton class="h-4 w-28 rounded-xs" />
        <Skeleton class="h-4 w-48 rounded-xs" />
      </DetailListColumn>
      <DetailListColumn>
        <Skeleton class="h-4 w-40 rounded-xs" />
        <Skeleton class="h-4 w-56 rounded-xs" />
      </DetailListColumn>
    </DetailList>
  </div>
</Card>
