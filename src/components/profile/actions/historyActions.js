import { setLoadingState, receivedHistory, setErrorState } from './historyActionCreators';

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
