import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actionCreators from '../historyActionCreators';
import { fetchHistory } from '../historyActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const emptyStore = () => mockStore({});

const demoHistoryData = [{
  id: '5ccb6ae44c5f76adff751352',
  time: '2019-05-02T22:10:44.378Z',
  artist: 'Farin Urlaub',
  title: 'Am Ende Der Sonne',
  year: '2005',
  barcode: '0419594000028',
  discogsId: 2852926,
}];

describe('historyActions', () => {
  beforeEach(() => {
    fetch.mockResponse(JSON.stringify(demoHistoryData));
  });
  afterEach(() => {
    fetch.resetMocks();
  });

  it('sets loading state to true as first action', () => {
    const expectedAction = actionCreators.setLoadingState(true);
    const store = emptyStore();

    return store.dispatch(fetchHistory())
      .then(() => expect(store.getActions()[0]).toEqual(expectedAction));
  });

  it('sets loading state back to false as last action', () => {
    const expectedAction = actionCreators.setLoadingState(false);
    const store = emptyStore();

    return store.dispatch(fetchHistory())
      .then(() => expect(store.getActions().slice(-1)[0]).toEqual(expectedAction));
  });

  it('creates RECEIVED_HISTORY when fetching history has been done', () => {
    const expectedAction = actionCreators.receivedHistory(demoHistoryData);
    const store = emptyStore();

    return store.dispatch(fetchHistory())
      .then(() => expect(store.getActions()).toContainEqual(expectedAction));
  });

  it('sets error state to store when loading fails', () => {
    const error = new Error('Foooo!');
    fetch.mockReject(error);
    const expectedAction = actionCreators.setErrorState(error);
    const store = emptyStore();

    return store.dispatch(fetchHistory())
      .then(() => expect(store.getActions()).toContainEqual(expectedAction));
  });

  it('sets loading state back to false after an error occured', () => {
    const expectedAction = actionCreators.setLoadingState(false);
    const store = emptyStore();

    return store.dispatch(fetchHistory())
      .then(() => expect(store.getActions().slice(-1)[0]).toEqual(expectedAction));
  });

  it('sends a GET request to the api to get the history data', () => {
    const store = emptyStore();

    return store.dispatch(fetchHistory()).then(() => {
      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('/api/user/history');
    });
  });
});
