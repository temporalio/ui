import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import stringify from 'remark-stringify';
import toc from 'remark-toc';
import { visit } from 'unist-util-visit';

import { AccessibilityViolationSummary } from './summarize';

type Node = {
  value: string;
  type: string;
};

function escapeHTML() {
  return (tree: Node) => {
    visit(tree, 'html', (node: Node) => {
      node.type = 'text';
      node.value = `\`${node.value}\``; // Wrap in backticks
    });
  };
}

const processor = remark()
  .use(remarkParse)
  .use(escapeHTML)
  .use(toc)
  .use(remarkGfm)
  .use(stringify);

const renderNode = (node: AccessibilityViolationSummary['nodes'][number]) => {
  const [fix, ...summary] = node.failureSummary.split('\n');

  return [
    `\`${node.target.join(' ')}\`\n\n`,
    // `![Screenshot](data:image/png;base64,${node.screenshot})\n\n`,
    `${fix}\n\n`,
    summary.map((line) => `  - ${line}`).join('\n'),
    `\n\nThis is the markup in question:\n\n \`\`\`html\n${node.html}\n\`\`\`\n`,
  ].join('');
};

export const toMarkdown = async (
  data: AccessibilityViolationSummary | AccessibilityViolationSummary[],
): Promise<string> => {
  if (Array.isArray(data)) {
    const combined = await Promise.all(
      data.map(async (d) => await toMarkdown(d)),
    );

    const content = combined.join('\n\n---\n\n');

    const html = await processor.process(content);

    return html.toString();
  } else {
    return [
      `# Accessibility Issue: (${data.impact}) \`${data.url}\` — ${data.issueType}`,
      `**Issue**: [${data.help}](${data.helpUrl})`,
      `**Why?**: ${data.description}`,
      `**Where?**: ${data.url}`,
      data.nodes.map(renderNode).join('\n\n'),
    ].join('\n\n');
  }
};
