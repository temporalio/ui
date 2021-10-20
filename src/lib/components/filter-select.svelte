<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string | boolean;
  export let condensed = false;
</script>

<div>
  <label for={id} class="text-gray-600 text-xs " class:hidden={condensed}>
    {name}
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
