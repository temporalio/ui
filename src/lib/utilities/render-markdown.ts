import { sanitize } from 'hast-util-sanitize';
import { toHtml } from 'hast-util-to-html';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toHast } from 'mdast-util-to-hast';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';

/**
 * Generate sanitized HTML from the given markdown content.
 * @param markdown The markdown content to render.
 * @returns The sanitized HTML string ready for client-side rendering.
 */
export const renderMarkdown = async (markdown: string): Promise<string> => {
  const ast = fromMarkdown(markdown);

  remove(ast, 'image');
  remove(ast, 'html');
  remove(ast, 'script');

  const hast = toHast(ast);

  visit(hast, (node) => {
    if (node.type !== 'element') return;

    if (node.tagName === 'a') {
      node.properties.target = '_blank';
      node.properties.rel = 'noopener noreferrer nofollow';
    }
  });

  const sanitizedHast = sanitize(hast);
  return toHtml(sanitizedHast);
};

export const process = async (markdown: string) => {
  const ast = fromMarkdown(markdown);

  remove(ast, 'image');
  remove(ast, 'html');
  remove(ast, 'script');

  const hast = toHast(ast);

  visit(hast, (node) => {
    if (node.type !== 'element') return;

    if (node.tagName === 'a') {
      node.properties.target = '_blank';
      node.properties.rel = 'noopener noreferrer nofollow';
    }
  });

  return sanitize(hast);
};

export const render = async (hast: ReturnType<typeof toHast>) => {
  return toHtml(hast);
};
