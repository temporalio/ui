<script lang="ts">
  import Button from '$lib/components/button/main-button.svelte';
</script>

<div class="flex flex-col justify-start items-center gap-2 empty">
  <span class="flex rounded-full circle items-center justify-center">🔭</span>
  <h2 class="font-medium">No Workflows Found</h2>
  <p class="text">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dapibus
    dignissim lectus, tempor lacinia turpis.
  </p>
  <Button as="a" href="https://docs.temporal.io/">📄 Go to Docs</Button>
</div>

<style lang="postcss">
  .empty {
    margin-top: 5rem;
  }

  .text {
    width: 44%;
  }

  .circle {
    width: 3rem;
    height: 3rem;
    background-color: #e1e0e7;
  }
</style>
