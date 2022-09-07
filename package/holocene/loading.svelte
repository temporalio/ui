<script>import { publicPath } from '../utilities/get-public-path';
export let title = 'Loading…';
</script>

<div class="my-12 flex flex-col items-center justify-start {$$props.class}">
  <img
    src="{publicPath}/Temporal_Logo_Animation.gif"
    style="margin-top: -40px;"
    alt="Temporal Logo"
    width="200px"
    height="200px"
  />
  <h2 class="text-xl font-medium" style="margin-top: -40px;">{title}</h2>
</div>
