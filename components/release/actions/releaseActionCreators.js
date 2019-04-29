import { SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_RELEASE } from '../constants/releaseConstants';

export const setLoadingState = (code, loading) => ({
  type: SET_LOADING_STATE,
  code,
  loading,
});

export const setErrorState = (code, error) => ({
  type: SET_ERROR_STATE,
  code,
  error,
});

export const receivedRelease = (code, release) => ({
  type: RECEIVED_RELEASE,
  code,
  release,
});
