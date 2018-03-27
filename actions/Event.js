import { EVENT_DATA } from './types';

export const storeEventData = (data) => {
  return {
    type: EVENT_DATA,
    payload: data
  }
}
