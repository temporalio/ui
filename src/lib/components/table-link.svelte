<script lang="ts">
  export let href: string;
</script>

<a {href} {...$$props} class="table-link {$$props.class ?? ''}">
  <slot />
</a>
