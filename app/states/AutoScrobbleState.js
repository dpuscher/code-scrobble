import { namespaceConfig } from 'fast-redux';

const DEFAULT_STATE = {
  data: null,
  error: null,
  loading: true,
  deleting: [],
};

const {
  action: autoScrobbleAction,
  getState: getAutoScrobbleState,
} = namespaceConfig('autoScrobble', DEFAULT_STATE);

export { getAutoScrobbleState };

// Reducers
const setLoadingState = autoScrobbleAction('setLoadingState',
  (state, loading) => ({
    ...state,
    loading,
  }));

const setErrorState = autoScrobbleAction('setErrorState',
  (state, error) => ({
    ...state,
    error,
  }));

const receivedautoScrobble = autoScrobbleAction('receivedautoScrobble',
  (state, data) => ({
    ...state,
    data,
  }));

const startDeleting = autoScrobbleAction('startDeleting',
  (state, id) => ({
    ...state,
    deleting: state.deleting.concat(id),
  }));

const endDeleting = autoScrobbleAction('endDeleting',
  (state, id) => ({
    ...state,
    deleting: state.deleting.filter(item => item !== id),
  }));

const removeAutoScrobble = autoScrobbleAction('removeAutoScrobble',
  (state, id) => ({
    ...state,
    data: state.data.filter(item => item.id !== id),
  }));

// Actions
export const fetchAutoScrobbles = () => (
  async (dispatch) => {
    try {
      dispatch(setLoadingState(true));
      const data = await fetch('/api/user/autoscrobbles', { credentials: 'include' }).then(r => r.json());
      dispatch(receivedautoScrobble(data));
    } catch (error) {
      dispatch(setErrorState(error));
    }
    dispatch(setLoadingState(false));
  }
);

export const deleteAutoScrobble = id => (
  async (dispatch) => {
    dispatch(startDeleting(id));
    try {
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
