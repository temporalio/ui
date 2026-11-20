<!--
  The setup help a provider's Access section offers: how to create the role or
  service account it is asking for.

  It reads as content rather than as a button, so it drops the button chrome
  and keeps only the chevron's hover affordance. Every provider presents this
  the same way, and one whose help looked different would be a surprise rather
  than a feature -- so the styling lives here instead of at each call site.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { IconInfo } from '$lib/io/icon';

  let {
    title,
    open = $bindable(false),
    children,
  }: {
    title: string;
    open?: boolean;
    children: Snippet;
  } = $props();
</script>

<Accordion
  Icon={IconInfo}
  {title}
  bind:open
  class="rounded-lg border-0 bg-surface-secondary [&>div>button:hover>div>svg:last-child]:bg-interactive-tertiary-hover [&>div>button:hover]:bg-transparent [&>div>button>div>svg:last-child]:-m-1 [&>div>button>div>svg:last-child]:box-content [&>div>button>div>svg:last-child]:rounded [&>div>button>div>svg:last-child]:p-1 [&_h3]:text-sm"
>
  <div class="-mt-8 flex flex-col gap-3 pt-3">
    {@render children()}
  </div>
</Accordion>
