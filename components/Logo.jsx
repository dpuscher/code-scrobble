import PropTypes from 'prop-types';

const Logo = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 105" className={className}>
    <path d="M8.1 91.1c-1 0-1.9-.1-2.9-.5s-1.9-1-2.6-1.7a8.5 8.5 0 0 1-1.9-3 12 12 0 0 1-.7-4.3V23.4c0-1.7.2-3.2.7-4.4a8.5 8.5 0 0 1 1.9-3A8.4 8.4 0 0 1 8 13.9h1.6c2 0 3.8.8 5.5 2.3 1.7 1.5 2.6 4 2.6 7.3v21.8h-4V24c0-2.5-.4-4.3-1.4-5.3-1-1-2-1.6-3.1-1.6h-1c-1 0-2 .5-3 1.6-.9 1-1.4 2.8-1.4 5.3v57c0 2.5.5 4.3 1.4 5.3 1 1 2 1.6 3 1.6h1c1.1 0 2.2-.5 3.1-1.6 1-1 1.4-2.8 1.4-5.3V59.7h4v21.9c0 3.4-.9 5.8-2.6 7.3a8.3 8.3 0 0 1-5.5 2.2H8zM31.7 91.1c-1 0-2-.1-3-.5s-1.8-1-2.6-1.7a8.5 8.5 0 0 1-1.9-3 12 12 0 0 1-.7-4.3V23.4c0-1.7.3-3.2.7-4.4a8.5 8.5 0 0 1 2-3c.7-.7 1.6-1.2 2.5-1.6 1-.4 2-.5 3-.5h1.5c2 0 3.8.7 5.5 2.2 1.7 1.5 2.6 4 2.6 7.3v58.2c0 3.4-.9 5.8-2.6 7.3a8.3 8.3 0 0 1-5.5 2.2h-1.5zm.2-74c-1 0-2 .5-3 1.6-1 1-1.4 2.8-1.4 5.3v57c0 2.5.4 4.3 1.4 5.3 1 1 2 1.6 3 1.6h.9c1.2 0 2.2-.5 3.2-1.6 1-1 1.4-2.8 1.4-5.3V24c0-2.5-.5-4.3-1.4-5.3-1-1-2-1.6-3.2-1.6h-.9zM47.2 90.5v-76h9.6c1 0 2 .2 2.9.5 1 .3 1.8.8 2.6 1.5s1.4 1.6 1.9 2.8c.4 1.2.7 2.6.7 4.3v57.8c0 1.7-.3 3.2-.7 4.3a7.3 7.3 0 0 1-4.5 4.3c-1 .3-2 .5-2.9.5h-9.6zm4-72.7v69.4h5.3c1 0 2-.4 3-1.3 1-1 1.4-2.6 1.4-5V24.1c0-2.5-.4-4.2-1.4-5-1-1-2-1.4-3-1.4H51zM74.6 17.8V51h7.9v3h-7.9v33.2h10.6v3.3H70.7v-76H85v3.3H74.6z" />
    <path fill="#D51007" d="M103.6 45V26.7c0-1.7-.1-2.9-.5-3.6-.3-.7-.8-1.1-1.4-1.1h-.5c-.6 0-1.1.3-1.4 1-.4.7-.5 2-.5 3.7v8.6c0 2.4.3 4.6 1 6.5.7 1.9 1.6 3.6 2.6 5.3 1 1.6 2.2 3.1 3.4 4.6 1.2 1.5 2.3 3 3.4 4.8 1 1.6 1.9 3.4 2.6 5.3.7 1.9 1 4 1 6.5v11.6c0 2-.3 3.7-.9 5.1a9.8 9.8 0 0 1-6 5.6c-1.2.4-2.6.6-4 .6h-1.7c-1.3 0-2.7-.2-4-.6a10 10 0 0 1-6.2-5.5c-.6-1.5-1-3.2-1-5.2v-20h9v18.6c0 1.7.2 2.9.6 3.6.5.7 1 1.1 1.9 1.1h.3c1.5 0 2.3-1.6 2.3-4.7v-8.7c0-2.4-.3-4.5-1-6.4-.7-1.9-1.6-3.6-2.6-5.3a55 55 0 0 0-3.4-4.6c-1.2-1.5-2.3-3-3.4-4.7-1-1.6-2-3.4-2.6-5.3-.7-2-1-4.1-1-6.6V25.2c0-2 .3-3.7.9-5.1a9.4 9.4 0 0 1 2.5-3.6c1-.9 2.3-1.6 3.6-2 1.3-.4 2.6-.6 4-.6h1.1c1.3 0 2.6.2 4 .6a9.8 9.8 0 0 1 6 5.5 13 13 0 0 1 .9 5.2V45h-9zM128.4 91.1c-1.3 0-2.6-.2-4-.6-1.2-.4-2.4-1.1-3.5-2-1-1-1.9-2.1-2.5-3.6a13 13 0 0 1-.9-5V25.1c0-2 .3-3.7 1-5.1a9.4 9.4 0 0 1 6-5.6c1.3-.4 2.6-.6 3.9-.6h2c1.3 0 2.7.2 4 .6 1.3.4 2.5 1.1 3.5 2 1 1 1.8 2.1 2.4 3.6a13 13 0 0 1 1 5v20h-9.7V26.6c0-1.7-.2-2.9-.5-3.6-.4-.7-.8-1.1-1.5-1.1h-.4c-.7 0-1.2.3-1.5 1-.3.7-.5 2-.5 3.7v51.8c0 3.1.7 4.7 2 4.7h.4c1.3 0 2-1.6 2-4.7V59.7h9.7v20.1c0 2-.3 3.7-1 5.1a9.8 9.8 0 0 1-5.9 5.6c-1.3.4-2.7.6-4 .6h-2zM169.3 45.2c0 2.3-.4 4-1.1 5.1a5.2 5.2 0 0 1-2.8 2.3c1.1.2 2 1 2.8 2 .7 1.2 1 3 1 5.2v16.5c0 5.2.3 8.8.7 10.9.4 2 .6 3.1.8 3.3H161c-.6-.9-1-2.4-1.2-4.7-.2-2.2-.2-5.4-.2-9.5V60.7c0-3-.7-4.6-1.9-4.6h-2.5v34.4h-9.7v-76h13c3 0 5.6 1 7.7 3 2 1.9 3 4.7 3 8.2v19.5zM157.7 49c1.2 0 1.9-1.5 1.9-4.4V27.2c0-3-.7-4.6-2.1-4.6h-2.3V49h2.5zM184.8 91.1c-1.3 0-2.6-.2-4-.6-1.2-.4-2.4-1.1-3.5-2-1-1-1.9-2.1-2.5-3.6a13 13 0 0 1-.9-5V25.1c0-2 .3-3.7 1-5.1a9.4 9.4 0 0 1 6-5.6c1.3-.4 2.6-.6 4-.6h1.9c1.3 0 2.7.2 4 .6 1.3.4 2.5 1.1 3.5 2 1 1 1.8 2.1 2.4 3.6a13 13 0 0 1 1 5v54.7c0 2-.3 3.7-1 5.1a9.8 9.8 0 0 1-5.9 5.6c-1.3.4-2.7.6-4 .6h-2zm.8-69.2c-1.3 0-2 1.6-2 4.7v51.8c0 3.1.7 4.7 2 4.7h.4c1.3 0 2-1.6 2-4.7V26.6c0-3.1-.7-4.7-2-4.7h-.4zM225.7 44c0 2.4-.4 4.1-1 5.2a5.2 5.2 0 0 1-2.8 2.3c1 .3 2 1 2.7 2 .7 1.2 1.1 3 1.1 5.3v20.7c0 2-.3 3.6-1 5a9.4 9.4 0 0 1-5.9 5.3c-1.3.5-2.6.7-4 .7h-12.9v-76h12.9c1.4 0 2.7.2 4 .7 1.3.4 2.5 1 3.5 2 1 .9 1.9 2 2.5 3.5a13 13 0 0 1 .9 5.1v18.3zM214.3 48c1.1 0 1.7-1.5 1.7-4.4V27.2c0-3-.7-4.6-2-4.6h-2.4v25.3h2.7zm1.7 11.6c0-3-.6-4.4-1.9-4.4h-2.5v27.3h2.3c1.4 0 2.1-1.4 2.1-4.4V59.5zM253.7 44c0 2.4-.4 4.1-1 5.2a5.2 5.2 0 0 1-2.8 2.3c1 .3 2 1 2.7 2 .7 1.2 1.1 3 1.1 5.3v20.7c0 2-.3 3.6-1 5a9.4 9.4 0 0 1-5.9 5.3c-1.3.5-2.6.7-4 .7h-12.9v-76h12.9c1.4 0 2.7.2 4 .7 1.3.4 2.5 1 3.5 2 1 .9 1.9 2 2.5 3.5a13 13 0 0 1 .9 5.1v18.3zM242.3 48c1.1 0 1.7-1.5 1.7-4.4V27.2c0-3-.7-4.6-2-4.6h-2.4v25.3h2.7zm1.7 11.6c0-3-.6-4.4-1.9-4.4h-2.5v27.3h2.3c1.4 0 2.1-1.4 2.1-4.4V59.5zM267.6 14.5v68.8h9v7.2h-18.7v-76h9.7zM290 22.6V49h7.3V56H290v26.3h10v8h-19.7V14.6h19v8H290z" />
    <path d="M4 105v-9H0v9h4zm5.6 0v-9h-4v9h4zm2.7 0v-9h-.9v9h.9zm5.6 0v-9h-.8v9h.8zm2.7 0v-9h-.8v9h.8zM25.4 105h4v-9h-4v9zm5.6 0h1v-9h-1v9zm2.7 0h4v-9h-4v9zm5.7 0h1v-9h-1v9zm5.8 0h.8v-9h-.8v9zM51.6 105v-9h-.8v9h.8zm2.7 0v-9h-.8v9h.8zm6 0v-9h-3.9v9h4zm5.4 0v-9h-1v9h1zm5.7 0v-9h-4v9h4zM76.3 105h4v-9h-4v9zm5.6 0h1v-9h-1v9zm2.7 0h4v-9h-4v9zm8.7 0h.9v-9h-.9v9zm2.7 0h.9v-9H96v9zM102.5 105v-9h-.8v9h.8zm5.8 0v-9h-4v9h4zm2.5 0v-9h-.8v9h.8zm5.8 0v-9h-4v9h4zm5.7 0v-9h-.9v9h.9zM131 105v-9h-4v9h4zm5.6 0v-9h-4v9h4zm2.7 0v-9h-.8v9h.8zm5.7 0v-9h-.9v9h.9zm2.7 0v-9h-.9v9h.9zM156.4 105v-9h-4v9h4zm2.7 0v-9h-1v9h1zm2.5 0v-9h-.8v9h.8zm5.8 0v-9h-4v9h4zm5.6 0v-9h-.8v9h.8zM177.8 105h4v-9h-4v9zm5.7 0h1v-9h-1v9zm2.7 0h4v-9h-4v9zm5.6 0h1v-9h-1v9zm5.8 0h.8v-9h-.8v9zM204 105v-9h-.8v9h.9zm5.9 0v-9h-4v9h4zm2.5 0v-9h-.9v9h.9zm5.8 0v-9h-1v9h1zm5.6 0v-9h-4v9h4zM229.5 105v-9h-.9v9h.9zm5.7 0v-9h-4v9h4zm2.6 0v-9h-.9v9h.9zm5.8 0v-9h-1v9h1zm5.6 0v-9h-4v9h4zM254 105h.8v-9h-.8v9zm2.7 0h4v-9h-4v9zm5.6 0h.9v-9h-.9v9zm3.1 0h.9v-9h-.9v9zm5.3 0h4v-9h-4v9zM279.4 105h4v-9h-4v9zm5.6 0h1v-9h-1v9zm2.7 0h4v-9h-4v9zm8.8 0h.8v-9h-.8v9zm2.7 0h.8v-9h-.8v9z" />
    <path d="M4 9V0H0v9h4zm5.6 0V0h-4v9h4zm2.7 0V0h-.9v9h.9zm5.6 0V0h-.8v9h.8zm2.7 0V0h-.8v9h.8zM25.4 9h4V0h-4v9zM31 9h1V0h-1v9zm2.7 0h4V0h-4v9zm5.7 0h1V0h-1v9zm5.8 0h.8V0h-.8v9zM51.6 9V0h-.8v9h.8zm2.7 0V0h-.8v9h.8zm6 0V0h-3.9v9h4zm5.4 0V0h-1v9h1zm5.7 0V0h-4v9h4zM76.3 9h4V0h-4v9zm5.6 0h1V0h-1v9zm2.7 0h4V0h-4v9zm8.7 0h.9V0h-.9v9zM96 9h.9V0H96v9zM102.5 9V0h-.8v9h.8zm5.8 0V0h-4v9h4zm2.5 0V0h-.8v9h.8zm5.8 0V0h-4v9h4zm5.7 0V0h-.9v9h.9zM131 9V0h-4v9h4zm5.6 0V0h-4v9h4zm2.7 0V0h-.8v9h.8zm5.7 0V0h-.9v9h.9zm2.7 0V0h-.9v9h.9zM156.4 9V0h-4v9h4zm2.7 0V0h-1v9h1zm2.5 0V0h-.8v9h.8zm5.8 0V0h-4v9h4zm5.6 0V0h-.8v9h.8zM177.8 9h4V0h-4v9zm5.7 0h1V0h-1v9zm2.7 0h4V0h-4v9zm5.6 0h1V0h-1v9zm5.8 0h.8V0h-.8v9zM204 9V0h-.8v9h.9zm5.9 0V0h-4v9h4zm2.5 0V0h-.9v9h.9zm5.8 0V0h-1v9h1zm5.6 0V0h-4v9h4zM229.5 9V0h-.9v9h.9zm5.7 0V0h-4v9h4zm2.6 0V0h-.9v9h.9zm5.8 0V0h-1v9h1zm5.6 0V0h-4v9h4zM254 9h.8V0h-.8v9zm2.7 0h4V0h-4v9zm5.6 0h.9V0h-.9v9zm3.1 0h.9V0h-.9v9zm5.3 0h4V0h-4v9zM279.4 9h4V0h-4v9zm5.6 0h1V0h-1v9zm2.7 0h4V0h-4v9zm8.8 0h.8V0h-.8v9zm2.7 0h.8V0h-.8v9z" />
  </svg>
);

Logo.propTypes = {
  className: PropTypes.string,
};

Logo.defaultProps = {
  className: undefined,
};

export default Logo;