import { cva } from 'class-variance-authority';

const categoryColorVariants = {
  workflow: 'text-blue-700 dark:text-blue-400',
  activity: 'text-purple-600 dark:text-purple-500',
  'child-workflow': 'text-cyan-600',
  timer: 'text-yellow-600 dark:text-yellow-400',
  signal: 'text-pink-600 dark:text-pink-400',
  update: 'text-blue-600 dark:text-blue-400',
  other: 'text-slate-700 dark:text-slate-300',
  nexus: 'text-indigo-600 dark:text-indigo-400',
  'local-activity': 'text-slate-700 dark:text-slate-300',
  default: 'text-purple-600 dark:text-purple-500',
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
