import { namespaceConfig } from 'fast-redux';

const DEFAULT_STATE = {
  query: '',
  results: [],
  error: null,
  loading: false,
};

const {
  action: queryAction,
  getState: getQueryState,
} = namespaceConfig('query', DEFAULT_STATE);

export { getQueryState };

// Reducers
const setLoadingState = queryAction('setLoadingState',
  (state, loading) => ({
    ...state,
    loading,
  }));

const setErrorState = queryAction('setErrorState',
  (state, error) => ({
    ...state,
    error,
  }));

const setQueryString = queryAction('setQueryString',
  (state, query) => ({
    ...state,
    query,
  }));

const receivedResults = queryAction('receivedResults',
  (state, results) => ({
    ...state,
    results,
  }));

// Actions
export const queryRelease = () => (
  async (dispatch, getState) => {
    try {
      dispatch(setLoadingState(true));
      const { query } = getQueryState(getState());
      const data = await fetch(`/api/search/${encodeURIComponent(query)}`, { credentials: 'include' }).then(r => r.json());
      dispatch(receivedResults(data));
    } catch (error) {
      dispatch(receivedResults([]));
      dispatch(setErrorState(error));
    }
    dispatch(setLoadingState(false));
  }
);

export const setQuery = (query = '') => (
  (dispatch) => {
    dispatch(setQueryString(query));
  }
);

export const resetResults = () => (
  (dispatch) => {
    dispatch(receivedResults([]));
  }
);
