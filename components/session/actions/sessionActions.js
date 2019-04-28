import { setLoadingState, receivedSession, setErrorState } from './sessionActionCreators';

const shouldFetchSession = session => !session.data;

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
    const state = getState().session;
    if (shouldFetchSession(state)) {
      dispatch(fetchSession());
    }
  }
);
