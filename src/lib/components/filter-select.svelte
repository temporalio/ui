<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string;
</script>

<div>
  <label for={id} class="text-gray-600 text-xs block">{name}</label>
  <select class="block border-2" {id} bind:value>
    <slot />
  </select>
</div>
