import type { TailwindClass } from './types';

export const parseTailwindClass = (tailwindClass: string): TailwindClass => {
  const result: TailwindClass = {
    variant: null,
    utility: null,
    color: null,
    shade: null,
  };

  // Match the variant prefix, if present
  const variantMatch = tailwindClass.match(
    /^(hover|focus|active|group-hover|focus-within):/,
  );
  if (variantMatch) {
    result.variant = variantMatch[1];
    tailwindClass = tailwindClass.replace(variantMatch[0], '');
  }

  // Match the utility
  const utilityMatch = tailwindClass.match(
    /^(text|bg|border|divide|ring|placeholder)-/,
  );
  if (utilityMatch) {
    result.utility = utilityMatch[1];
    tailwindClass = tailwindClass.replace(utilityMatch[0], '');
  }

  // Match the color
  const colorMatch = tailwindClass.match(/^(\w+)-/);
  if (colorMatch) {
    result.color = colorMatch[1];
    tailwindClass = tailwindClass.replace(colorMatch[0], '');
  }

  // Whatever is left must be the shade
  if (tailwindClass) {
    result.shade = tailwindClass;
  }

  return result;
};
