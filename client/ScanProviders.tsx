"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import NProgress from "nprogress";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk as thunkMiddleware } from "redux-thunk";
import { composeWithDevToolsLogOnlyInProduction as composeWithDevTools } from "@redux-devtools/extension";
import BaseStyles from "../components/layout/BaseStyles";
import NProgressStyles from "../styles/nprogress.styles";
import sessionReducer from "../components/session/reducers/sessionReducer";
import historyReducer from "../components/profile/reducers/historyReducer";
import autoScrobbleReducer from "../components/profile/reducers/autoScrobbleReducer";
import releaseReducer from "../components/release/reducers/releaseReducer";
import queryReducer from "../components/query/reducers/queryReducer";

const reducer = combineReducers({
  session: sessionReducer,
  history: historyReducer,
  autoScrobbles: autoScrobbleReducer,
  release: releaseReducer,
  query: queryReducer,
});

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunkMiddleware)));

NProgress.configure({ showSpinner: false });

function NProgressObserver() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      NProgress.done();
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}

export default function ScanProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <BaseStyles />
      <NProgressStyles />
      <NProgressObserver />
      {children}
    </Provider>
  );
}
