import { createGlobalStyle } from 'styled-components';
import { dark, silver } from '../../lib/colors';

export default createGlobalStyle`
  html {
    box-sizing: border-box;
    line-height: 1.15;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-text-size-adjust: 100%;
  }
  *, *::before, *::after {
    box-sizing: inherit;
  }
  button,[type='button'],[type='reset'],[type='submit']{
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-appearance: button;
  }
  body {
    margin: 0;
    background: ${dark};
    font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
    font-weight: 300;
  }
  body, a {
    color: ${silver};
  }
`;
