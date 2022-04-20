import { persistStore } from '$lib/stores/persist-store';
import { isEventView } from '$lib/utilities/route-for';

export const eventViewType = persistStore('eventView', 'summary');

export const setEventViewType = (view: string): void => {
  if (isEventView(view)) {
    eventViewType.set(view);
  }
};
