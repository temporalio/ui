import { cva } from 'class-variance-authority';

const categoryColorVariants = {
  workflow: 'text-io-blue-11 dark:text-io-blue-8',
  activity: 'text-io-slate-blue-9 dark:text-io-purple-9',
  'child-workflow': 'text-io-peacock-blue-9',
  timer: 'text-io-amber-11 dark:text-io-amber-10',
  signal: 'text-io-pink-9 dark:text-io-pink-8',
  update: 'text-io-indigo-9 dark:text-io-blue-8',
  other: 'text-io-neutral-5 dark:text-io-neutral-2',
  nexus: 'text-io-indigo-9 dark:text-io-indigo-8',
  'local-activity': 'text-io-neutral-5 dark:text-io-neutral-2',
  default: 'text-io-slate-blue-9 dark:text-io-purple-9',
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
