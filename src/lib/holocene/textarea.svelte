<script lang="ts">
  export let value: string = '';
  export let disabled: boolean = false;
  export let placeholder: string = '';
  export let rows: number = 5;
</script>

<textarea
  class="rounded border border-gray-900 p-5 w-full min-h-fit font-mono text-sm"
  bind:value
  {disabled}
  {placeholder}
  {rows}
/>
