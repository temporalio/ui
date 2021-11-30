<script lang="ts">
  export let id: string;
  export let label: string;
  export let value: string | boolean;
  export let condensed = false;
</script>

<div class="flex flex-col items-start justify-center">
  <label
    for={id}
    class="text-gray-600 text-xs whitespace-nowrap"
    class:hidden={condensed}
  >
    {label}
  </label>
  <select
    class="block border-2 text-base p-2 w-full h-10"
    {id}
    bind:value
    on:change
  >
    <slot />
  </select>
</div>
