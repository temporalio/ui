<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import ScrollToTop from './scroll-to-top.svelte';

  export const meta = {
    title: 'Scroll To Top',
    component: ScrollToTop,
    args: {
      hidden: false,
    },
    argTypes: {
      hidden: {
        control: 'boolean',
        table: {
          disable: true,
        },
      },
    },
  } satisfies Meta<ScrollToTop>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <ScrollToTop
    {...args}
    onScrollToTopClick={action('scroll-to-top')}
    aria-label="Scroll to top"
  />
</Template>

<Story name="Default" />
