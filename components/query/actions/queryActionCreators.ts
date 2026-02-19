import {
  SET_LOADING_STATE, SET_ERROR_STATE, SET_QUERY_STRING, RECEIVED_RESULTS,
} from '../constants/queryConstants';

export const setLoadingState = loading => ({
  type: SET_LOADING_STATE,
  loading,
});

export const setErrorState = error => ({
  type: SET_ERROR_STATE,
  error,
});

export const setQueryString = query => ({
  type: SET_QUERY_STRING,
  query,
});

export const receivedResults = results => ({
  type: RECEIVED_RESULTS,
  results,
});
