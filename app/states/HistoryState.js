import { namespaceConfig } from 'fast-redux';

const DEFAULT_STATE = {
  data: null,
  error: null,
  loading: true,
  deleting: [],
};

const {
  action: historyAction,
  getState: getHistoryState,
} = namespaceConfig('history', DEFAULT_STATE);

export { getHistoryState };

// Reducers
const setLoadingState = historyAction('setLoadingState',
  (state, loading) => ({
    ...state,
    loading,
  }));

const setErrorState = historyAction('setErrorState',
  (state, error) => ({
    ...state,
    error,
  }));

const receivedHistory = historyAction('receivedHistory',
  (state, data) => ({
    ...state,
    data,
  }));

// Actions
export const fetchHistory = () => (
  async (dispatch) => {
    try {
      dispatch(setLoadingState(true));
      const data = await fetch('/api/user/history', { credentials: 'include' }).then(r => r.json());
      dispatch(receivedHistory(data));
    } catch (error) {
      dispatch(setErrorState(error));
    }
    dispatch(setLoadingState(false));
  }
);
