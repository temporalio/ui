<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import Logo from '$lib/vendor/Temporal_Logo_Animation.gif';

  export let title = translate('common.loading');
</script>

<div class="my-12 flex flex-col justify-start {$$props.class}">
  <img
    src={Logo}
    style="margin-top: -40px;"
    alt=""
    width="200px"
    height="200px"
  />
  <h2 class="text-xl font-medium" style="margin-top: -40px;">
    {title}
  </h2>
</div>
