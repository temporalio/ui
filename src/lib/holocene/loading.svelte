<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import Logo from '$lib/vendor/Temporal_Logo_Animation.gif';

  export let title = translate('loading');
</script>

<div class="my-12 flex flex-col items-center justify-start {$$props.class}">
  <img
    src={Logo}
    style="margin-top: -40px;"
    alt=""
    width="200px"
    height="200px"
    aria-labelledby="loadingTitle"
  />
  <h2 id="loadingTitle" class="text-xl font-medium" style="margin-top: -40px;">
    {title}
  </h2>
</div>
