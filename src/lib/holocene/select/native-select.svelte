<script lang="ts">
  export let label = '';
  export let id: string;
  export let placeholder: string;
  export let value = '';
  export let options: { label: string; value: string }[] = [];
</script>

{#if label}
  <label for={id} class={$$props.labelClass}>{label}</label>
{/if}
<select {value} {id} class={$$props.class} {placeholder} on:select>
  {#each options as option}
    <option value={option.value}>{label}</option>
  {/each}
</select>
