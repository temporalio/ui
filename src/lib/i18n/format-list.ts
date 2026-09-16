import i18next from 'i18next';

export const formatList = (
  list: Iterable<string>,
  options: Intl.ListFormatOptions = { style: 'long', type: 'conjunction' },
): string => {
  return new Intl.ListFormat(i18next.language, options).format(list);
};
