<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<Link
  id="skip-nav"
  href="#content"
  class="absolute left-1/2 -translate-y-full focus:translate-y-0 z-100 p-1"
>
  {translate('skip-nav')}
</Link>
