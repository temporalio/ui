<script lang="ts" generics="Value extends string">
  import Label from '$lib/holocene/label.svelte';
  import NativeSelect from '$lib/holocene/select/native-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';

  let {
    id,
    label,
    options,
    value = $bindable(),
  }: {
    id: string;
    label: string;
    options: readonly Value[];
    value?: Value;
  } = $props();
</script>

<div class="flex flex-col gap-2">
  <Label {label} for={id} />
  <NativeSelect
    {id}
    name={id}
    bind:value
    class="h-10 rounded border border-tertiary bg-background-primary text-sm text-primary focus-visible:outline focus-visible:outline-interactive-primary"
  >
    {#each options as option (option)}<Option value={option} />{/each}
  </NativeSelect>
</div>
