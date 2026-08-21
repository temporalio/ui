<script lang="ts">
  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  import { DetailList, DetailListColumn } from '../detail-list';
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-start gap-4 max-xl:w-full max-xl:flex-wrap">
    <div class="flex items-center gap-4">
      <Skeleton class="h-8 w-24 rounded-sm" />
      <Skeleton class="h-8 w-80 rounded-sm" />
    </div>
    <div class="ml-auto flex items-center gap-2">
      <Skeleton class="h-7 w-28 rounded-sm" />
      <Skeleton class="h-7 w-24 rounded-sm" />
    </div>
  </div>

  <DetailList aria-label="activity execution loading" rowCount={4}>
    <DetailListColumn>
      <Skeleton class="h-4 w-16 rounded-sm" />
      <Skeleton class="h-4 w-40 rounded-sm" />
      <Skeleton class="h-4 w-28 rounded-sm" />
      <Skeleton class="h-4 w-40 rounded-sm" />
      <Skeleton class="h-4 w-12 rounded-sm" />
      <Skeleton class="h-4 w-36 rounded-sm" />
      <Skeleton class="h-4 w-20 rounded-sm" />
      <Skeleton class="h-4 w-16 rounded-sm" />
    </DetailListColumn>
    <DetailListColumn>
      <Skeleton class="h-4 w-16 rounded-sm" />
      <Skeleton class="h-4 w-64 rounded-sm" />
      <Skeleton class="h-4 w-28 rounded-sm" />
      <Skeleton class="h-4 w-48 rounded-sm" />
      <Skeleton class="h-4 w-24 rounded-sm" />
      <Skeleton class="h-4 w-40 rounded-sm" />
    </DetailListColumn>
    <DetailListColumn>
      <Skeleton class="h-4 w-32 rounded-sm" />
      <Skeleton class="h-4 w-12 rounded-sm" />
      <Skeleton class="h-4 w-12 rounded-sm" />
      <Skeleton class="h-4 w-28 rounded-sm" />
    </DetailListColumn>
  </DetailList>
</div>
