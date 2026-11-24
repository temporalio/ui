<script lang="ts">
  import { ButtonLink, type ButtonLinkProps } from '../button';
  import { getButtonGroupContext } from './context';

  type ButtonGroupLinkProps = Omit<ButtonLinkProps, 'size'>;

  const { colorScheme, ...rest }: ButtonGroupLinkProps = $props();

  const buttonGroupContext = getButtonGroupContext();
</script>

<ButtonLink
  {...rest}
  colorScheme={colorScheme ?? buttonGroupContext.colorScheme}
  size={buttonGroupContext.size}
/>
