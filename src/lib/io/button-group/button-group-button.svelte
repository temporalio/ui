<script lang="ts">
  import { Button, type ButtonProps } from '../button';
  import { getButtonGroupContext } from './context';

  type ButtonGroupButtonProps = Omit<ButtonProps, 'size'>;

  const { colorScheme, ...rest }: ButtonGroupButtonProps = $props();

  const buttonGroupContext = getButtonGroupContext();
</script>

<Button
  {...rest}
  colorScheme={colorScheme ?? buttonGroupContext.colorScheme}
  size={buttonGroupContext.size}
/>
