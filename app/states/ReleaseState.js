import { Container } from 'unstated';

export default class ReleaseState extends Container {
  state = {
    releases: {},
  };

  set = (id, release) => {
    this.setState(state => (
      { releases: Object.assign({}, state.releases, { [id]: release }) }
    ));
  }

  get = id => (
    this.state.releases[id] || {}
  )

  reset = () => {
    this.setState({ releases: {} });
  }
}

export const releaseState = new ReleaseState();
