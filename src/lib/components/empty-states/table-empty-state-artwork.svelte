<script lang="ts">
  import noResultsImage from '$lib/vendor/empty-state.svg';
</script>

<div
  class="surface-secondary hidden h-full w-[38%] overflow-hidden border-l border-subtle xl:block"
  data-testid="table-empty-state-artwork"
>
  <img
    src={noResultsImage}
    alt=""
    class="block h-full w-full object-cover object-[74%_center] opacity-70 grayscale"
  />
</div>
