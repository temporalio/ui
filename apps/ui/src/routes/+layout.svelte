<script lang="ts">
  import type { Snippet } from 'svelte';

  import { translate } from '$lib/i18n/translate';

  import { setIoTranslate } from '@temporalio/io/i18n';

  let { children }: { children: Snippet } = $props();

  setIoTranslate((key) => translate(key));
</script>

{@render children()}
