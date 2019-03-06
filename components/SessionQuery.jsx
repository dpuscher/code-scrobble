import PropTypes from 'prop-types';
import { Subscribe } from 'unstated';
import SessionState from '../app/states/SessionState';

const SessionQuery = ({ children }) => (
  <Subscribe to={[SessionState]}>
    {(container) => {
      const { data, error, loading } = container.state;
      if (!data && !error && !loading) {
        container.fetch();
      }
      return children({ data: data || {}, error, loading });
    }}
  </Subscribe>
);

SessionQuery.propTypes = {
  children: PropTypes.func.isRequired,
};

export default SessionQuery;
