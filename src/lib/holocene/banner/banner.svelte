<script lang="ts" module>
  import { cva, type VariantProps } from 'class-variance-authority';

  import { persistStore } from '$lib/stores/persist-store';

  export const dismissedBanners = persistStore<Record<string, boolean>>(
    'dismissed-banners',
    {},
  );
  export type BannerType = VariantProps<typeof types>['type'];

  const type = {
    default: 'bg-indigo-200 text-indigo-900',
    danger: 'surface-danger',
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
        type: 'default',
      },
    },
  );
</script>

<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from '../icon';

  type BaseProps = {
    id: string;
    message: string;
    dismissible?: boolean;
    icon?: IconName;
    type?: BannerType;
    class?: string;
  };

  type DismissibleBanner = BaseProps & {
    dismissable: true;
    dismissLabel: string;
  };

  type Props =
    | (BaseProps & { dismissable?: false; dismissLabel?: '' })
    | DismissibleBanner;

  let {
    id,
    message,
    dismissLabel = '',
    dismissable = false,
    icon = null,
    type = 'default',
    class: className = '',
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
        onclick={dismissBanner}
        leadingIcon="close"
        variant="ghost"
        size="xs"
      >
        <span class="sr-only">{dismissLabel}</span>
      </Button>
    {/if}
  </section>
{/if}
