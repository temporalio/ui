<script lang="ts">
  import Link from './link.svelte';

  export let links: { copy: string; href: string }[];
</script>

<div class="flex items-center gap-1 p-1">
  {#each links as { copy, href }, i}
    <Link {href} {...$$restProps} icon={i !== 0 && 'chevron-left'}>
      {copy}
    </Link>
  {/each}
</div>
