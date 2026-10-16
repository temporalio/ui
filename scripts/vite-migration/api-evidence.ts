export type RequestBodyCategory = 'none' | 'json' | 'form' | 'text' | 'binary';

export type ApiRequestEvidence = {
  method: string;
  path: string;
  query: string;
  bodyCategory: RequestBodyCategory;
  status: number | null;
  failure: string | null;
  mock: string | null;
};

export type ApiRequestSummary = ApiRequestEvidence & { count: number };

export const normalizeApiUrl = (
  value: string,
): { path: string; query: string } => {
  const url = new URL(value);
  url.searchParams.sort();

  return {
    path: url.pathname,
    query: url.searchParams.toString(),
  };
};

export const categorizeRequestBody = (
  body: string | null,
  contentType: string | null,
): RequestBodyCategory => {
  if (!body) return 'none';

  const normalizedContentType = contentType?.toLowerCase() ?? '';
  if (normalizedContentType.includes('json')) return 'json';
  if (
    normalizedContentType.includes('application/x-www-form-urlencoded') ||
    normalizedContentType.includes('multipart/form-data')
  ) {
    return 'form';
  }
  if (
    normalizedContentType.startsWith('text/') ||
    normalizedContentType.includes('xml') ||
    normalizedContentType.includes('javascript')
  ) {
    return 'text';
  }
  return 'binary';
};

export const summarizeApiRequests = (
  requests: readonly ApiRequestEvidence[],
): ApiRequestSummary[] => {
  const summaries = new Map<string, ApiRequestSummary>();

  for (const request of requests) {
    const key = JSON.stringify(request);
    const summary = summaries.get(key);
    if (summary) {
      summary.count += 1;
    } else {
      summaries.set(key, { ...request, count: 1 });
    }
  }

  return [...summaries.values()].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );
};

export const apiRequestsForParity = (
  requests: readonly ApiRequestSummary[],
): ApiRequestSummary[] => {
  return requests.map((request) => ({
    ...request,
    failure:
      request.failure === 'net::ERR_ABORTED' &&
      request.status !== null &&
      request.status < 400
        ? null
        : request.failure,
  }));
};

export const scenarioForParity = <
  Scenario extends { appApiRequests: readonly ApiRequestSummary[] },
>(
  scenario: Scenario | null,
):
  | (Omit<Scenario, 'appApiRequests'> & {
      appApiRequests: ApiRequestSummary[];
    })
  | null => {
  if (!scenario) return null;

  return {
    ...scenario,
    appApiRequests: apiRequestsForParity(scenario.appApiRequests),
  };
};
