<script lang="ts">
  export let value: string = '';
  export let disabled: boolean = false;
  export let placeholder: string = '';
  export let rows: number = 5;
</script>

<textarea
  class="font-mono min-h-fit w-full rounded border border-gray-900 p-5 text-sm"
  bind:value
  {disabled}
  {placeholder}
  {rows}
/>
