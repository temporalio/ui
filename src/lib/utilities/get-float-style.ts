export const getFloatStyle = ({
  width,
  height,
  screenWidth,
  breakpoint = 1024
}: {
  width?: number;
  height?: number;
  screenWidth?: number;
  breakpoint?: number;
}): string => {
  return width && height && screenWidth > breakpoint
  ? `position: absolute; right: ${width + 20}px; top: -${height + 14}px`
  : '';
}