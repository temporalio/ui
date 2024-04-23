<script lang="ts">
  export let title: string;
  export let subtitle: string = '';
  export let tags: string[] = [];
</script>

<div
  on:click
  class="card flex cursor-pointer flex-col gap-1 rounded-lg px-4 py-8 transition-colors hover:surface-interactive hover:text-white {$$props.class}"
>
  <h3 class="text-xl font-medium">{title}</h3>
  <p class="">{subtitle}</p>
  <div class="flex gap-2">
    {#each tags as tag}
      <span class="text-sm text-secondary">{tag}</span>
    {/each}
  </div>
</div>

<style lang="postcss">
  .card:hover span {
    @apply text-slate-100;
  }
</style>
