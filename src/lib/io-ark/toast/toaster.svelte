<script lang="ts" module>
  import type { IoToaster } from './toaster';

  export interface ToasterProps {
    toaster?: IoToaster;
    label?: string;
    closeLabel?: string;
    class?: string;
  }
</script>

<script lang="ts">
  import { Toaster as ArkToaster, Toast } from '@ark-ui/svelte/toast';
  import type { Snippet } from 'svelte';

  import {
    IconCheckCircle,
    IconClose,
    type IconComponent,
    IconExclamationOctagon,
    IconInfo,
    IconSpinner,
    IconWarning,
  } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';

  import {
    toastActionRecipe,
    toastBodyRecipe,
    toastCloseRecipe,
    toastDescriptionRecipe,
    toastIconRecipe,
    toastRecipe,
    type ToastStatusType,
    toastTitleRecipe,
  } from './recipe';
  import { toaster as sharedToaster } from './toaster';

  let {
    toaster = sharedToaster,
    label = 'Notifications',
    closeLabel = 'Dismiss notification',
    class: className,
  }: ToasterProps = $props();

  const icons: Record<ToastStatusType, IconComponent> = {
    info: IconInfo,
    success: IconCheckCircle,
    warning: IconWarning,
    error: IconExclamationOctagon,
    loading: IconSpinner,
  };

  const toStatus = (type: string | undefined): ToastStatusType =>
    type && type in icons ? (type as ToastStatusType) : 'info';
</script>

{#snippet text(value: string | Snippet | undefined)}
  {#if typeof value === 'string'}{value}{:else if value}{@render value()}{/if}
{/snippet}

<ArkToaster {toaster} {label}>
  {#snippet children(toast)}
    {@const current = toast()}
    {@const status = toStatus(current.type)}
    {@const Icon = icons[status]}
    <Toast.Root class={toastRecipe({ type: status, className })}>
      <Icon width={16} height={16} class={toastIconRecipe(status)} />
      <div class={toastBodyRecipe()}>
        {#if current.title}
          <Toast.Title class={toastTitleRecipe()}
            >{@render text(current.title)}</Toast.Title
          >
        {/if}
        {#if current.description}
          <Toast.Description class={toastDescriptionRecipe()}
            >{@render text(current.description)}</Toast.Description
          >
        {/if}
        {#if current.action}
          <Toast.ActionTrigger>
            {#snippet asChild(props)}
              <Button
                {...props() as Record<string, unknown>}
                class={toastActionRecipe()}
                colorScheme="secondary"
                size="xs"
                tracking={false}>{current.action?.label}</Button
              >
            {/snippet}
          </Toast.ActionTrigger>
        {/if}
      </div>
      {#if current.closable !== false}
        <Toast.CloseTrigger>
          {#snippet asChild(props)}
            <Button
              {...props() as Record<string, unknown>}
              class={toastCloseRecipe()}
              colorScheme="ghost"
              size="sm"
              LeadingIcon={IconClose}
              aria-label={closeLabel}
              tracking={false}
            />
          {/snippet}
        </Toast.CloseTrigger>
      {/if}
    </Toast.Root>
  {/snippet}
</ArkToaster>

<style>
  :global([data-scope='toast'][data-part='root'].io-ark-toast) {
    translate: var(--x) var(--y);
    scale: var(--scale);
    z-index: var(--z-index);
    height: var(--height);
    opacity: var(--opacity);
    will-change: translate, opacity, scale;
    transition:
      translate 400ms,
      scale 400ms,
      opacity 400ms,
      height 400ms,
      box-shadow 200ms;
    transition-timing-function: cubic-bezier(0.21, 1.02, 0.73, 1);
  }

  :global(
    [data-scope='toast'][data-part='root'].io-ark-toast[data-state='closed']
  ) {
    transition:
      translate 400ms,
      scale 400ms,
      opacity 200ms;
    transition-timing-function: cubic-bezier(0.06, 0.71, 0.55, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    :global([data-scope='toast'][data-part='root'].io-ark-toast) {
      transition: none;
    }
  }
</style>
