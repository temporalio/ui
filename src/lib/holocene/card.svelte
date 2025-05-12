<script lang="ts">
  let { class: className = '', children } = $props();
</script>

<div class="surface-primary border border-subtle p-4 {className}">
  {@render children?.()}
</div>
