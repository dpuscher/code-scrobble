import {
  setLoadingState, receivedAutoScrobbles, setErrorState, startDeleting,
  removeAutoScrobble, endDeleting,
} from './autoScrobbleActionCreators';

export const fetchAutoScrobbles = () => (
  async (dispatch) => {
    try {
      dispatch(setLoadingState(true));
      const data = await fetch('/api/user/autoscrobbles', { credentials: 'include' }).then(r => r.json());
      dispatch(receivedAutoScrobbles(data));
    } catch (error) {
      dispatch(setErrorState(error));
    }
    dispatch(setLoadingState(false));
  }
);

export const deleteAutoScrobble = id => (
  async (dispatch) => {
    try {
      dispatch(startDeleting(id));
      await fetch('/api/user/autoscrobbles', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      dispatch(removeAutoScrobble(id));
    } catch (error) {
      dispatch(setErrorState(error));
    }
    dispatch(endDeleting(id));
  }
);
