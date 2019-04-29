import {
  setLoadingState, setErrorState, setQueryString, receivedResults,
} from './queryActionCreators';

export const queryRelease = () => (
  async (dispatch, getState) => {
    try {
      dispatch(setLoadingState(true));
      const { query } = getState().query;
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
