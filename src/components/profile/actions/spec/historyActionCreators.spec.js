import { setLoadingState, setErrorState, receivedHistory } from '../historyActionCreators';
import { SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_HISTORY } from '../../constants/historyConstants';

describe('historyActionCreators', () => {
  describe('setLoadingState', () => {
    const setLoadingStateAction = setLoadingState(true);

    it('returns correct type', () => {
      expect(setLoadingStateAction).toMatchObject({ type: SET_LOADING_STATE });
    });

    it('returns passed loading state in action', () => {
      expect(setLoadingStateAction).toMatchObject({ loading: true });
    });
  });

  describe('setErrorState', () => {
    const error = 'FooBar';
    const setErrorStateAction = setErrorState(error);

    it('returns correct type', () => {
      expect(setErrorStateAction).toMatchObject({ type: SET_ERROR_STATE });
    });

    it('returns passed error state in action', () => {
      expect(setErrorStateAction).toMatchObject({ error });
    });
  });

  describe('receivedHistory', () => {
    const history = ['foo', 'bar'];
    const receivedHistoryAction = receivedHistory(history);

    it('returns correct type', () => {
      expect(receivedHistoryAction).toMatchObject({ type: RECEIVED_HISTORY });
    });

    it('returns history in action', () => {
      expect(receivedHistoryAction).toMatchObject({ history });
    });
  });
});
