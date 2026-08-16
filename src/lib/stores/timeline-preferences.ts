import { persistStore } from './persist-store';

/** Whether Timeline event cards should include metadata details alongside payloads. */
export const timelineShowEventDetails = persistStore(
  'timelineShowEventDetails',
  false,
);
