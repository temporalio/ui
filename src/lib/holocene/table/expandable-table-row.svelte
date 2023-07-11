<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  export let firstTrClass = '';

  let expando = false;
  function expand() {
    expando = !expando;
  }
</script>

<tr on:click={expand} class={`cursor-pointer b-0 ${firstTrClass}`}>
  <slot name="first">
    <td />
  </slot>
  <slot />
  <slot name="last">
    <td>
      <div
        class:rotate-180={expando}
        class:rotate-0={!expando}
        class="transition-all"
      >
        <Icon name="chevron-down" />
      </div>
    </td>
  </slot>
</tr>
<slot name="extraRow" {expando} />
<tr class:nopadding={!expando} class="expando">
  <slot name="expandoFirst">
    <td />
  </slot>
  <slot name="expando" {expando}>
    <td />
  </slot>
  <slot name="expandoLast">
    <td />
  </slot>
</tr>

<style lang="postcss">
  :global(tr.nopadding td) {
    padding: 0 !important;
    border-collapse: collapse;
    border-bottom-width: 0;
    border-top-width: 0;
  }

  :global(tr.expando td) {
    border-top: 0;
  }

  :global(tr.expando:last-of-type td) {
    border-bottom-width: 1px;
  }
</style>
