import { createHash } from 'crypto';

import { NodeResult, Result } from 'axe-core';

import { WithScreenshot } from '../attach-violations';

export type AccessibilityViolationSummary = ReturnType<typeof summarize>;

export const summarize = (issue: Result, url?: string) => {
  const md5 = createHash('md5');
  const pathName = new URL(url || '').pathname;

  const nodes = issue.nodes.flatMap((node: WithScreenshot<NodeResult>) => {
    const { html, target, ancestry, failureSummary, element, screenshot } =
      node;

    return {
      html,
      target,
      ancestry,
      screenshot,
      failureSummary,
      element,
      url: pathName,
    };
  });

  const elements = nodes.reduce((acc, node) => {
    return (acc += node.html);
  }, '');

  return {
    id: md5.update(elements).digest('hex'),
    issueType: issue.id,
    url: pathName,
    help: issue.help,
    helpUrl: issue.helpUrl,
    impact: issue.impact,
    tags: issue.tags,
    description: issue.description,
    nodes: nodes,
  };
};
