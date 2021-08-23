<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let href: string;
</script>

{#if value}
  <div class="w-full mb-6">
    <h3 class="text-lg w-full">{title}</h3>
    <a {href} class="text-sm text-purple-500">{value}</a>
  </div>
{/if}
