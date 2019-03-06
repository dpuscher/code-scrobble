import { Container } from 'unstated';

export default class SessionState extends Container {
  state = {
    data: null,
    error: null,
    loading: false,
  };

  fetch = async () => {
    await this.setState({ loading: true });
    try {
      const data = await fetch('/session', { credentials: 'include' }).then(r => r.json());
      await this.setState({ data, loading: false });
    } catch (error) {
      await this.setState({ error, loading: false });
    }
  }
}

export const sessionState = new SessionState();
