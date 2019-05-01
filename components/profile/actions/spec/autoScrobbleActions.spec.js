import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actionCreators from '../autoScrobbleActionCreators';
import {
  fetchAutoScrobbles, deleteAutoScrobble,
} from '../autoScrobbleActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const emptyStore = () => mockStore();

const demoAutoScrobbleData = [
  {
    id: '5ccb6ad74c5f76adff751342',
    artist: 'Farin Urlaub',
    title: 'Am Ende Der Sonne',
    year: '2005',
  },
];

describe('historyActions', () => {
  beforeEach(() => {
    fetch.mockResponse(JSON.stringify(demoAutoScrobbleData));
  });
  afterEach(() => {
    fetch.resetMocks();
  });

  describe('fetchAutoScrobbles', () => {
    it('sets loading state to true as first action', () => {
      const expectedAction = actionCreators.setLoadingState(true);
      const store = emptyStore();

      return store.dispatch(fetchAutoScrobbles())
        .then(() => expect(store.getActions()[0]).toEqual(expectedAction));
    });

    it('sets loading state back to false as last action', () => {
      const expectedAction = actionCreators.setLoadingState(false);
      const store = emptyStore();

      return store.dispatch(fetchAutoScrobbles())
        .then(() => expect(store.getActions().slice(-1)[0]).toEqual(expectedAction));
    });

    it('creates RECEIVED_HISTORY when fetching history has been done', () => {
      const expectedAction = actionCreators.receivedAutoScrobbles(demoAutoScrobbleData);
      const store = emptyStore();

      return store.dispatch(fetchAutoScrobbles())
        .then(() => expect(store.getActions()).toContainEqual(expectedAction));
    });

    it('sets error state to store when loading fails', () => {
      const error = new Error('Foooo!');
      fetch.mockReject(error);
      const expectedAction = actionCreators.setErrorState(error);
      const store = emptyStore();

      return store.dispatch(fetchAutoScrobbles())
        .then(() => expect(store.getActions()).toContainEqual(expectedAction));
    });

    it('sets loading state back to false after an error occured', () => {
      const expectedAction = actionCreators.setLoadingState(false);
      const store = emptyStore();

      return store.dispatch(fetchAutoScrobbles())
        .then(() => expect(store.getActions().slice(-1)[0]).toEqual(expectedAction));
    });

    it('sends a GET request to the api to get the history data', () => {
      const store = emptyStore();

      return store.dispatch(fetchAutoScrobbles()).then(() => {
        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual('/api/user/autoscrobbles');
      });
    });
  });

  describe('deleteAutoScrobble', () => {
    it('adds given id to deleting array as first action', () => {
      const id = 1337;
      const expectedAction = actionCreators.startDeleting(id);
      const store = emptyStore();

      return store.dispatch(deleteAutoScrobble(id))
        .then(() => expect(store.getActions()[0]).toEqual(expectedAction));
    });

    it('removes given id from deleting array as last action', () => {
      const id = 1337;
      const expectedAction = actionCreators.endDeleting(id);
      const store = emptyStore();

      return store.dispatch(deleteAutoScrobble(id))
        .then(() => expect(store.getActions().slice(-1)[0]).toEqual(expectedAction));
    });

    it('removes the given id from autoscrobbles after deleting', () => {
      const id = 1337;
      const expectedAction = actionCreators.removeAutoScrobble(id);
      const store = emptyStore();

      return store.dispatch(deleteAutoScrobble(id))
        .then(() => expect(store.getActions()).toContainEqual(expectedAction));
    });

    it('sets error state to store when loading fails', () => {
      const id = 1337;
      const error = new Error('Foooo!');
      fetch.mockReject(error);
      const expectedAction = actionCreators.setErrorState(error);
      const store = emptyStore();

      return store.dispatch(deleteAutoScrobble(id))
        .then(() => expect(store.getActions()).toContainEqual(expectedAction));
    });

    it('sets loading state back to false after an error occured', () => {
      const id = 1337;
      const expectedAction = actionCreators.endDeleting(id);
      const store = emptyStore();

      return store.dispatch(deleteAutoScrobble(id))
        .then(() => expect(store.getActions().slice(-1)[0]).toEqual(expectedAction));
    });

    it('sends a DELETE request to the api to delete the data', () => {
      const id = 1337;
      const store = emptyStore();

      return store.dispatch(deleteAutoScrobble(id)).then(() => {
        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual('/api/user/autoscrobbles');
        expect(fetch.mock.calls[0][1].method).toEqual('DELETE');
        expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify({ id }));
      });
    });
  });
});
