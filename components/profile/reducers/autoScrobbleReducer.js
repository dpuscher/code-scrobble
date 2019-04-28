import {
  RECEIVED_AUTO_SCROBBLES, SET_LOADING_STATE, SET_ERROR_STATE, START_DELETING,
  END_DELETING, REMOVE_AUTO_SCROBBLE,
} from '../constants/autoScrobbleConstants';

const initialState = {
  data: null,
  error: null,
  loading: true,
  deleting: [],
};

const autoScrobbleReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case RECEIVED_AUTO_SCROBBLES:
      return {
        ...state,
        data: action.autoScrobbles,
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

    case START_DELETING:
      return {
        ...state,
        deleting: state.deleting.concat(action.id),
      };

    case END_DELETING:
      return {
        ...state,
        deleting: state.deleting.filter(item => item !== action.id),
      };

    case REMOVE_AUTO_SCROBBLE:
      return {
        ...state,
        data: state.data.filter(item => item.id !== action.id),
      };

    default:
      return state;
  }
};

export default autoScrobbleReducer;
