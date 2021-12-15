<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string;
</script>

<div class="flex flex-col items-start justify-center">
  <label for={id} class="hidden">{name}</label>
  <input
    class="block border-2 text-base p-2 w-full h-10 rounded-lg "
    placeholder={name}
    {id}
    bind:value
  />
</div>
