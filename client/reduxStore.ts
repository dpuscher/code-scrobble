import { thunk as thunkMiddleware } from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevToolsLogOnlyInProduction as composeWithDevTools } from '@redux-devtools/extension';
import { createWrapper } from 'next-redux-wrapper';

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

const makeStore = () => createStore(
  reducer,
  composeWithDevTools(applyMiddleware(thunkMiddleware)),
);

export const wrapper = createWrapper(makeStore);
export default makeStore;
