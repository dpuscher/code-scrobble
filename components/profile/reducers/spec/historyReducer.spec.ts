import historyReducer from '../historyReducer';
import { setLoadingState, setErrorState, receivedHistory } from '../../actions/historyActionCreators';

describe('historyReducer', () => {
  it('uses an empty object as initial state', () => {
    expect(historyReducer()).toEqual({});
  });

  it('saves history to store', () => {
    const state = {
      data: null,
    };
    const history = ['foo', 'bar'];
    const action = receivedHistory(history);
    const nextState = historyReducer(state, action);

    expect(nextState).toEqual({
      data: history,
    });
  });

  it('saves loading state to store', () => {
    const state = {
      loading: false,
    };
    const action = setLoadingState(true);
    const nextState = historyReducer(state, action);

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
    const nextState = historyReducer(state, action);

    expect(nextState).toEqual({
      error,
    });
  });
});
