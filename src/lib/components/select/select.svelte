<script lang="ts">
  export let id: string = null;
  export let value: string | boolean;
</script>

<div class="flex flex-col items-start justify-center border-gray-100">
  <select
    class="inline border-2 text-base p-2 w-full h-10 rounded-lg"
    {id}
    bind:value
    on:change
  >
    <slot />
  </select>
</div>
