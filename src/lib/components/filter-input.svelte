<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string;
</script>

<div>
  <label for={id} class="text-gray-600 text-xs dark:text-gray-200">{name}</label
  >
  <input class="block border-2 text-sm p-2 w-full h-10" {id} bind:value />
</div>
