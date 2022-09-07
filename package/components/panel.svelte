<script>export let error = false;
</script>

<div class="panel" class:error>
  <slot />
</div>

<style>
  .panel {
    border-radius: 0.5rem;
    border-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity));
    padding: 2rem
}
  .error {
    --tw-border-opacity: 1;
    border-color: rgb(185 28 28 / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: rgb(254 242 242 / var(--tw-bg-opacity))
}</style>
