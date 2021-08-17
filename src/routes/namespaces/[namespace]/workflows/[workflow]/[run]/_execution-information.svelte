<script lang="ts">
  export let title: string;
  export let value: string | number;
</script>

{#if value}
  <div class="w-full mb-6">
    <h3 class="text-lg w-full">{title}</h3>
    <p class="text-sm text-gray-600">{value}</p>
  </div>
{/if}
