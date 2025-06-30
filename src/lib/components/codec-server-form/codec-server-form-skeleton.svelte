<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div class="space-y-6 {className}">
  <Card class="space-y-6">
    <!-- Info alert skeleton -->
    <Skeleton class="h-16 w-full rounded" />

    <!-- Endpoint input section -->
    <div class="space-y-2">
      <Skeleton class="h-4 w-80 rounded" />
      <Skeleton class="h-10 w-full rounded" />
    </div>

    <!-- Toggle switches -->
    <div class="space-y-3">
      <Skeleton class="h-6 w-48 rounded" />
      <Skeleton class="h-6 w-56 rounded" />
    </div>

    <!-- Custom section -->
    <div class="space-y-4">
      <Skeleton class="h-4 w-64 rounded" />
      <Skeleton class="h-10 w-48 rounded" />
    </div>
  </Card>

  <div class="flex gap-3">
    <Skeleton class="h-10 w-16 rounded" />
    <Skeleton class="h-10 w-20 rounded" />
  </div>
</div>
