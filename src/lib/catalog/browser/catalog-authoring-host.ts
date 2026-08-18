export type CatalogAuthoringFile = {
  content: string;
  editable: boolean;
  mode: number;
  path: string;
  removed?: true;
};

export type CatalogAuthoringLimits = {
  maxDepth: number;
  maxFileBytes: number;
  maxFiles: number;
  maxTotalBytes: number;
};

export type CatalogAuthoringExample = {
  id: string;
  sourceFiles: readonly CatalogAuthoringFile[];
  sourceSnapshot: {
    baseRevision: string;
    limits: CatalogAuthoringLimits;
  };
};

export type CatalogSaveFile = {
  content: string;
  path: string;
  removed?: true;
};

export type CatalogSaveRequest = {
  operationId: string;
  exampleId: string;
  baseRevision: string;
  files: readonly CatalogSaveFile[];
};

export type CatalogSaveProgressEvent = {
  kind: 'check';
  operationId: string;
  sequence: number;
  step: string;
  severity: 'advisory' | 'blocking';
  state: 'started' | 'passed' | 'failed' | 'not-reached';
  reason?: string;
  sourceLocation?: { path: string; line?: number; column?: number };
};

export type CatalogSaveTerminalOutcome =
  | {
      status: 'succeeded';
      commit: 'durable';
      exampleId: string;
      baseRevision: string;
      changedPaths: string[];
      generatedOutputs: readonly {
        path: string;
        gitEffect: 'ignored-update' | 'tracked-update';
      }[];
    }
  | {
      status: 'refused';
      reason: 'catalog-busy' | 'invalid-fileset' | 'stale-revision';
      detail?: string;
    }
  | {
      status: 'failed';
      reason:
        | 'check-failed'
        | 'finalization-failed'
        | 'outcome-unknown'
        | 'recovery-incomplete';
      filesystem: 'changed' | 'may-have-changed' | 'restored' | 'unknown';
      recovery: 'committed' | 'incomplete' | 'rolled-back' | 'unknown';
      recoveryEvidence?: { journal: string; transaction: string };
    };

export type CatalogSaveTerminalEvent = {
  kind: 'terminal';
  operationId: string;
  sequence: number;
  outcome: CatalogSaveTerminalOutcome;
  ownership: 'released' | 'retained';
  reload: 'none' | 'publish';
};

export type CatalogSaveEvent =
  | CatalogSaveProgressEvent
  | CatalogSaveTerminalEvent;

export type CatalogSaveOperationInspection =
  | {
      events: readonly CatalogSaveEvent[];
      operationId: string;
      ownership: 'retained';
      status: 'running';
    }
  | {
      events: readonly CatalogSaveEvent[];
      operationId: string;
      ownership: CatalogSaveTerminalEvent['ownership'];
      status: 'terminal';
      terminal: CatalogSaveTerminalEvent;
    };

export type CatalogPromotionPreview =
  | {
      status: 'unavailable';
      reason:
        | 'preview-not-supported'
        | 'save-failed'
        | 'saved-revision-stale'
        | 'unsaved-changes';
    }
  | {
      status: 'available';
      exampleId: string;
      revision: string;
      source: { id: string; path: string };
      destination: { id: string; path: string };
      authoredSource: string;
      generatedOutputs: readonly {
        path: string;
        gitEffect: 'ignored-update' | 'tracked-update';
      }[];
      gitEffects: {
        source: 'ignored-removal';
        destination: 'tracked-addition';
      };
      checks?: readonly {
        id: string;
        label: string;
        severity: 'advisory' | 'blocking';
        status: 'pending';
      }[];
    };

export type CatalogPromotionCheckResult = {
  detail?: string;
  id: string;
  label: string;
  severity: 'advisory' | 'blocking';
  status: 'failed' | 'not-reached' | 'passed';
};

export type CatalogPromotionOutcome =
  | {
      checks?: CatalogPromotionCheckResult[];
      commit: 'durable';
      direction: 'promote';
      result: {
        changedPaths: string[];
        moved: { from: string; to: string };
      };
      status: 'succeeded';
    }
  | {
      checks?: CatalogPromotionCheckResult[];
      detail?: string;
      direction: 'promote';
      reason:
        | 'catalog-busy'
        | 'check-blocked'
        | 'destination-conflict'
        | 'check-failed'
        | 'generation-failed'
        | 'policy-rejected'
        | 'recovery-refused'
        | 'save-state-changed'
        | 'source-invalid'
        | 'stale-preview';
      status: 'refused';
    }
  | {
      direction: 'promote';
      filesystem: 'changed' | 'may-have-changed' | 'restored' | 'unknown';
      reason:
        | 'committed-finalization-failed'
        | 'execution-failed'
        | 'finalization-failed'
        | 'outcome-unknown'
        | 'recovery-incomplete';
      recovery: 'committed' | 'incomplete' | 'rolled-back' | 'unknown';
      recoveryEvidence?: { journal: string; transaction: string };
      status: 'failed';
    };

