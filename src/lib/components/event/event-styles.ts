import { cva } from 'class-variance-authority';

const categoryColorVariants = {
  workflow: 'text-information',
  activity: 'text-secondary',
  'child-workflow': 'text-success',
  timer: 'text-warning',
  signal: 'text-brand',
  update: 'text-information',
  other: 'text-secondary',
  nexus: 'text-brand',
  'local-activity': 'text-secondary',
  default: 'text-secondary',
};

export const eventCategoryColor = cva('', {
  variants: { category: categoryColorVariants },
});

export const eventTypeStyle = cva(
  ['flex items-center gap-1 whitespace-nowrap text-sm font-medium'],
  {
    variants: { category: categoryColorVariants },
  },
);
