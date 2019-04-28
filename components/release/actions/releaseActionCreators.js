import { SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_RELEASE } from '../constants/releaseConstants';

export const setLoadingState = loading => ({
  type: SET_LOADING_STATE,
  loading,
});

export const setErrorState = error => ({
  type: SET_ERROR_STATE,
  error,
});

export const receivedRelease = history => ({
  type: RECEIVED_RELEASE,
  history,
});
