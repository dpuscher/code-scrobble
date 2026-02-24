import { setLoadingState, receivedRelease, setErrorState } from "./releaseActionCreators";

const shouldFetchRelease = release => !release || !release.data?.id;

export const fetchRelease = code => async dispatch => {
  try {
    dispatch(setErrorState(code, null));
    dispatch(setLoadingState(code, true));

    const response = await fetch(`/api/barcode/${code}`, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.id) {
      dispatch(receivedRelease(code, data));
    } else {
      dispatch(setErrorState(code, "No release found"));
    }
  } catch (error) {
    dispatch(setErrorState(code, error));
  }
  dispatch(setLoadingState(code, false));
};

export const fetchReleaseIfNeeded = code => (dispatch, getState) => {
  if (shouldFetchRelease(getState().release[code])) {
    dispatch(fetchRelease(code));
  }
};
