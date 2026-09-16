<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  interface Props {
    version: string;
  }

  let { version }: Props = $props();
</script>

{#if version}
  <p
    class="truncate px-2 py-3 text-xs text-secondary opacity-0 transition-opacity group-data-[nav=closed]:pointer-events-none group-data-[nav=open]:opacity-100 group-data-[nav=open]:delay-75 group-data-[nav=closed]:duration-75 group-data-[nav=open]:duration-150 group-data-[nav=closed]:ease-out group-data-[nav=open]:ease-linear motion-reduce:transition-none"
  >
    {translate('common.version')}
    {version}
  </p>
{/if}
