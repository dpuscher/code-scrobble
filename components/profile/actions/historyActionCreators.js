import { SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_HISTORY } from '../constants/historyConstants';

export const setLoadingState = loading => ({
  type: SET_LOADING_STATE,
  loading,
});

export const setErrorState = error => ({
  type: SET_ERROR_STATE,
  error,
});

export const receivedHistory = history => ({
  type: RECEIVED_HISTORY,
  history,
});
