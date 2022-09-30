type ComponentDataProps = { 'data-cy': string };

/**
 * @summary describes Holocene components' Props.
 * @description This type is the Intersection of svelte's HTMLProps type (which encompasses all valid HTML Attributes),
 * the consuming Component's OwnProps, and custom yet common global HTML attributes, such as `data-cy`.
 * It also Omits keys of OwnProps from the ParentElement's Props to avoid collisions.
 * @param ParentElement {HTMLElement} - the top-most HTML Element in your component to which props are spread.
 * @param OwnProps {Record<any, any>} - the props that are unique to your component.
 * @example
 * ```ts
 * type $$Props = ComponentProps<HTMLButtonElement, { propA: string; propB: boolean }>;
 * ```
 */
type ComponentProps<ParentElement, OwnProps> = Omit<
  svelte.JSX.HTMLProps<ParentElement>,
  keyof OwnProps
> &
  Optional<ComponentDataProps> &
  OwnProps;
