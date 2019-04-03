import { createGlobalStyle, keyframes } from 'styled-components';
import { yellow } from '../lib/colors';

const spinnerAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export default createGlobalStyle`
  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${yellow};
  }

  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    transform: rotate(3deg) translate(0px, -4px);
    opacity: 1;
    box-shadow: 0 0 10px ${yellow}, 0 0 5px ${yellow};
  }

  /* Remove these to get rid of the spinner */
  #nprogress .spinner {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }

  #nprogress .spinner-icon {
    box-sizing: border-box;
    width: 18px;
    height: 18px;
    animation: ${spinnerAnimation} .4s linear infinite;
    border: solid 2px transparent;
    border-radius: 50%;
    border-top-color: ${yellow};
    border-left-color: ${yellow};
  }

  .nprogress-custom-parent {
    position: relative;
    overflow: hidden;
  }

  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }
`;
