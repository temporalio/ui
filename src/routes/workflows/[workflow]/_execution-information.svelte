<script lang="ts">
  export let title: string;
  export let value: string | number;
</script>

{#if value}
  <div>
    <h3 class="text-lg mt-6 mb-2">{title}</h3>
    <p class="text-sm text-gray-400">{value}</p>
  </div>
{/if}
