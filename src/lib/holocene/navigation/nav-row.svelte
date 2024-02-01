<script lang="ts">
  export let link: string = '';
  export let externalLink = false;

  let attributes = {
    rel: externalLink ? 'noreferrer' : undefined,
    target: externalLink ? '_blank' : undefined,
  };
</script>

<li data-testid={$$props['data-testid']}>
  {#if link}
    <a
      href={link}
      {...attributes}
      class="flex flex-row items-center whitespace-nowrap rounded-lg py-1 text-sm font-medium group-[.surface-inverse]:hover:bg-slate-950 group-[.surface-primary]:hover:bg-slate-200"
    >
      <slot />
    </a>
  {:else}
    <slot />
  {/if}
</li>
