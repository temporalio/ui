<script lang="ts">
  export let href: string;
</script>

<a {href} {...$$props} class="{$$props.class} table-link">
  <slot />
</a>
