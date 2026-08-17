import type { Failure } from '$lib/types';

const MAX_FAILURE_DEPTH = 100;

export interface FailureDiagnosticLevel {
  message?: string;
  source?: string;
  stackTrace?: string;
}

export interface WorkflowFailureDiagnostic {
  levels: FailureDiagnosticLevel[];
  messages: string[];
  sources: string[];
  stackTraces: string[];
  combinedMessage: string;
  combinedStackTrace: string;
  transcript: string;
}

const nonEmptyText = (value: string | null | undefined) => {
  return value?.trim() ? value : undefined;
};

const uniqueValues = (
  levels: FailureDiagnosticLevel[],
  key: keyof FailureDiagnosticLevel,
) => {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const level of levels) {
    const value = level[key];
    if (!value) continue;

    const normalized = value.trim();
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    values.push(value);
  }

  return values;
};

const joinCauses = (values: string[]) => {
  return values
    .map((value, index) => (index === 0 ? value : `Caused by: ${value}`))
    .join('\n');
};

const buildTranscript = (levels: FailureDiagnosticLevel[]) => {
  const seenMessages = new Set<string>();
  const seenSources = new Set<string>();
  const seenStackTraces = new Set<string>();
  const causalBlocks: string[] = [];

  for (const level of levels) {
    const lines: string[] = [];
    const messageKey = level.message?.trim();
    const sourceKey = level.source?.trim();
    const stackTraceKey = level.stackTrace?.trim();

    if (level.message && messageKey && !seenMessages.has(messageKey)) {
      seenMessages.add(messageKey);
      lines.push(level.message);
    }

    if (level.source && sourceKey && !seenSources.has(sourceKey)) {
      seenSources.add(sourceKey);
      lines.push(`Source: ${level.source}`);
    }

    if (
      level.stackTrace &&
      stackTraceKey &&
      !seenStackTraces.has(stackTraceKey)
    ) {
      seenStackTraces.add(stackTraceKey);
      lines.push(`Stack trace:\n${level.stackTrace}`);
    }

    if (!lines.length) continue;

    causalBlocks.push(lines.join('\n'));
  }

  return causalBlocks
    .map((block, index) => (index === 0 ? block : `Caused by:\n${block}`))
    .join('\n\n');
};

export const formatWorkflowFailureDiagnostic = (
  failure?: Failure | null,
): WorkflowFailureDiagnostic => {
  const levels: FailureDiagnosticLevel[] = [];
  const visited = new WeakSet<object>();
  let current = failure;
  let depth = 0;

  while (current && depth < MAX_FAILURE_DEPTH && !visited.has(current)) {
    visited.add(current);

    const level: FailureDiagnosticLevel = {
      message: nonEmptyText(current.message),
      source: nonEmptyText(current.source),
      stackTrace: nonEmptyText(current.stackTrace),
    };

    if (level.message || level.source || level.stackTrace) {
      levels.push(level);
    }

    current = current.cause;
    depth += 1;
  }

  const messages = uniqueValues(levels, 'message');
  const sources = uniqueValues(levels, 'source');
  const stackTraces = uniqueValues(levels, 'stackTrace');

  return {
    levels,
    messages,
    sources,
    stackTraces,
    combinedMessage: joinCauses(messages),
    combinedStackTrace: joinCauses(stackTraces),
    transcript: buildTranscript(levels),
  };
};
