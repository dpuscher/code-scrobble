import { setLoadingState, receivedHistory, setErrorState } from './historyActionCreators';

// eslint-disable-next-line import/prefer-default-export
export const fetchHistory = () => (
  async (dispatch) => {
    try {
      dispatch(setLoadingState(true));
      const response = await fetch('/api/user/history', { credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      dispatch(receivedHistory(data));
    } catch (error) {
      dispatch(setErrorState(error));
    }
    dispatch(setLoadingState(false));
  }
);
