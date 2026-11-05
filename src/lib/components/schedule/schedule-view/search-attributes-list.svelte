<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import type { Payload } from '$lib/types';
  import type { SearchAttributes } from '$lib/types/workflows';
  import { payloadToString } from '$lib/utilities/payload-to-string';

  import { getSearchAttributeQuery } from '../utilities/get-search-attribute-query';

  type Props = {
    attributes: Record<string, Payload>;
    attributeTypes: SearchAttributes;
    getHref: (query: string) => string | null | undefined;
  };

  let { attributes, attributeTypes, getHref }: Props = $props();
</script>

<ul class="w-full">
  {#each Object.entries(attributes) as [name, value] (name)}
    {@const query = getSearchAttributeQuery(name, attributeTypes[name], value)}
    <li class="flex flex-wrap items-center gap-2 py-2">
      <a
        href={query ? getHref(query) : undefined}
        class="flex flex-wrap items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
      >
        <span class={twMerge('break-all', query && 'underline')}>{name}</span>
        <span
          class="select-all rounded-sm bg-surface-tertiary p-1 leading-4 text-primary"
        >
          {payloadToString(value)}
        </span>
      </a>
    </li>
  {:else}
    <li class="flex min-h-10 items-center py-2 text-secondary">
      {translate('common.none')}
    </li>
  {/each}
</ul>
