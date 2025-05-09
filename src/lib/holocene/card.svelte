<script lang="ts">
  let { class: klass = '', children } = $props();
</script>

<div class="surface-primary border border-subtle p-4 {klass}">
  {@render children?.()}
</div>
