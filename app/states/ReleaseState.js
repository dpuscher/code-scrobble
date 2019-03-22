import { namespaceConfig, dynamicPropertyConfig } from 'fast-redux';

const DEFAULT_STATE = {};
const { action } = namespaceConfig('release', DEFAULT_STATE);

const DEFAULT_RELEASE_STATE = {
  data: {},
  loading: true,
  error: null,
};

const {
  propertyAction: releaseAction,
  getPropertyState: getReleaseState,
} = dynamicPropertyConfig(action, DEFAULT_RELEASE_STATE);

export { getReleaseState };


// Reducers
const setLoadingState = releaseAction('setLoadingState',
  (state, loading) => ({
    ...state,
    loading,
  }));

const setErrorState = releaseAction('setErrorState',
  (state, error) => ({
    ...state,
    error,
  }));

const receivedRelease = releaseAction('receivedRelease',
  (state, data) => ({
    ...state,
    data,
  }));


const shouldFetchRelease = release => !release.data.id;

// Actions
export const fetchRelease = code => (
  async (dispatch) => {
    try {
      dispatch(setErrorState(null));
      dispatch(setLoadingState(code, true));

      const data = await fetch(`/api/search/${code}`, { credentials: 'include' }).then(r => r.json());

      if (data.id) {
        dispatch(receivedRelease(code, data));
      } else {
        dispatch(setErrorState(code, 'No release found'));
      }
    } catch (error) {
      dispatch(setErrorState(code, error));
    }
    dispatch(setLoadingState(code, false));
  }
);

export const fetchReleaseIfNeeded = code => (
  (dispatch, getState) => {
    const state = getReleaseState(getState());
    if (shouldFetchRelease(state)) {
      dispatch(fetchRelease(code));
    }
  }
);
