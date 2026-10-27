import { parseComponentMarkdown } from './markdown';
import accordionMarkdown from '../../static/components/accordion.md?raw';
import buttonMarkdown from '../../static/components/button.md?raw';

export const buttonContent = parseComponentMarkdown(buttonMarkdown);
export const accordionContent = parseComponentMarkdown(accordionMarkdown);

export interface ComponentDocumentation {
  slug: string;
  name: string;
  description: string;
  markdown: string;
}

export const buttonDocumentation: ComponentDocumentation = {
  slug: 'button',
  markdown: buttonMarkdown,
  name: buttonContent.name,
  description: buttonContent.description,
};

export const accordionDocumentation: ComponentDocumentation = {
  slug: 'accordion',
  markdown: accordionMarkdown,
  name: accordionContent.name,
  description: accordionContent.description,
};

/** Register a component once to add it to the documentation navigation. */
export const components: ComponentDocumentation[] = [
  buttonDocumentation,
  accordionDocumentation,
];
