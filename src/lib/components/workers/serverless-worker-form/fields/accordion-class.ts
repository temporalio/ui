/**
 * The setup-help accordions read as content rather than as a button, so they
 * drop the button chrome and keep only the chevron's hover affordance.
 *
 * Shared because every provider's Access section presents its setup help the
 * same way, and a provider whose help looked different would be a surprise
 * rather than a feature.
 */
export const ACCORDION_CLASS = [
  'rounded-lg border-0 bg-surface-secondary [&_h3]:text-sm',
  '[&>div>button:hover]:bg-transparent',
  '[&>div>button>div>svg:last-child]:-m-1 [&>div>button>div>svg:last-child]:box-content [&>div>button>div>svg:last-child]:rounded [&>div>button>div>svg:last-child]:p-1',
  '[&>div>button:hover>div>svg:last-child]:bg-interactive-tertiary-hover',
].join(' ');
