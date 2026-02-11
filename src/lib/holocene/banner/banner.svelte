<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  import { persistStore } from '$lib/stores/persist-store';

  export const dismissedBanners = persistStore<Record<string, boolean>>(
    'dismissed-banners',
    {},
  );

  type BannerType = VariantProps<typeof types>['type'];

  const type = {
    error: 'bg-danger',
    info: 'bg-information',
  };
  const types = cva(
    [
      'w-full',
      'md:sticky md:top-12',
      'max-md:fixed max-md:bottom-16',
      'z-[39]',
      'flex items-center justify-between gap-2',
      'px-4 py-2',
    ],
    {
      variants: {
        type,
      },
      defaultVariants: {
        type: 'info',
      },
    },
  );
</script>

<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    id: string;
    message: string;
    dismissable?: boolean;
    dismissLabel?: string;
    icon?: IconName;
    type?: BannerType;
    class?: ClassNameValue;
  }

  let {
    class: className = '',
    id,
    message,
    dismissable = false,
    dismissLabel = translate('common.close'),
    icon = null,
    type = 'info',
    ...rest
  }: Props = $props();

  let show = $derived(message && !$dismissedBanners[id]);

  const dismissBanner = () => {
    $dismissedBanners[id] = true;
  };
</script>

{#if show}
  <section class={merge(types({ type }), className)} {...rest}>
    <span class="flex items-center gap-2">
      {#if icon}
        <Icon name={icon} />
      {/if}
      {message}
    </span>
    {#if dismissable}
      <Button
        on:click={dismissBanner}
        leadingIcon="close"
        variant="ghost"
        size="xs"
        class="rounded-full"
      >
        <span class="sr-only">{dismissLabel}</span>
      </Button>
    {/if}
  </section>
{/if}
