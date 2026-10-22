import { RECEIVED_SESSION, SET_LOADING_STATE, SET_ERROR_STATE } from '../constants/sessionConstants';

const sessionReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case RECEIVED_SESSION:
      return {
        ...state,
        data: action.session,
      };

    case SET_LOADING_STATE:
      return {
        ...state,
        loading: action.loading,
      };

    case SET_ERROR_STATE:
      return {
        ...state,
        error: action.error,
      };

    default:
      return state;
  }
};

export default sessionReducer;
