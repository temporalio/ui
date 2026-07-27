<script lang="ts">
  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  import { DetailList, DetailListColumn } from '../detail-list';
</script>

<div class="space-y-2">
  <div class="flex items-center gap-4 max-xl:w-full max-xl:flex-wrap">
    <Skeleton class="h-5 w-20 rounded-sm" />
    <Skeleton class="h-8 w-72 rounded-sm" />
    <div class="ml-auto flex items-center gap-2">
      <Skeleton class="h-7 w-36 rounded-sm" />
      <Skeleton class="h-7 w-28 rounded-sm" />
    </div>
  </div>

  <DetailList aria-label="nexus operation loading" rowCount={4}>
    <DetailListColumn>
      <Skeleton class="h-4 w-28 rounded-sm" />
      <Skeleton class="h-4 w-36 rounded-sm" />
      <Skeleton class="h-4 w-24 rounded-sm" />
      <Skeleton class="h-4 w-32 rounded-sm" />
      <Skeleton class="h-4 w-32 rounded-sm" />
      <Skeleton class="h-4 w-20 rounded-sm" />
      <Skeleton class="h-4 w-28 rounded-sm" />
      <Skeleton class="h-4 w-10 rounded-sm" />
    </DetailListColumn>
    <DetailListColumn>
      <Skeleton class="h-4 w-16 rounded-sm" />
      <Skeleton class="h-4 w-64 rounded-sm" />
      <Skeleton class="h-4 w-20 rounded-sm" />
      <Skeleton class="h-4 w-40 rounded-sm" />
      <Skeleton class="h-4 w-16 rounded-sm" />
      <Skeleton class="h-4 w-32 rounded-sm" />
      <Skeleton class="h-4 w-20 rounded-sm" />
      <Skeleton class="h-4 w-36 rounded-sm" />
    </DetailListColumn>
  </DetailList>
</div>
