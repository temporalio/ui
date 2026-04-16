<script lang="ts">
  import type { Snippet } from 'svelte';

  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    breadcrumb: Snippet;
  }

  let { breadcrumb }: Props = $props();
</script>

<div class="flex items-center gap-2">
  {@render breadcrumb()}
  <Icon name="chevron-left" />
  <Skeleton class="h-5 w-96 rounded-sm" />
</div>

<section
  aria-label={translate('workers.worker-details')}
  class="flex flex-col gap-4"
>
  <header
    class="flex w-full flex-col items-start gap-4 xl:flex-row xl:items-center"
  >
    <Skeleton class="h-5 w-20 rounded-sm" />
    <Skeleton class="h-8 w-96" />
  </header>

  <div class="flex gap-8">
    {#each Array(3) as _, i (i)}
      <div class="flex flex-1 flex-col gap-3">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-4 w-40" />
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-4 w-40" />
      </div>
    {/each}
  </div>

  <div class="flex flex-col gap-4 lg:flex-row">
    <section class="flex flex-1 flex-col gap-4">
      {#each Array(4) as _, i (i)}
        <Card>
          <Skeleton class="mb-4 h-5 w-24" />
          <div class="flex flex-wrap gap-x-32 gap-y-4">
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-8 w-24" />
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-2 w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-8 w-20" />
            </div>
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-8 w-12" />
              <Skeleton class="h-4 w-36" />
            </div>
          </div>
        </Card>
      {/each}
    </section>

    <aside class="flex w-full flex-col gap-4 lg:w-fit">
      <div>
        <Card>
          <Skeleton class="mb-4 h-5 w-20" />
          <div class="flex flex-col gap-3">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-4 w-40" />
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-4 w-28" />
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-4 w-36" />
          </div>
        </Card>
        <Card class="flex flex-col gap-2 border-t-0">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-4 w-10" />
            </div>
            <Skeleton class="h-2 w-full" />
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-4 w-10" />
            </div>
            <Skeleton class="h-2 w-full" />
          </div>
        </Card>
      </div>

      <Card>
        <Skeleton class="mb-4 h-5 w-28" />
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-20" />
          </div>
          <div class="flex flex-col gap-2">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-4 w-20" />
          </div>
        </div>
      </Card>

      <Card>
        <Skeleton class="mb-4 h-5 w-24" />
        <Skeleton class="h-8 w-16" />
        <Skeleton class="mt-2 h-4 w-28" />
      </Card>
    </aside>
  </div>
</section>
