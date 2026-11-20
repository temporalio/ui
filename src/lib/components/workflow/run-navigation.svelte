<script lang="ts" module>
  import type { IconComponent } from '$lib/io/icon';

  export type RunNavigationLink = {
    id: string;
    label: string;
    href: string;
    LeadingIcon?: IconComponent;
    TrailingIcon?: IconComponent;
  };
</script>

<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { ButtonLink } from '$lib/io/button';
  import { RoundnessGroup } from '$lib/io/roundness-group';

  interface Props {
    links: RunNavigationLink[];
  }

  let { links }: Props = $props();
</script>

{#if links.length}
  <RoundnessGroup
    role="group"
    aria-label={translate('workflows.run-navigation')}
    roundness="base"
    innerBorderHandling="collapse"
    class="inline-flex"
  >
    {#each links as link (link.id)}
      <ButtonLink
        colorScheme="tertiary"
        size="sm"
        href={link.href}
        LeadingIcon={link.LeadingIcon}
        TrailingIcon={link.TrailingIcon}
        data-testid="run-navigation-{link.id}"
      >
        {link.label}
      </ButtonLink>
    {/each}
  </RoundnessGroup>
{/if}
