import {
  SET_LOADING_STATE, SET_ERROR_STATE, SET_QUERY_STRING, RECEIVED_RESULTS,
} from '../constants/queryConstants';

const initialState = {
  query: '',
  results: [],
  error: null,
  loading: false,
};

const queryReducer = (state = initialState, action = {}) => {
  switch (action.type) {
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

    case SET_QUERY_STRING:
      return {
        ...state,
        query: action.query,
      };

    case RECEIVED_RESULTS:
      return {
        ...state,
        results: action.results,
      };

    default:
      return state;
  }
};

export default queryReducer;
