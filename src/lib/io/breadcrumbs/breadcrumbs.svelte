<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { TextLinkProps } from '$lib/io/text-link';

  export interface Breadcrumb extends Omit<
    TextLinkProps,
    | 'children'
    | 'LeadingIcon'
    | 'TrailingIcon'
    | 'aria-current'
    | 'disabled'
    | 'href'
  > {
    label: string;
    href: string;
  }

  export interface BreadcrumbsProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'class' | 'children'
  > {
    items: readonly Breadcrumb[];
    class?: string;
  }
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import { IconSlashForward } from '$lib/io/icon';
  import { TextLink } from '$lib/io/text-link';

  let {
    'aria-label': ariaLabel = translate('common.breadcrumbs'),
    class: className,
    items,
    ...rest
  }: BreadcrumbsProps = $props();
</script>

<nav
  {...rest}
  aria-label={ariaLabel}
  class={twMerge('text-xs font-normal leading-4 text-primary', className)}
>
  <ol role="list" class="flex flex-wrap items-center gap-1">
    {#each items as { label, class: itemClass, ...item }, index (index)}
      {@const current = index === items.length - 1}
      <li>
        <TextLink
          {...item}
          aria-current={current ? 'page' : undefined}
          TrailingIcon={current ? undefined : IconSlashForward}
          class={twMerge(
            'no-underline hover:text-secondary [&>svg]:text-tertiary',
            !current &&
              'text-brand hover:text-interactive-primary-hover focus-visible:text-brand',
            itemClass,
          )}
        >
          {label}
        </TextLink>
      </li>
    {/each}
  </ol>
</nav>
