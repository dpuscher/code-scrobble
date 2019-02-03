import PropTypes from 'prop-types';

const ErrorIcon = ({ color, size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 367 367" width={size} height={size} className={className}>
    <g fill={color}>
      <path d="M365.2 329.6L191 27.8a8.6 8.6 0 0 0-15 0L1.3 330.6a8.6 8.6 0 0 0 7.4 13h349.7a8.6 8.6 0 0 0 7-14zm-341.6-3.3l159.9-277 159.8 277H23.6z" />
      <path d="M174.8 136.8v123.9a8.6 8.6 0 1 0 17.3 0V136.8a8.6 8.6 0 0 0-17.3 0zM183.5 279.4a10.7 10.7 0 1 0 0 21.4 10.7 10.7 0 0 0 0-21.4z" />
    </g>
  </svg>
);

ErrorIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};

ErrorIcon.defaultProps = {
  color: '#000',
  size: 100,
  className: undefined,
};

export default ErrorIcon;
