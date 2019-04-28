import thunkMiddleware from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';

import sessionReducer from '../components/session/reducers/sessionReducer';
import historyReducer from '../components/profile/reducers/historyReducer';
import autoScrobbleReducer from '../components/profile/reducers/autoScrobbleReducer';

const reducer = combineReducers({
  session: sessionReducer,
  history: historyReducer,
  autoScrobbles: autoScrobbleReducer,
});

export default function initializeStore(initialState = {}) {
  return createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware)),
  );
}
