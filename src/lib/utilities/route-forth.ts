/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { ParamMap } from 'urlcat';
import urlcat from 'urlcat';
import type {
  EventHistoryParameters,
  EventParameters,
  ImportParameters,
  NamespaceParameter,
  WorkflowParameters,
} from './route-for';

interface LoginParameter {
  returnUrl?: string;
}

export const AppRoutes = {
  baseUrl: '',
  login(params: LoginParameter) {
    return urlcat(this.baseUrl, '/login', params);
  },
  /** Prefer authenticationWithSettings
   * TODO: make this JSDoc*/
  authentication(params: ParamMap) {
    // Authentication has dynamic params set by the settings endpoint so this is more
    // loosely typed
    return urlcat(this.baseUrl, '/auth/sso', params);
  },
  authenticationWithSettings({
    settings,
    currentSearchParams,
  }: {
    settings: Settings;
    currentSearchParams: URLSearchParams;
  }) {
    const opts = settings.auth.options ?? [];
    opts.push('returnUrl');

    const authenticationParams: Record<string, string> = {};

    opts.forEach((option) => {
      const searchParam = currentSearchParams.get(option);

      if (searchParam) {
        authenticationParams[option] = searchParam;
      }
    });
    //This doesn't behave the same way as the other one because it can't get originUrl or w/e
    // look into how this is used and write a test case
    return this.authentication(authenticationParams);
  },
  namespace<T>(params: ValidateShape<T, NamespaceParameter>) {
    return urlcat(this.baseUrl, '/namespaces/:namespace', params);
  },
  workflows<T>(params: ValidateShape<T, NamespaceParameter>) {
    return urlcat(this.baseUrl, '/namespaces/:namespace/workflows', params);
  },
  workflow<T>(params: ValidateShape<T, WorkflowParameters>) {
    return urlcat(
      this.baseUrl,
      '/namespaces/:namespace/workflows/:workflow/:run',
      params,
    );
  },
  stackTrace<T>(params: ValidateShape<T, WorkflowParameters>) {
    return urlcat(
      this.baseUrl,
      '/namespaces/:namespace/workflows/:workflow/:run/stack-trace',
      params,
    );
  },
  query<T>(params: ValidateShape<T, WorkflowParameters>) {
    return urlcat(
      this.baseUrl,
      '/namespaces/:namespace/workflows/:workflow/:run/query',
      params,
    );
  },
  workers<T>(params: ValidateShape<T, WorkflowParameters>) {
    return urlcat(
      this.baseUrl,
      '/namespaces/:namespace/workflows/:workflow/:run/workers',
      params,
    );
  },
  pendingActivities<T>(params: ValidateShape<T, WorkflowParameters>) {
    return urlcat(
      this.baseUrl,
      '/namespaces/:namespace/workflows/:workflow/:run/pending-activities',
      params,
    );
  },
  archivalWorkflows<T>(params: ValidateShape<T, NamespaceParameter>) {
    return urlcat(this.baseUrl, '/namespaces/:namespace/archival', params);
  },
  // This seems like a params thing instead of a full url thing
  eventHistory<T>(params: ValidateShape<T, EventHistoryParameters>) {
    // Check URlCat docs on this
    if (!params.view) {
      return urlcat(
        this.baseUrl,
        '/namespaces/:namespace/workflows/:workflow/:run/history',
        params,
      );
    }

    return urlcat(
      this.baseUrl,
      '/namespaces/:namespace/workflows/:workflow/:run/history/:view',
      params,
    );
  },
  // Url Params + single eventId seems a better option here
  eventHistoryItem<T>(params: ValidateShape<T, EventParameters>) {
    // Check URlCat docs on this
    if (!params.view) {
      return urlcat(
        this.baseUrl,
        '/namespaces/:namespace/workflows/:workflow/:run/history/:eventId',
        params,
      );
    }

    return urlcat(
      this.baseUrl,
      '/namespaces/:namespace/workflows/:workflow/:run/history/:view/:eventId',
      params,
    );
  },
  import<T>(params: ValidateShape<T, ImportParameters>) {
    if (params.eventId) return `/import/:importType/:eventId`;
    return `/import/:importType/`;
  },
};
