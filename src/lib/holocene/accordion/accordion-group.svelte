<script lang="ts">
  let { children } = $props();
</script>

<div class="*:border-t-0 [&>*:first-child]:border-t">
  {@render children?.()}
</div>