export type CatalogAuthoringHost = {
  available: boolean;
  scaffold: (exampleId: string) => Promise<void>;
  load: (exampleId: string) => Promise<CatalogAuthoringExample>;
  save: (
    request: CatalogSaveRequest,
    onEvent: (event: CatalogSaveEvent) => void,
  ) => Promise<CatalogSaveTerminalEvent>;
  inspectSaveOperation: (
    operationId: string,
  ) => Promise<CatalogSaveOperationInspection | undefined>;
  subscribeSaveOperation: (
    operationId: string,
    observer: (event: CatalogSaveEvent) => void,
  ) => () => void;
  previewPromote: (input: {
    exampleId: string;
    saveState:
      | { status: 'dirty' | 'failed' | 'stale' }
      | { status: 'saved'; durability: 'durable' };
  }) => Promise<CatalogPromotionPreview>;
  confirmPromote: (input: {
    exampleId: string;
    revision: string;
    saveState: { status: 'saved'; durability: 'durable' };
  }) => Promise<CatalogPromotionOutcome>;
};

const unavailable = async (): Promise<never> => {
  throw new Error(
    'Local catalog authoring is unavailable in this environment.',
  );
};

const bridgeBase = '/__catalog-local-authoring';

export const createFetchCatalogAuthoringHost = (
  fetch: typeof globalThis.fetch = globalThis.fetch,
): CatalogAuthoringHost => ({
  available: true,
  scaffold: async (exampleId) => {
    const response = await fetch(`${bridgeBase}/scaffold`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ exampleId }),
    });
    if (!response.ok) throw new Error('Unable to create the local example.');
  },
  load: async (exampleId) => {
    const response = await fetch(
      `${bridgeBase}/examples/${encodeURIComponent(exampleId)}`,
    );
    if (response.status === 404) {
      throw new Error(`Local example "${exampleId}" was not found.`);
    }
    if (!response.ok) throw new Error('Unable to load the local example.');
    return response.json() as Promise<CatalogAuthoringExample>;
  },
  save: async (request, onEvent) => {
    const response = await fetch(`${bridgeBase}/save`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Unable to save the local example.');
    if (!response.body)
      throw new Error('Save response did not include events.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffered = '';
    let terminal: CatalogSaveTerminalEvent | undefined;

    const acceptLine = (line: string) => {
      if (!line.trim()) return;
      const event = JSON.parse(line) as CatalogSaveEvent;
      onEvent(event);
      if (event.kind === 'terminal') terminal = event;
    };

    while (true) {
      const { done, value } = await reader.read();
      buffered += decoder.decode(value, { stream: !done });
      const lines = buffered.split('\n');
      buffered = lines.pop() ?? '';
      lines.forEach(acceptLine);
      if (done) break;
    }
    acceptLine(buffered);

    if (!terminal)
      throw new Error('Save stream ended without a terminal event.');
    return terminal;
  },
  inspectSaveOperation: async (operationId) => {
    const response = await fetch(
      `${bridgeBase}/operations/${encodeURIComponent(operationId)}`,
    );
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error('Unable to inspect the Save operation.');
    return response.json() as Promise<CatalogSaveOperationInspection>;
  },
  subscribeSaveOperation: () => () => undefined,
  previewPromote: async (input) => {
    const response = await fetch(`${bridgeBase}/promotions/preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Unable to preview the promotion.');
    return response.json() as Promise<CatalogPromotionPreview>;
  },
  confirmPromote: async (input) => {
    const response = await fetch(`${bridgeBase}/promotions/confirm`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Unable to confirm the promotion.');
    return response.json() as Promise<CatalogPromotionOutcome>;
  },
});

export const unavailableCatalogAuthoringHost: CatalogAuthoringHost = {
  available: false,
  scaffold: unavailable,
  load: unavailable,
  save: unavailable,
  inspectSaveOperation: unavailable,
  subscribeSaveOperation: () => () => undefined,
  previewPromote: unavailable,
  confirmPromote: unavailable,
};
