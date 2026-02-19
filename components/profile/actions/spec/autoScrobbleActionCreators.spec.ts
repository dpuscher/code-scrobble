import {
  setLoadingState, setErrorState, receivedAutoScrobbles, startDeleting, removeAutoScrobble,
  endDeleting,
} from '../autoScrobbleActionCreators';
import {
  SET_LOADING_STATE, SET_ERROR_STATE, RECEIVED_AUTO_SCROBBLES, START_DELETING, END_DELETING,
  REMOVE_AUTO_SCROBBLE,
} from '../../constants/autoScrobbleConstants';

describe('autoScrobbleActionCreators', () => {
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

  describe('receivedAutoScrobbles', () => {
    const autoScrobbles = ['foo', 'bar'];
    const receivedAutoScrobblesAction = receivedAutoScrobbles(autoScrobbles);

    it('returns correct type', () => {
      expect(receivedAutoScrobblesAction).toMatchObject({ type: RECEIVED_AUTO_SCROBBLES });
    });

    it('returns autoScrobbles in action', () => {
      expect(receivedAutoScrobblesAction).toMatchObject({ autoScrobbles });
    });
  });

  describe('startDeleting', () => {
    const id = 1337;
    const startDeletingAction = startDeleting(id);

    it('returns correct type', () => {
      expect(startDeletingAction).toMatchObject({ type: START_DELETING });
    });

    it('returns id in action', () => {
      expect(startDeletingAction).toMatchObject({ id });
    });
  });

  describe('removeAutoScrobble', () => {
    const id = 1337;
    const removeAutoScrobbleAction = removeAutoScrobble(id);

    it('returns correct type', () => {
      expect(removeAutoScrobbleAction).toMatchObject({ type: REMOVE_AUTO_SCROBBLE });
    });

    it('returns id in action', () => {
      expect(removeAutoScrobbleAction).toMatchObject({ id });
    });
  });

  describe('endDeleting', () => {
    const id = 1337;
    const endDeletingAction = endDeleting(id);

    it('returns correct type', () => {
      expect(endDeletingAction).toMatchObject({ type: END_DELETING });
    });

    it('returns id in action', () => {
      expect(endDeletingAction).toMatchObject({ id });
    });
  });
});
