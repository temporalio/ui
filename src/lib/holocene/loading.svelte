<script lang="ts">
  export let title: string = 'Loading…';
  export let size = 200;
</script>

<div class="my-12 flex flex-col items-center justify-start {$$props.class}">
  <img
    src="/Temporal_Logo_Animation.gif"
    style="margin-top: -40px;"
    alt="Temporal Logo"
    width="{size}px"
    height="{size}px"
  />
  <h2 class="text-xl font-medium" style="margin-top: -40px;">{title}</h2>
</div>
