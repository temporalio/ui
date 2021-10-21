<script lang="ts">
  // When using outside of dropdown component binded variable must be named showDropdown
  export let showDropdown: boolean;
  let node: Node;

  const windowClick = (event) => {
    if (!node.contains(event.target)) {
      showDropdown = false;
    }
  };
</script>

<svelte:window on:click={windowClick} />
<div bind:this={node}>
  <slot />
</div>
