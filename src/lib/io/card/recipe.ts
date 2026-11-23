import { twJoin } from 'tailwind-merge';

export const cardRecipe = () => {
  return twJoin(
    'border border-primary rounded-lg',
    'bg-surface-primary text-secondary',
    'flex flex-col',
  );
};

export const cardMediaRecipe = () => {
  return twJoin(
    'w-full aspect-[1.618] *:h-full *:w-full *:object-cover *:object-center',
  );
};

export const cardContentRecipe = () => {
  return twJoin('flex flex-col gap-4 p-6');
};

export const cardTitleRecipe = () => {
  return twJoin('flex gap-2 text-primary font-medium text-base items-center');
};

export const cardDescriptionRecipe = () => {
  return twJoin('flex flex-col gap-2 text-base text-secondary');
};

export const cardActionsRecipe = () => {
  return twJoin('flex gap-4 justify-end items-center');
};

export const cardFooterRecipe = () => {
  return twJoin('border-t border-primary text-tertiary p-4 text-xs');
};
