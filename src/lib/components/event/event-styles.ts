import { cva } from 'class-variance-authority';

const categoryColorVariants = {
  workflow: 'text-blue-11 dark:text-blue-8',
  activity: 'text-slate-blue-9 dark:text-purple-9',
  'child-workflow': 'text-peacock-blue-9',
  timer: 'text-amber-11 dark:text-amber-10',
  signal: 'text-pink-9 dark:text-pink-8',
  update: 'text-indigo-9 dark:text-blue-8',
  other: 'text-neutral-5 dark:text-neutral-2',
  nexus: 'text-indigo-9 dark:text-indigo-8',
  'local-activity': 'text-neutral-5 dark:text-neutral-2',
  default: 'text-slate-blue-9 dark:text-purple-9',
};

export const eventCategoryColor = cva('', {
  variants: { category: categoryColorVariants },
});

export const eventTypeStyle = cva(
  ['whitespace-nowrap font-semibold md:text-base flex items-center gap-0.5'],
  {
    variants: { category: categoryColorVariants },
  },
);
