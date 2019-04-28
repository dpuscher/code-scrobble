import { SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_RELEASE } from '../constants/releaseConstants';

const releaseReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case RECEIVED_RELEASE:
      return {
        ...state,
        [action.code]: {
          ...state[action.code],
          data: action.release,
        },
      };

    case SET_LOADING_STATE:
      return {
        ...state,
        [action.code]: {
          ...state[action.code],
          loading: action.loading,
        },
      };

    case SET_ERROR_STATE:
      return {
        ...state,
        [action.code]: {
          ...state[action.code],
          error: action.error,
        },
      };

    default:
      return state;
  }
};

export default releaseReducer;
