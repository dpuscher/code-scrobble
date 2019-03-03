import PropTypes from 'prop-types';

const LastfmIcon = ({ color, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 25" width="100" height="25" {...props}>
    <title>Last.fm</title>
    <path fill={color} d="M35.5 14.8l-2.4-.5c-1.6-.4-2-1-2-2.1 0-1.3.9-2 2.5-2 1.8 0 2.7.6 2.9 2.2l3.7-.4c-.3-3.3-2.6-4.6-6.4-4.6-3.3 0-6.5 1.2-6.5 5.2 0 2.4 1.2 4 4.3 4.7l2.5.6c1.8.4 2.5 1.2 2.5 2.3 0 1.3-1.4 1.9-3.9 1.9-3.7 0-5.2-2-6.1-4.6l-1.2-3.7c-1.6-4.7-4-6.4-9-6.4-5.4 0-8.2 3.3-8.2 9 0 5.6 2.9 8.6 8 8.6 4.2 0 6.2-2 6.2-2l-1.2-3s-2 2-4.8 2c-2.6 0-4.4-2.2-4.4-5.7 0-4.4 2.3-6 4.6-6 3.2 0 4.2 2 5.1 4.7l1.2 3.6c1.2 3.6 3.4 6.4 9.8 6.4 4.5 0 7.6-1.4 7.6-5 0-3-1.7-4.5-4.8-5.2zM3.9 20V.4H0V21c0 2.7 2 3.9 4.2 3.9.7 0 1.4-.2 2.3-.4v-3.1a4 4 0 0 1-1.1.1c-1 0-1.5-.4-1.5-1.4zM50.3 21.8c-1.4 0-2.2-.8-2.2-2.5v-8.6h5.1v-3h-5v-4l-4 .5v3.5h-2.4v3h2.5v9.4c0 3.3 2 4.9 5 4.9 1.8 0 3.4-.3 4.6-1l-.7-3.2c-1 .6-1.8 1-2.9 1zM59.2 19.4a2.6 2.6 0 0 0-2.7 2.7c0 1.5 1.2 2.7 2.7 2.7 1.6 0 2.8-1.2 2.8-2.7 0-1.5-1.2-2.7-2.8-2.7zM66 6v1.8h-2.5v3H66v13.8h3.9V10.7h4.3v-3H70V6.3c0-2.3 1-3 2.6-3 1.1 0 1.9.3 2.8.7l.6-3.2c-1-.4-2.2-.7-3.7-.7C68.9 0 66 1.5 66 6zM95 7.4c-2.4 0-4.5 1-5.4 3.7-.4-2.8-2.2-3.7-4.6-3.7-2.3 0-4.4 1-5.3 3.6l-.4-3.2H76v16.8H80V15c0-3.3 1.7-4.5 3.5-4.5 1.9 0 2.7 1.2 2.7 3.2v10.8H90V15c0-3.2 1.7-4.4 3.5-4.4 1.9 0 2.6 1.2 2.6 3.2v10.8h3.9V12.5c0-3.6-2.1-5.1-5-5.1z" />
  </svg>
);

LastfmIcon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
};

LastfmIcon.defaultProps = {
  className: undefined,
  color: '#fff',
};

export default LastfmIcon;