<script lang="ts">
  // When using outside of dropdown component bound variable must be named showDropdown
  export let showDropdown: boolean;
  let node: Node;

  const windowClick = (event: MouseEvent) => {
    if (!node.contains(event.target as Node)) {
      showDropdown = false;
    }
  };
</script>

<svelte:window on:click={windowClick} />
<div bind:this={node}>
  <slot />
</div>
