import type { StandaloneActivityFormData } from '$lib/components/standalone-activity-form/types';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const startStandaloneActivity = (
  activity: StandaloneActivityFormData,
  namespace: string,
) => {
  const route = routeForApi('standalone-activities.start', {
    namespace,
    activityId: activity.activityId,
  });
  return requestFromAPI(route, {
    options: { method: 'POST', body: stringifyWithBigInt(activity) },
  });
};
