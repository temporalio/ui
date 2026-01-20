<script lang="ts">
  interface Props {
    empty?: boolean;
  }

  let { empty = false }: Props = $props();
</script>

<tr
  data-testid="activities-summary-configurable-table-row"
  class:empty
  class="dense"
>
  <td></td>
  <slot />
</tr>
