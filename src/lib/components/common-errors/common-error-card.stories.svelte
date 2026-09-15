<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';

  import { COMMON_ERRORS } from './common-errors-data';

  import CommonErrorCard from './common-error-card.svelte';

  const { Story } = defineMeta({
    title: 'Common Error Card',
    component: CommonErrorCard,
    args: {
      errors: COMMON_ERRORS.slice(0, 4),
      onDismiss: fn(),
    },
  });
</script>

<Story name="Default" />

<Story name="Single Error" args={{ errors: COMMON_ERRORS.slice(1, 2) }} />

<Story name="Not Dismissible" args={{ onDismiss: undefined }} />

<Story name="All Errors" args={{ errors: COMMON_ERRORS }} />
