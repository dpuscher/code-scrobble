import thunkMiddleware from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';

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

export default function initializeStore(initialState = {}) {
  return createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware)),
  );
}
