import { namespaceConfig } from 'fast-redux';

const DEFAULT_STATE = {
  data: null,
  error: null,
  loading: true,
};

const {
  action: sessionAction,
  getState: getSessionState,
} = namespaceConfig('session', DEFAULT_STATE);

export { getSessionState };

// Reducers
const setLoadingState = sessionAction('setLoadingState',
  (state, loading) => ({
    ...state,
    loading,
  }));

const setErrorState = sessionAction('setErrorState',
  (state, error) => ({
    ...state,
    error,
  }));

export const receivedSession = sessionAction('receivedSession',
  (state, data) => ({
    ...state,
    data,
  }));

const shouldFetchSession = session => !session.data;

// Actions
export const fetchSession = () => (
  async (dispatch) => {
    try {
      dispatch(setLoadingState(true));
      const data = await fetch('/api/session', { credentials: 'include' }).then(r => r.json());
      dispatch(receivedSession(data));
    } catch (error) {
      dispatch(setErrorState(error));
    }
    dispatch(setLoadingState(false));
  }
);

export const fetchSessionIfNeeded = () => (
  (dispatch, getState) => {
    const state = getSessionState(getState());
    if (shouldFetchSession(state)) {
      dispatch(fetchSession());
    }
  }
);
