<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string | boolean;
</script>

<div>
  <label for={id} class="text-gray-600 text-xs block">{name}</label>
  <select class="block border-2 text-base p-2" {id} bind:value>
    <slot />
  </select>
</div>

<style>
  select {
    height: 40px;
  }
</style>
