import { SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_SESSION } from '../constants/sessionConstants';

export const setLoadingState = loading => ({
  type: SET_LOADING_STATE,
  loading,
});
export const setErrorState = error => ({
  type: SET_ERROR_STATE,
  error,
});
export const receivedSession = session => ({
  type: RECEIVED_SESSION,
  session,
});
