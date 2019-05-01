import autoScrobbleReducer from '../autoScrobbleReducer';
import {
  setLoadingState, setErrorState, receivedAutoScrobbles, startDeleting, removeAutoScrobble,
  endDeleting,
} from '../../actions/autoScrobbleActionCreators';

describe('autoScrobbleReducer', () => {
  it('uses the correct initial state', () => {
    expect(autoScrobbleReducer()).toEqual({
      data: null,
      deleting: [],
      error: null,
      loading: true,
    });
  });

  it('saves autoScrobbles to store', () => {
    const state = {
      data: null,
    };
    const autoScrobbles = ['foo', 'bar'];
    const action = receivedAutoScrobbles(autoScrobbles);
    const nextState = autoScrobbleReducer(state, action);

    expect(nextState).toEqual({
      data: autoScrobbles,
    });
  });

  it('saves loading state to store', () => {
    const state = {
      loading: false,
    };
    const action = setLoadingState(true);
    const nextState = autoScrobbleReducer(state, action);

    expect(nextState).toEqual({
      loading: true,
    });
  });

  it('saves error state to store', () => {
    const state = {
      error: null,
    };
    const error = 'FooBar';
    const action = setErrorState(error);
    const nextState = autoScrobbleReducer(state, action);

    expect(nextState).toEqual({
      error,
    });
  });

  it('saves starting of delete-process to store', () => {
    const state = {
      deleting: ['foo'],
    };
    const deleting = 'bar';
    const action = startDeleting(deleting);
    const nextState = autoScrobbleReducer(state, action);

    expect(nextState).toEqual({
      deleting: ['foo', 'bar'],
    });
  });

  it('removes autoScrobble from store', () => {
    const state = {
      data: [{ id: 'foo' }, { id: 'bar' }],
    };
    const deleting = 'foo';
    const action = removeAutoScrobble(deleting);
    const nextState = autoScrobbleReducer(state, action);

    expect(nextState).toEqual({
      data: [{ id: 'bar' }],
    });
  });

  it('saves ending of delete-process to store', () => {
    const state = {
      deleting: ['foo', 'bar'],
    };
    const deleting = 'bar';
    const action = endDeleting(deleting);
    const nextState = autoScrobbleReducer(state, action);

    expect(nextState).toEqual({
      deleting: ['foo'],
    });
  });
});
