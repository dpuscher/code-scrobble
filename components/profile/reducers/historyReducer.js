import { RECEIVED_HISTORY, SET_LOADING_STATE, SET_ERROR_STATE } from '../constants/historyConstants';

const historyReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case RECEIVED_HISTORY:
      return {
        ...state,
        data: action.history,
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

export default historyReducer;
