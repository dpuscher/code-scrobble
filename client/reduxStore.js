import thunkMiddleware from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';

import sessionReducer from '../components/session/reducers/sessionReducer';
import historyReducer from '../components/profile/reducers/historyReducer';

const reducer = combineReducers({
  session: sessionReducer,
  history: historyReducer,
});

export default function initializeStore(initialState = {}) {
  return createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware)),
  );
}
