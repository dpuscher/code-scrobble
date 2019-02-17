import PropTypes from 'prop-types';

const LoginButton = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 303 115" className={className}>
    <path fill="#FFF" stroke="#D51007" strokeMiterlimit="10" strokeWidth="3" d="M289.5 113.5h-276a12 12 0 0 1-12-12v-88a12 12 0 0 1 12-12h276a12 12 0 0 1 12 12v88a12 12 0 0 1-12 12z" />
    <g fill="#D51007">
      <path d="M80.1 98.3l-3-8.3s-5 5.5-12.4 5.5c-6.6 0-11.2-5.7-11.2-14.9 0-11.7 5.9-15.9 11.7-15.9 8.3 0 11 5.4 13.3 12.4l3 9.5c3 9.3 8.8 16.7 25.2 16.7 11.8 0 19.8-3.6 19.8-13.1 0-7.8-4.4-11.8-12.5-13.7l-6.1-1.3c-4.2-1-5.4-2.7-5.4-5.5 0-3.3 2.5-5.2 6.7-5.2 4.6 0 7 1.7 7.4 5.8l9.5-1.1c-.7-8.6-6.6-12.1-16.3-12.1-8.6 0-17 3.2-17 13.6 0 6.5 3.2 10.6 11 12.5l6.5 1.5c4.9 1.2 6.5 3.2 6.5 6 0 3.5-3.4 5-9.9 5-9.6 0-13.6-5.1-15.9-12.1L88 74c-4-12.4-10.4-17-23-17-14 0-21.4 9-21.4 24 0 14.5 7.4 22.3 20.7 22.3 10.8 0 15.9-5 15.9-5zM39.4 93.8c-1 .3-1.9.5-3.1.5-2.3 0-4-1-4-3.8v-52h-10v54.3c0 7.2 5 10.2 10.8 10.2 2 0 3.7-.3 6-.9l.3-8.3zM159.7 92.3a12 12 0 0 1-7.4 2.5c-3.6 0-5.6-1.9-5.6-6.5V65.9h13.1v-7.8h-13V47.5l-10.1 1.3V58h-6.4V66h6.4v24.5c0 8.7 5 13 13.2 13 4.5 0 8.5-1 11.6-2.7l-1.8-8.4zM168.4 95.7c0 4 3 7 7 7a7 7 0 0 0 7-7c0-4-3-7-7-7s-7 3-7 7zM192.8 66v36.2h10V65.9H214v-7.8h-11.2v-4c0-6 2.6-8 6.7-8 3 0 5 .8 7.3 2l1.6-8.4c-2.7-1.2-5.8-2-9.6-2-8.4 0-16 4.1-16 16v4.4h-6.4V66h6.4zM253.8 66.8c-1.1-7.2-5.8-9.7-11.9-9.7-6 0-11.3 2.7-13.6 9.5l-1.2-8.5H219v44h10V77.4c0-8.5 4.4-11.7 9-11.7 4.9 0 6.9 3.2 6.9 8.4v28.2h9.9v-25c0-8.4 4.4-11.6 9-11.6 4.8 0 6.8 3.2 6.8 8.4v28.2h10V70.5c0-9.4-5.5-13.4-12.8-13.4-6.2 0-11.7 2.7-14 9.7z" />
      <path d="M34.8 11.7v2h-10v5.7H34v2h-9.3v6.3h10.1v2H22.4v-18h12.4zM37.2 14.3v-2.6h2.1v2.6h-2.1zm2.1 2.4v13h-2.1v-13h2.1zM44.4 16.7v2h.1a4.5 4.5 0 0 1 4.2-2.4c.9 0 1.6.2 2.2.4a3.5 3.5 0 0 1 2.1 2.5c.2.6.2 1.2.2 2v8.5h-2.1V21c0-.8-.2-1.5-.7-2-.5-.4-1.1-.7-2-.7-.6 0-1.2.1-1.7.4-.4.2-.8.4-1.2.8l-.7 1.3-.2 1.7v7.3h-2.2v-13h2zM58.5 11.7v18h-2.2v-18h2.2zM61.3 20.5c.3-.8.7-1.5 1.2-2.2.6-.6 1.2-1 2-1.4.8-.4 1.7-.6 2.8-.6 1 0 2 .2 2.7.6a5.7 5.7 0 0 1 3.2 3.6 8.8 8.8 0 0 1 0 5.4c-.3.8-.7 1.5-1.2 2.2-.6.6-1.2 1-2 1.4-.8.4-1.7.5-2.7.5-1 0-2-.1-2.8-.5-.8-.3-1.4-.8-2-1.4-.5-.7-.9-1.4-1.2-2.2-.2-.8-.4-1.7-.4-2.7 0-1 .2-1.8.4-2.7zm2.2 4.8c.2.6.5 1.2.9 1.6a3.8 3.8 0 0 0 2.9 1.3 3.9 3.9 0 0 0 3.7-2.9c.2-.6.3-1.3.3-2 0-.9 0-1.6-.3-2.2-.2-.6-.5-1.1-.9-1.6a3.7 3.7 0 0 0-2.8-1.3 3.9 3.9 0 0 0-3 1.3l-.8 1.6c-.2.6-.3 1.3-.3 2.1s.1 1.5.3 2.1zM85.8 33.4c-1 1.1-2.5 1.6-4.6 1.6-.6 0-1.2 0-1.9-.2-.6-.1-1.2-.3-1.7-.6a4 4 0 0 1-1.3-1.2c-.3-.5-.5-1.1-.5-1.8h2.1c0 .4.2.7.4 1 .2.2.5.5.8.6l1.1.4 1.1.1a4 4 0 0 0 1.8-.3c.5-.3.9-.6 1.2-1 .3-.5.6-1 .7-1.6.2-.6.2-1.3.2-2v-.9c-.4.8-1 1.4-1.7 1.8a5.7 5.7 0 0 1-5 0c-.7-.3-1.3-.8-1.8-1.4a6 6 0 0 1-1-2c-.3-.9-.4-1.7-.4-2.6 0-.8 0-1.6.3-2.4.2-.8.5-1.6 1-2.3.5-.6 1-1.2 1.9-1.6a5.8 5.8 0 0 1 5-.1c.8.4 1.3.9 1.7 1.6v-1.8h2v12c0 2-.4 3.7-1.4 4.7zM83 27.6c.5-.3 1-.7 1.2-1.2.3-.5.6-1 .7-1.6a8 8 0 0 0 0-3.6l-.6-1.5c-.3-.4-.7-.8-1.2-1-.4-.3-1-.5-1.7-.5s-1.3.2-1.8.4l-1.2 1a7.4 7.4 0 0 0-.9 3.3l.2 1.9c.1.6.3 1.1.6 1.6s.7.9 1.2 1.2c.4.3 1 .4 1.7.4s1.3-.1 1.8-.4zM100.2 33.4c-1 1.1-2.5 1.6-4.6 1.6-.6 0-1.2 0-1.9-.2-.6-.1-1.2-.3-1.7-.6a4 4 0 0 1-1.3-1.2c-.3-.5-.5-1.1-.5-1.8h2.1c0 .4.2.7.4 1 .2.2.5.5.8.6l1 .4 1.2.1a4 4 0 0 0 1.8-.3c.5-.3.9-.6 1.2-1 .3-.5.6-1 .7-1.6l.2-2v-.9c-.4.8-1 1.4-1.7 1.8a5.7 5.7 0 0 1-5 0c-.7-.3-1.3-.8-1.8-1.4a6 6 0 0 1-1-2c-.3-.9-.4-1.7-.4-2.6 0-.8 0-1.6.3-2.4.2-.8.5-1.6 1-2.3.5-.6 1-1.2 1.8-1.6a5.8 5.8 0 0 1 5.2-.1c.7.4 1.2.9 1.6 1.6v-1.8h2v12c0 2-.5 3.7-1.4 4.7zm-2.8-5.8c.5-.3 1-.7 1.2-1.2.3-.5.6-1 .7-1.6a8 8 0 0 0 0-3.6l-.6-1.5c-.3-.4-.7-.8-1.2-1-.5-.3-1-.5-1.7-.5s-1.3.2-1.8.4l-1.2 1A7.4 7.4 0 0 0 92 23l.2 1.9c.1.6.3 1.1.6 1.6s.7.9 1.2 1.2c.4.3 1 .4 1.7.4s1.3-.1 1.8-.4zM114 29a6 6 0 0 1-3.7 1c-1 0-2-.1-2.7-.5-.8-.3-1.4-.8-2-1.4a6 6 0 0 1-1.1-2.2 8 8 0 0 1 0-5.5 5.8 5.8 0 0 1 5.7-4c1.1 0 2 .2 2.8.7.8.5 1.4 1 1.9 1.8.4.8.8 1.6 1 2.4s.2 1.8.2 2.5h-9.8c0 .6 0 1.2.2 1.7a3.6 3.6 0 0 0 2 2.3c.5.2 1.1.4 1.9.4.9 0 1.6-.3 2.2-.7.6-.4 1-1 1.1-2h2.2c-.3 1.6-1 2.7-2 3.4zm-.6-8.5a3.7 3.7 0 0 0-1.9-2c-.4-.2-1-.3-1.5-.3l-1.5.3-1.1.8-.8 1.2-.3 1.4h7.5c0-.5-.2-1-.4-1.4zM120.3 16.7v2a4.5 4.5 0 0 1 4.3-2.4c.8 0 1.5.2 2.1.4a3.5 3.5 0 0 1 2.2 2.5l.2 2v8.5h-2.2V21c0-.8-.2-1.5-.7-2-.5-.4-1.1-.7-2-.7-.6 0-1.2.1-1.6.4-.5.2-1 .4-1.2.8-.4.4-.6.8-.8 1.3l-.2 1.7v7.3h-2.1v-13h2zM141.3 16.7v1.9c1-1.5 2.5-2.3 4.3-2.3.8 0 1.5.2 2.2.6.7.3 1.1.9 1.4 1.7.4-.7 1-1.3 1.7-1.7.7-.4 1.5-.6 2.4-.6l1.8.3c.5.1 1 .3 1.3.6.4.3.7.7 1 1.2l.2 1.7v9.6h-2.1v-8.5l-.1-1.2c0-.3-.2-.6-.4-.9-.2-.3-.4-.5-.8-.6a3 3 0 0 0-1.2-.3c-1.1 0-2 .4-2.5 1s-1 1.4-1 2.4v8.1h-2.1v-8.5l-.1-1.2c0-.4-.2-.7-.4-1-.2-.2-.4-.4-.8-.5-.3-.2-.7-.3-1.2-.3-.6 0-1.1.2-1.6.4a3.6 3.6 0 0 0-1.8 3v8.1h-2.2v-13h2zM160.7 14.3v-2.6h2.2v2.6h-2.2zm2.2 2.4v13h-2.2v-13h2.2zM171.6 16.7v1.9H169v8.7l.3.3.5.2h1.8v2h-1.7c-.5 0-1 0-1.4-.2a2 2 0 0 1-1-.4l-.5-.8a5 5 0 0 1-.2-1.5v-8.3h-2.2v-2h2.2v-3.9h2.2v4h2.6z" />
    </g>
  </svg>
);

LoginButton.propTypes = {
  className: PropTypes.string,
};

LoginButton.defaultProps = {
  className: undefined,
};

export default LoginButton;