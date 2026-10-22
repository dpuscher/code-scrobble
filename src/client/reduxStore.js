import { thunk } from 'redux-thunk';
import {
  applyMiddleware, combineReducers, compose, legacy_createStore as createStore,
} from 'redux';

import sessionReducer from '../components/session/reducers/sessionReducer';
import historyReducer from '../components/profile/reducers/historyReducer';
import autoScrobbleReducer from '../components/profile/reducers/autoScrobbleReducer';
import releaseReducer from '../components/release/reducers/releaseReducer';
import queryReducer from '../components/query/reducers/queryReducer';

const reducer = combineReducers({
  session: sessionReducer,
  history: historyReducer,
  autoScrobbles: autoScrobbleReducer,
  release: releaseReducer,
  query: queryReducer,
});

const composeEnhancers = (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production'
  && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export default function initializeStore(initialState = {}) {
  return createStore(reducer, initialState, composeEnhancers(applyMiddleware(thunk)));
}
