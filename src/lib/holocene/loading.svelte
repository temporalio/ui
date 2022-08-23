<script lang="ts">
  export let title: string = 'Loading…';
</script>

<div class="my-12 flex flex-col items-center justify-start {$$props.class}">
  <img
    src="/Temporal_Logo_Animation.gif"
    style="margin-top: -40px;"
    alt="Temporal Logo"
    width="200px"
    height="200px"
  />
  <h2 class="text-xl font-medium" style="margin-top: -40px;">{title}</h2>
</div>
