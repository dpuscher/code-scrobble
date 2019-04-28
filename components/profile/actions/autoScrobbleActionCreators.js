import {
  SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_AUTO_SCROBBLES, START_DELETING,
  REMOVE_AUTO_SCROBBLE, END_DELETING,
} from '../constants/autoScrobbleConstants';

export const setLoadingState = loading => ({
  type: SET_LOADING_STATE,
  loading,
});

export const setErrorState = error => ({
  type: SET_ERROR_STATE,
  error,
});

export const receivedAutoScrobbles = autoScrobbles => ({
  type: RECEIVED_AUTO_SCROBBLES,
  autoScrobbles,
});

export const startDeleting = id => ({
  type: START_DELETING,
  id,
});
export const removeAutoScrobble = id => ({
  type: REMOVE_AUTO_SCROBBLE,
  id,
});
export const endDeleting = id => ({
  type: END_DELETING,
  id,
});
