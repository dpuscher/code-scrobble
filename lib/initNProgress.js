import Router from 'next/router';
import NProgress from 'nprogress';

let progressTimeout = null;

const stopProgress = () => {
  clearTimeout(progressTimeout);
  NProgress.done();
};

export default () => {
  NProgress.configure({ showSpinner: false });

  Router.events.on('routeChangeStart', () => {
    progressTimeout = setTimeout(NProgress.start, 100);
  });

  Router.events.on('routeChangeComplete', stopProgress);
  Router.events.on('routeChangeError', stopProgress);
};
