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
    <Skeleton class="h-6 w-24 rounded-sm" />
    <Skeleton class="h-8 w-96" />
  </header>

  <div class="flex flex-col gap-x-8 gap-y-4 xl:flex-row">
    {#each Array(4) as _, i (i)}
      <div class="flex flex-1 flex-col gap-2">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-4 w-40" />
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-4 w-40" />
      </div>
    {/each}
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <Skeleton class="h-7 w-32 rounded-sm" />
    <Skeleton class="h-4 w-48 rounded-sm" />
  </div>

  <div class="flex flex-col gap-4 xl:flex-row">
    <section
      class="grid flex-1 grid-cols-1 gap-4 xl:self-start 2xl:grid-flow-col 2xl:grid-cols-2 2xl:grid-rows-2"
    >
      {#each Array(4) as _, i (i)}
        <Card class="flex flex-col gap-2">
          <Skeleton class="mb-4 h-5 w-24" />
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-8 w-20" />
              <Skeleton class="h-4 w-24" />
            </div>
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-8 w-16" />
            </div>
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-8 w-12" />
              <Skeleton class="h-4 w-28" />
            </div>
          </div>
          <Skeleton class="mt-2 h-4 w-40" />
        </Card>
      {/each}
    </section>

    <aside class="flex w-full flex-col gap-4 xl:max-w-sm">
      <Card class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <Skeleton class="mb-2 h-5 w-40" />
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
        </div>
        <hr class="border-subtle" />
        <div>
          <Skeleton class="mb-4 h-5 w-28" />
          <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-8 w-16" />
              <Skeleton class="h-3 w-32" />
            </div>
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-8 w-16" />
              <Skeleton class="h-3 w-36" />
            </div>
          </div>
        </div>
      </Card>
    </aside>
  </div>
</section>
