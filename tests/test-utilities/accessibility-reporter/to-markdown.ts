import stringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import toc from 'remark-toc';
import { unified } from 'unified';

import { AccessibilityViolationSummary } from './summarize';

const renderNode = (node: AccessibilityViolationSummary['nodes'][number]) => {
  const [fix, ...summary] = node.failureSummary.split('\n');

  return [
    `## ${node.target.join(' ')}`,
    `${fix}`,
    summary.map((line) => `- ${line}`).join('\n'),
    `![${node.target.join(' ')}](data:image/png;base64,${node.screenshot})`,
    '```html\n' + node.html + '\n```',
  ].join('\n\n');
};

export const toMarkdown = async (
  data: AccessibilityViolationSummary | AccessibilityViolationSummary[],
): Promise<string> => {
  if (Array.isArray(data)) {
    const combined = await Promise.all(
      data.map(async (d) => await toMarkdown(d)),
    );

    const content = combined.join('\n\n');

    const html = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(toc) // Using remark-toc to add the table of contents
      .use(remarkRehype)
      .use(remarkRehype)
      .use(raw) // Include the raw HTML
      .use(stringify)
      .process(content);

    return html.toString();
  } else {
    return [
      `# Accessibility Issue: (${data.impact}) ${data.url} — ${data.issueType}`,
      `**Issue**: [${data.help}](${data.helpUrl})`,
      `**Why?**: ${data.description}`,
      data.nodes.map(renderNode).join('\n\n'),
    ].join('\n\n');
  }
};
