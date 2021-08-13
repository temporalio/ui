<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string;
</script>

<div>
  <label for={id} class="text-gray-600 text-xs block">{name}</label>
  <input class="block border-2 text-sm p-2" {id} bind:value />
</div>

<style>
  input {
    height: 40px;
  }
</style>
