<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string;
</script>

<div class="flex flex-col items-start justify-center">
  <label for={id} class="text-gray-600 text-xs whitespace-nowrap">{name}</label>
  <input class="block border-2 text-sm p-2 w-full h-10" {id} bind:value />
</div>
